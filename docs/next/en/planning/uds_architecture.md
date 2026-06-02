---
title: "UDS Architecture"
description: "Architecture design for the Avant UDS library - layering, backends, crate selection, and Python bindings."
date: 2026-05-18
---


## Overview

The library is a mostly client-side (tester)(To be further refined on the role during meetings) UDS implementation written in Rust. It targets embedded Linux as the primary platform, with Windows as a secondary target. The design uses a layered architecture so that backends (CAN, DoIP) can be swapped without touching the UDS service layer.

The public API is exposed both as a native Rust crate and through Python bindings via PyO3/maturin.

---

## Layers in Detail

### UDS Service Layer

Implements all required UDS services as typed request/response pairs. Protocol byte definitions, service identifiers, response codes, and NRC (Negative Response Code ) enums, are implemented from scratch within the library rather than imported from an external crate. This avoids taking a hard dependency on a third-party library whose API or data model may change between releases, which would force interface changes up the stack.

Existing open-source implementations such as `automotive_diag` are used as verified references during development to cross-check byte values, service encodings, and edge-case behaviour against a known-working baseline. The definitions are our own but the reference material is theirs.

**Required services:**

| Service | SID | Status |
|---|---|---|
| DiagnosticSessionControl | 0x10 | agreed |
| ECUReset | 0x11 | agreed |
| SecurityAccess | 0x27 | agreed |
| ReadDataByIdentifier | 0x22 | agreed |
| WriteDataByIdentifier | 0x2E | agreed |
| RoutineControl | 0x31 | agreed |
| RequestDownload | 0x34 | agreed |
| RequestUpload | 0x35 | agreed |
| TransferData | 0x36 | agreed |
| RequestTransferExit | 0x37 | agreed |
| RequestFileTransfer | 0x38 | agreed |
| TesterPresent | 0x3E | agreed |
| CommunicationControl | 0x28 | proposed |
| ControlDTCSetting | 0x85 | proposed |
| LinkControl | 0x87 | proposed |

DTC services are explicitly out of scope.

Each service is implemented as an async function on a `UdsClient` struct. Positive and negative responses map to typed `Result` variants. Negative Response Codes (NRC) are defined as an owned enum within the library.

### UDS Session Manager

Tracks the active diagnostic session (Default, Programming, Extended) and automatically sends periodic `TesterPresent` frames to keep the session alive. Runs as a background tokio task. The session manager is transparent to callers the `UdsClient` handles it internally (Result on how other crates have implemented it).

### Transport Abstraction

A single async trait defines the contract between the UDS layer and any backend. The trait exposes two operations. Sending a raw UDS PDU down to the transport and receiving one back up  with no knowledge of what sits below. This boundary is the key design decision that keeps the UDS service layer entirely independent of physical transport details.

Any type that satisfies the trait can plug in as a backend. For example  the Linux SocketCAN+ISO-TP stack, a future Windows FFI adapter, a DoIP socket, or a mock implementation used in unit tests. Swapping the backend requires no changes to the UDS service layer or session manager above it.

Error handling at this boundary distinguishes transport-level failures (frame loss, timeout, bus-off) from UDS-level negative responses, so callers always know which layer a failure came from.

### ISO-TP Backend (Linux)

Uses `socketcan` + `socketcan-isotp` to talk to the kernel's native ISO-TP socket interface (`AF_CAN`, `SOCK_DGRAM`, `CAN_ISOTP`). This offloads all frame segmentation and flow control to the kernel, which is the most robust approach on Linux.

The Linux backend implements `UdsTransport` directly on top of an async `socketcan-isotp` socket.

A userspace ISO-TP implementation where segmentation and flow control are handled in the library rather than the kernel may be considered in a later phase if target environments require it (e.g. older kernels without ISO-TP socket support, or non-Linux POSIX systems). Because the transport trait isolates this layer, switching between kernel and user-space ISO-TP would not affect any code above it. *(Action point: assess user-space ISO-TP need based on target hardware during pre-study. Check if older versions of Avnant RCUs do have al the kernel headers for socketcan and offloading on kernel)*

