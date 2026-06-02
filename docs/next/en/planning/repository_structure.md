---
title: "Repository Structure"
description: "Cargo workspace layout for the Avant UDS library, crate responsibilities, and dependency relationships."
date: 2026-05-27
---

## Overview

The library is organised as a single Cargo workspace containing several crates. Each crate has one clear responsibility. Backends are not split by operating system, they are split by what they provide to the layer above. A backend either delivers full UDS PDUs to the service layer, or it delivers raw CAN frames to a userspace ISO-TP implementation that then provides the PDUs.

This keeps the dependency graph clean and avoids naming crates after an operating system unless they genuinely are tied to one. Vendor backends do not depend on platform wrapper crates. A downstream user picks the crates that match their hardware and runtime environment.

## Workspace Layout

```
workspace/
  uds-transport/    Trait definitions and mock transport
  uds-core/         UDS service layer and session manager
  uds-isotp/        Userspace ISO-TP implementation
  uds-socketcan/    Linux kernel ISO-TP and raw CAN access
  uds-pcan/         PCAN vendor backend, raw CAN frames
  uds-kvaser/       Kvaser vendor backend, raw CAN frames
  uds-vector/       Vector vendor backend, raw CAN frames
  uds-doip/         DoIP backend (future)
  uds-py/           Python bindings via PyO3 and maturin
```

## Crate Responsibilities

### uds-transport

Holds the two trait definitions used across the workspace. The `UdsTransport` trait represents anything that can send and receive UDS PDUs. The `RawCan` trait represents anything that can send and receive raw CAN frames. A mock transport that implements `UdsTransport` also lives here so unit tests in any crate can run without real hardware.

This crate has no external dependencies beyond what is needed to define the traits and compiles on any target.

### uds-core

Contains the UDS service layer and the session manager. Every UDS service is implemented as an async method on the `UdsClient` struct. The session manager runs as a background tokio task and keeps the active session alive with periodic TesterPresent frames. This crate depends only on `uds-transport`. It has no knowledge of CAN, ISO-TP, or any specific backend. Swapping a backend requires no changes here.

### uds-isotp

Userspace implementation of ISO 15765-2. Takes any type that implements `RawCan` and exposes a type that implements `UdsTransport`. Handles segmentation, flow control, and timeouts in Rust rather than relying on a kernel driver.

Used on Windows where there is no kernel ISO-TP, and on Linux installations where the kernel is too old to support the `CAN_ISOTP` socket type. The pre-study still has to confirm whether the Avant RCU kernel supports kernel-level ISO-TP. If it does not, this crate covers that case without any additional implementation work.

### uds-socketcan

Linux-only crate that wraps the kernel SocketCAN interface. Provides two things in one crate. First, an implementation of `UdsTransport` that uses the kernel ISO-TP socket (`AF_CAN`, `SOCK_DGRAM`, `CAN_ISOTP`). Second, an implementation of `RawCan` for raw frame access. Most Linux users only need the first. The raw frame access exists for the case where the kernel lacks ISO-TP support and userspace handling via `uds-isotp` is required.

Built on top of the `socketcan` and `socketcan-isotp` crates from the Rust ecosystem.

### uds-pcan, uds-kvaser, uds-vector

One crate per CAN adapter vendor. Each wraps the vendor SDK through Rust FFI and implements `RawCan`. None of them implement `UdsTransport` directly. To use any of them as a UDS transport, the user pairs the vendor crate with `uds-isotp`.

Each vendor crate has its own build script for locating the vendor SDK, setting link flags, and handling any runtime libraries. Keeping them as separate crates means each vendor backend can be maintained independently. Adding a new vendor in the future is one new crate, not edits to existing code.

Only the vendor backends that Avant actually requires will be implemented. The exact set depends on the open item from the pre-study about which Windows adapters are in scope.

### uds-doip

DoIP backend (ISO 13400) running over UDP/IP. Implements `UdsTransport` directly because DoIP carries its own framing and does not need ISO-TP. Operating system agnostic. Scoped as a later phase, included in the workspace layout only to show how it fits.

### uds-py

The Python binding layer. A `cdylib` crate built with maturin and PyO3 that re-exports the `UdsClient` and all service methods into Python. Async methods are wrapped with `pyo3-asyncio` on the tokio runtime. The Python API mirrors the Rust API as closely as possible so that documentation applies to both.

This crate has to be separate from `uds-core` because maturin requires a dedicated `cdylib` crate to produce the Python wheel.

## Dependency Graph

```
uds-py
  uds-core
    uds-transport

uds-socketcan    depends on uds-transport, implements UdsTransport and RawCan
uds-isotp        depends on uds-transport, implements UdsTransport on top of RawCan
uds-pcan         depends on uds-transport, implements RawCan
uds-kvaser       depends on uds-transport, implements RawCan
uds-vector       depends on uds-transport, implements RawCan
uds-doip         depends on uds-transport, implements UdsTransport
```

`uds-core` never pulls in a backend crate as a dependency. The choice of backend is made at the application level by the code that constructs the `UdsClient`. This is what allows the same `uds-core` to run on Linux with SocketCAN, on Windows with any vendor adapter, or over DoIP, without recompilation of the core.

## User Composition

The set of crates a downstream user pulls in depends on the hardware and operating system they run on.

| Scenario                               | Crates required                       |
| -------------------------------------- | ------------------------------------- |
| Linux with kernel ISO-TP (normal case) | uds-core, uds-socketcan               |
| Linux with old kernel lacking CAN_ISOTP | uds-core, uds-socketcan, uds-isotp    |
| Windows with PCAN adapter              | uds-core, uds-pcan, uds-isotp         |
| Windows with Kvaser adapter            | uds-core, uds-kvaser, uds-isotp       |
| Windows with Vector adapter            | uds-core, uds-vector, uds-isotp       |
| DoIP, any operating system             | uds-core, uds-doip                    |
| Python on Linux                        | uds-py (pulls the rest transitively)  |

## Reasoning

Splitting by capability rather than by operating system has several practical benefits.

Vendor backends do not need to be tied to a platform. PCAN drivers exist for both Windows and Linux. A future Linux user with a PCAN adapter can pull `uds-pcan` directly, with nothing in the crate name or structure suggesting it is Windows-only.

Userspace ISO-TP becomes a single shared implementation. The same `uds-isotp` crate that covers Windows also covers the old-kernel Linux case identified as a risk in the pre-study. No duplication and no parallel implementations to keep in sync.

DoIP fits the same pattern without forcing a new naming convention. It implements `UdsTransport` directly and sits next to the CAN backends in the workspace without depending on any of them.

Build complexity stays in the crates that actually need it. Each vendor crate has its own build script and FFI layer. The core crates remain pure safe Rust with no build scripts and no unsafe code.

Feature flags within crates are kept to a minimum. Because each backend is its own crate, a user simply does not depend on what they do not need. There is no need for cross-platform feature gating in `uds-core` or `uds-transport`. The only feature flag worth keeping in `uds-core` is one for optional serde derives on the protocol types, used for logging and test fixtures.

## Open Items Affecting Structure

1. The set of vendor crates to implement depends on the Windows adapter decision from the pre-study. Until that decision is made, only the directory layout and trait definitions can be finalised.
2. Whether `uds-isotp` is needed in the initial Linux scope depends on the kernel assessment of the target hardware. If the kernel is modern enough, this crate can be deferred to a later phase and built only when the first non-Linux backend lands.
