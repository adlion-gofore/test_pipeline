---
title: "Delivery Timeline"
description: "Development phases, milestone schedule, and min/max delivery estimates for the Avant UDS library."
date: 2026-05-18
---

## Phases

### Phase 1 - Pre-study

**Target: w20-w24 (13 May - 13 June 2026) (some team members are in vacations so not the whole period is used)**

| Task                                       | Notes                                                     | Status      |
| ------------------------------------------ | --------------------------------------------------------- | ----------- |
| Review existing Rust libraries             | automotive_diag, ecu_diagnostics, automotive (I-CAN-hack) | in progress |
| Confirm requirements and service list      | Resolve proposed vs agreed services with Avant            | in progress |
| Finalize architecture and interface design | Transport trait, layer boundaries, feature flags          | in progress |
| Assess user-space ISO-TP need              | Check kernel version on Avant RCU hardware                | not started |
| Resolve Windows CAN adapter open item      | Which vendor SDKs must be wrapped                         | not started |
| Resolve client vs server scope             | Recommendation clientonly for initial scope               | not started |

---

### Phase 2 - Core Implementation (Linux target)

**Target: w26-w32 (22 June - 7 August 2026)**

| Task                        | Notes                                                 | Status      |
| --------------------------- | ----------------------------------------------------- | ----------- |
| Repository setup            | GitHub, Cargo workspace, feature flags                | not started |
| Protocol layer              | Service definitions, NRC enum, request/response types | not started |
| UDS session manager         | Session state machine, TesterPresent heartbeat task   | not started |
| Transport abstraction trait | Send/receive PDU interface, error type separation     | not started |
| Linux ISO-TP backend        | socketcan + socketcan-isotp, async tokio integration  | not started |
| Mock transport              | For unit testing without hardware                     | not started |
| Unit and integration tests  | Virtual CAN (vcan) on Linux for CI                    | not started |

---

### Phase 3 - Python Bindings

**Target: w33-w36 (10 August - 4 September 2026) - ~4 weeks**

| Task                                   | Notes                                        | Status      |
| -------------------------------------- | -------------------------------------------- | ----------- |
| PyO3 + maturin project setup           | Build pipeline for Python wheel              | not started |
| Bind UdsClient and all agreed services | Async methods via pyo3-asyncio               | not started |
| Python-level error types               | Map Rust error variants to Python exceptions | not started |
| Basic Python usage test                | Smoke test against vcan or real hardware     | not started |

---

### Phase 4 - Hardening and Documentation

**Target: w34-w37 (August - September 2026)**

These tasks improve quality and maintainability but do not block the Cube product from using the library.

| Task                                 | Notes                                                     | Status      |
| ------------------------------------ | --------------------------------------------------------- | ----------- |
| Edge case handling                   | Session timeout recovery, NRC 0x78 response pending retry | not started |
| Endianness and multi-arch validation | Test on multi ARM target if available                     | not started |
| Full API documentation               | Rust doc comments, Python usage guide                     | not started |
| Extended integration tests           | Real hardware test scenarios                              | not started |
| Final review with Avant              | Hand over on completed library                            | not started |

---

### Phase 5 - Windows Backend

**Target: w35+**

Depends on resolution of the open item. Which CAN adapter vendor to support on Windows. Each vendor requires a separate backend wrapping their SDK via Rust FFI. Cannot be planned in detail until the adapter decision is made.

---

### Phase 6 - DoIP Backend _(nice to have)_

**Target: TBD**

Scoped as a future phase. Requires DoIP crate evaluation (`doip-tokio`, `doip-codec`) and a DoIP-capable test environment. Avant need to decide.

---

## Min / Max Estimates

### Minimum (optimistic)

| Milestone                      | Date                     |
| ------------------------------ | ------------------------ |
| Pre-study complete             | w24 - 13 June 2026       |
| Core Linux implementation done | w30 - 25 July 2026       |
| Python bindings done           | w35 - 29 August 2026     |
| Hardening and full docs done   | w37 - 11 September 2026  |
| Windows backend (1st vendor)   | w40 - early October 2026 |
| DoIP backend                   | TBD                      |

### Maximum (conservative)

| Milestone                      | Date                    |
| ------------------------------ | ----------------------- |
| Pre-study complete             | w25 - 20 June 2026      |
| Core Linux implementation done | w32 - 7 August 2026     |
| Python bindings done           | w36 - 4 September 2026  |
| Hardening and full docs done   | w38 - 18 September 2026 |
| Windows backend (1st vendor)   | w43 - late October 2026 |
| DoIP backend                   | TBD                     |

---

## Risks

| Risk                                         | Impact                                             | Mitigation                                                                                                                                                                  |
| -------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Windows CAN adapter not decided              | Blocks Windows phase entirely                      | Resolve in pre-study.                                                                                                                                                       |
| Avant RCU kernel too old for socketcan-isotp | Forces userspace ISO-TP implementation, +2-3 weeks | Assess kernel version in pre-study phase                                                                                                                                    |
| Scope expansion (server side, DTC)           | Delays core delivery                               | Keep initial scope to client-only. Defer formally in pre-study review. Most libs have only client side implementation adding on top only the required server side handlers. |
| PyO3/tokio async integration complexity      | +1-2 weeks                                         | Prototype pyo3-asyncio early in Phase 3                                                                                                                                     |
| Rust cross-compilation issues on target HW   | +1 week                                            | Test crosscompile to ARM target early in Phase 2                                                                                                                            |
