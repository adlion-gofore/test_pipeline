---
title: "Existing UDS Libraries"
description: "Notes on existing Rust UDS and automotive diagnostic libraries taken in consideration for the Avant UDS pre-study."
date: 2026-05-18
---

## automotive_diag

**Crate / Repo:** https://github.com/oxibus/automotive_diag

**License:** MIT OR Apache-2.0

**Description:** Low-level, `no_std` compatible collection of structs and enums covering UDS (ISO-14229-1), KWP2000 (ISO-14230), OBD-II (ISO-9141), and DoIP (ISO-13400) protocol definitions. Has enum-to-byte conversions for all major service identifiers and response codes. Doesn't implement any transport logic, session management, or security key handling. It's just a protocol definitions layer.

---

## ecu_diagnostics

**Crate / Repo:** https://github.com/rnd-ash/ecu_diagnostics

**License:** GPL-3.0

**Description:** ECU diagnostic client covering UDS, KWP2000, and OBD-II. Has a high-level client API with structured request/response handling, FFI bindings for C/C++ interop, and a protocol server abstraction. Hardware support is mainly through the Windows PassThru (SAE J2534) API, with no native Linux SocketCAN integration.

---

## automotive (I-CAN-hack)

**Crate / Repo:** https://github.com/I-CAN-hack/automotive

**License:** MIT

**Description:** Async library combining CAN adapter support, ISO-TP transport, and a UDS client. Supports SocketCAN on Linux and the panda adapter (cross-platform via USB). Built for multi-ECU parallel communication using async/await.

---

## libautomotive

**Crate / Repo:** https://github.com/shishir-dey/libautomotive

**License:** MIT

**Description:** Early-stage library with an OSI-inspired architecture covering CAN/CAN-FD, J1939, ISO-TP, UDS, and OBD-II. MIT licensed. The architecture is well thought out but the implementation isn't there yet - no releases published, API is unstable, and barely anyone is using it.

---

## socketcan-isotp

**Crate / Repo:** https://github.com/marcelbuesing/socketcan-isotp  
**Crate:** https://crates.io/crates/socketcan-isotp

**License:** MIT

**Description:** Rust bindings for the Linux kernel's SocketCAN ISO-TP interface. Has blocking and async access to ISO 15765-2 framing through the kernel's native `AF_CAN` socket layer.

---

## socketcan

**Crate:** https://crates.io/crates/socketcan

**License:** MIT

**Description:** Rust bindings for Linux SocketCAN, fairly mature. Supports async via tokio, async-std, and smol. Gives access to raw CAN frames, CAN-FD, and filtering through the kernel's native `AF_CAN` interface.

---


## Crates which may help

## DoIP crates

**Repos / Crates:**
- https://github.com/marcelbuesing/doip
- https://crates.io/crates/doip-tokio
- https://crates.io/crates/doip-codec

**License:** Various (MIT / Apache-2.0)

**Description:** A few small crates covering DoIP (ISO 13400) client/server, async tokio integration, and message encoding/decoding. None are mature or widely used.