### ISO-TP Backend (Windows)

No mature native Rust solution exists for Windows CAN. Unlike Linux where SocketCAN provides a unified kernel interface, Windows has no common hardware abstraction. Each CAN adapter vendor ships its own SDK and driver. This means the Windows layer will not be a single backend but rather one backend per supported vendor adapter (e.g. PCAN, Kvaser, Vector), each implementing the transport trait independently.

Each vendor backend integrates against that vendors SDK. The SDK may be written in C, C++, or any other language. What matters is that it can be compiled into a linkable library that Rust can call via FFI. Rust `unsafe` FFI boundary handles the interop, keeping the rest of the library fully safe. The transport trait ensures none of this vendor specific complexity leaks upward into the UDS service layer.

The specific adapter or adapters to support is an **open item** from the kick-off. This decision must be made before any Windows backend work begins, as it determines which SDKs need to be wrapped.

### DoIP Backend (nice to have)

DoIP replaces CAN+ISO-TP with UDP/IP as the physical transport. The `UdsTransport` trait applies identically. A `DoipTransport` struct sends and receives UDS PDUs over a DoIP connection. Candidate crates: `doip-tokio`, `doip-codec`. Scoped for a later phase after the Linux CAN backend is complete.

---

## Cross-cutting Concerns

### Endianness

Rust standard library provides `u16::from_be_bytes` / `to_be_bytes` etc. All multi-byte values in UDS are big-endian (network byte order). The service layer handles all byte order conversions explicitly. No unaligned memory access is used. All reads and writes go through safe byte-slice operations.

### Architecture portability

The library is compiled with Cargo's cross-compilation support. The `socketcan` and `socketcan-isotp` crates are gated behind a `backend-socketcan` feature flag so that Windows and embedded builds do not pull in Linux-specific dependencies. A `backend-doip` feature flag similarly gates the DoIP backend.

### Python bindings

PyO3 + maturin expose the `UdsClient` and all service methods to Python. Async methods are wrapped with `pyo3-asyncio` (tokio runtime). The Python API mirrors the Rust API closely so that documentation applies to both.

---

## Crate Selection

| Role | Crate | Reason |
|---|---|---|
| Protocol definitions | own implementation | Avoids upstream API dependency; `automotive_diag` used as reference only |
| Async runtime | `tokio` | Industry standard, required by socketcan and doip crates |
| Linux CAN | `socketcan` | Mature, async, kernel-native |
| Linux ISO-TP | `socketcan-isotp` | Kernel ISO-TP socket, offloads segmentation/flow control |
| DoIP (future) | `doip-tokio` / `doip-codec` | Async DoIP, evaluate at DoIP phase |
| Python bindings | `pyo3` + `maturin` | Standard Rust/Python bridge |
| Serialisation | `serde` | Optional. Useful for logging and test fixtures. It will tie logging to that crate. |

`ecu_diagnostics` is excluded as a dependency due to GPL-3.0 license incompatibility with the planned commercial licensing model. However, its source code may be studied as a reference for implementation patterns and service logic, provided no code is directly copied or derived from it.

---

## Open Items

1. **Client vs server** - during kick-off there were questions whether both sides should be covered. Recommendation: client only for the initial scope. Server support can be a later phase.
2. **Windows CAN adapter** - which hardware adapter must be supported on Windows? This drives the FFI layer design entirely.
3. **When is the library needed for CUBE?** - Timo mentioned August 2026. 
4. **DoIP phasing** - confirm DoIP is out of scope for the initial implementation project and tracked as a separate item (This was a suggestion).

See [Delivery Timeline](delivery_timeline.md) for the full phase plan, milestone schedule, and min/max estimates.

## Architecture Diagram

{{< drawio "uds_architecture.drawio" >}}


