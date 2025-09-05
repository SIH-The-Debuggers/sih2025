# Blockchain Architecture & Flow Guide

## Problem Statement Mapping
The system addresses Smart Tourist Safety & Incident Response by providing transparency, tamper-evident logs, decentralized identity, zone governance, and verifiable reputation on-chain. Off-chain AI, geo-fencing services, and analytics feed hashed attestations to preserve privacy while enabling auditability.

| Problem Need | On-Chain Contribution |
|--------------|-----------------------|
| Tourist digital identity & trust | Soulbound NFT with KYC hash + revocation flags. |
| Vendor authenticity | Vendor identity tokens + role gating. |
| Secure incident logging | Immutable incident creation events & lifecycle state machine. |
| Geo-fence safety zones | Registry of zone hashes and metadata (risk levels, activation). |
| Evidence integrity | Hash anchoring (media / AI inference / sensor data). |
| Rapid response coordination | Assigned responder recorded + status transitions. |
| Reputation & compliance | Oracle-updated scores for entities (vendors, zones). |
| Privacy | Only hashes / references stored; sensitive data off-chain. |

## Core Contracts & Responsibilities
- AccessManager: roles, pausing, oracle authorization.
- DigitalIdentity: tourist & vendor identities (non-transferable), 1 per wallet.
- GeoFenceRegistry: register / version geo zones.
- IncidentManager: report & manage lifecycle of incidents and attach evidence hashes.
- ReputationOracle: accept signed scores (AI analytics, safety compliance metrics) without storing raw data.
- TouristSafetyHub: unified alert & automated risk signaling interface tying sub-systems.

## Data Minimization Strategy
Personally identifiable information (PII), raw media, and precise coordinates are NEVER on-chain. Instead we store:
- keccak256 hashes of KYC bundle documents
- geometry hash of zone shapes
- content hashes / IPFS CIDs for evidence & metadata JSON
- zoneId references instead of lat/long

## Step-by-Step Flows
### 1. Tourist Onboarding
1. Off-chain KYC / verification performed (Gov portal / vendor kiosk).
2. System computes `kycHash = keccak256(serializedData)`.
3. Admin calls `mintTourist(address, kycHash)` in `DigitalIdentity`.
4. Soulbound token ID returned; wallet now recognized on-chain.
5. Off-chain DID document references tokenId (optional enrichment).

### 2. Vendor Registration
Similar to tourist onboarding using `mintVendor` producing a vendor identity NFT enabling service participation.

### 3. Geo-Fence Zone Creation
1. Authorized admin encodes polygon(s) into canonical binary (e.g., GeoJSON normalized + CBOR).
2. Compute `geometryHash`.
3. Call `registerZone(geometryHash, metadataURI)` storing zone as active version 1.
4. Future adjustments call `updateZone` (increments version, preserves audit trail via events).

### 4. Incident Reporting & Response
1. Tourist (or any wallet) calls `reportIncident(zoneId, category, detailsURI)`.
2. Off-chain system listens to `IncidentReported` event, triggers workflow dashboard.
3. Admin assigns a responder with `assignResponder`.
4. Responder acknowledges -> `markResponding`.
5. Responder resolves -> `resolveIncident(id, closeDirectly)`.
6. If not directly closed, admin finalizes with `closeAfterResolution`.
7. Evidence (media hash, AI classification results) appended anytime via `addEvidenceHash`.

### 5. Distress Alert (Rapid)
1. Tourist app sends `sendDistress(zoneId, geoHashRef, metaURI)` on `TouristSafetyHub`.
2. Event consumed by real-time notification service -> push to responders.
3. Optional creation of incident (off-chain service may auto-call `reportIncident`).

### 6. Automated Risk Signal
1. AI model flags anomaly in zone (crowd density, hazard).
2. Authorized oracle/responder calls `emitAutomatedRisk(zoneId, riskType)`.
3. Event triggers dashboards & possibly dynamic guidance to tourists.

### 7. Reputation Update
1. Off-chain analytics compute new score (0-100 or domain specific) for entity.
2. Prepare message fields (entity, scoreType, newScore, nonce, contract, chainid).
3. Oracle signer signs hash; backend calls `updateScore` with signature.
4. Contract verifies oracle role & signature -> stores score.

## Access Control Matrix (Simplified)
| Action | Tourist | Vendor | Responder | Admin | Oracle |
|--------|---------|--------|-----------|-------|--------|
| Report Incident | Yes | Yes | Yes | Yes | - |
| Assign Responder | - | - | - | Yes | - |
| Mark Responding | - | - | Yes (assigned) | - | - |
| Resolve Incident | - | - | Yes (assigned) | - | - |
| Close After Resolution | - | - | - | Yes | - |
| Add Evidence | Reporter | Reporter | Assigned | Admin | - |
| Register Zone | - | - | - | Yes | - |
| Update Zone | - | - | - | Yes | - |
| Mint Identities | - | - | - | Yes | - |
| Send Distress | Yes | Yes | Yes | Yes | - |
| Automated Risk Signal | - | - | Yes | Yes | - |
| Update Reputation | - | - | - | - | Signed Oracle |

## Off-Chain Components (Interface Points)
- Mobile App: identity binding, distress alerts, local risk advisory.
- AI Analytics: crowd/hazard detection -> Automated Risk events & reputation scoring.
- Storage Layer (IPFS / Cloud): raw media, zone geometry, details JSON.
- Orchestration / API Backend: listens to events, enforces business logic, meta-transactions if needed.

## Privacy & Compliance
- Hash-only on-chain; revocation possible via identity `active` flag.
- Optional future: zero-knowledge proofs for selective disclosure (not in MVP code).

## Extension Ideas
- Escalation logic contract (multi-responder coordination)
- Zone-specific risk scoring aggregated on-chain
- Modular soulbound attestation badges (safety training completed, etc.)
- Meta-transactions + session keys for gasless UX.

---
This document guides blockchain integration for the MVP.
