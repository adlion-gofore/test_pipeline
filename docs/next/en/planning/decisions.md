---
title: "Design Decisions"
description: "Decisions taken during pre-study that lock the scope and shape of the initial Avant UDS library."
date: 2026-05-27
---

## Overview

This document records the decisions taken so far during the pre-study phase. Each decision sets a boundary on what the initial implementation will and will not cover. Any later change to these decisions will affect the [delivery timeline](delivery_timeline.md) and the [repository structure](repository_structure.md).

## Decisions

### Linux is the primary target

The library is built for embedded Linux first. The first usable release will target Linux only. All Phase 2 work and the initial test setup target Linux through SocketCAN and the kernel ISO-TP socket. Windows support is a secondary target and lands in a later phase once the Linux build is stable.

This matches how the library will actually be used. The Cube product runs on Linux and is the first consumer.

### No userspace ISO-TP in the initial scope

Userspace ISO-TP is dropped from the initial implementation. The Linux backend will rely on the kernel ISO-TP socket through `socketcan-isotp` and nothing else. The `uds-isotp` crate listed in the [repository structure](repository_structure.md) will not be implemented in the first delivery.

Current RCUs are known to support the kernel ISO-TP socket type, so the implementation proceeds on that assumption. Avant should formally confirm this before Phase 2 starts to remove any remaining uncertainty.

Userspace ISO-TP becomes relevant again in two cases. First, once Windows support is added, since Windows has no kernel ISO-TP. Second, if a future Linux target ships with a kernel that lacks the ISO-TP socket. Neither case is in scope for the initial delivery.

### Kvaser is the selected Windows CAN adapter

Kvaser is the preferred Windows CAN adapter and was taken into study during the pre-study phase. The Kvaser CANlib SDK was reviewed and it exposes the entry points needed to implement the `RawCan` trait through Rust FFI. The integration is feasible and no blockers were found.

The adapter choice is not yet final. Avant needs to confirm Kvaser as the selected adapter before Phase 5 starts. The workspace structure allows other vendors to be added later as standalone crates, so the decision does not need to be made before the Windows phase begins.

Windows support is deferred to Phase 5. The transport and ISO-TP approach for Windows will be assessed when that phase starts, based on what the selected SDK provides at that point.

### No Python bindings in the initial scope

Python bindings are dropped from the initial delivery. The `uds-py` crate is not built and the PyO3 and maturin work originally planned in Phase 3 is removed from the plan.

The reason is that the Cube product is fully in Rust. The library will be consumed directly from Rust code with no Python layer in between. Adding Python bindings now would add work that no consumer is asking for.

Python bindings remain possible in a later phase if Avant decides to expose the library to existing Python services or tooling. The repository structure is laid out so that `uds-py` can be added as a new workspace crate later without any changes to the core crates.

## Impact on the Plan

These decisions cut visible scope from the initial delivery.

| Removed from initial scope          | Moved to                              |
| ----------------------------------- | ------------------------------------- |
| Userspace ISO-TP (`uds-isotp`)      | Phase 5, alongside the Windows backend |
| Python bindings (`uds-py`)          | Future phase if requested by Avant    |
| Windows backend (Kvaser)            | Phase 5                               |
| PCAN and Vector backends            | Out of scope, not planned             |

The initial delivery is now a Linux only Rust library built around `uds-core`, `uds-transport`, and `uds-socketcan`. The mock transport in `uds-transport` covers the test setup. 

