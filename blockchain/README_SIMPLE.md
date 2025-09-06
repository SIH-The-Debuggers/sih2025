# Smart Tourist Safety – Blockchain Layer (Simple Guide)

## 1. What You Asked For
You wanted a blockchain part for a Smart Tourist Safety & Incident Response System using AI, Geo‑Fencing and a Blockchain-based Digital ID. Goal: ONLY store a tamper‑proof anchor (hash + DID URI) for each Digital Tourist ID (DTID) without putting any personal data on-chain.

## 2. What Was Built
Two scopes are present so you can choose:

A. Anchor-Only MVP (your primary requirement)
- Contract: `TouristIDRegistry.sol` – stores (anchorHash, didUri) per address + version + timestamp.
- Purpose: Proves an identity bundle hasn’t been changed since issuance (audit trail via tx hash).
- No PII on-chain: only a hash + a DID URI pointer.

B. Extended Trust Layer (optional, future)
- Other contracts (already scaffolded): identities, incidents, zones, reputation, alerts (not required for your minimal anchor use‑case). You can ignore them for now.

## 3. Core Files (Anchor Mode Focus)
| File | What it does |
|------|--------------|
| `contracts/TouristIDRegistry.sol` | Minimal registry for DTID integrity (hash + DID URI). |
| `tasks/registry.ts` | Hardhat tasks: deploy, register, update, get anchor. |
| `test/registry.test.ts` | Test for register → update → adminUpdate flow. |
| `README_SIMPLE.md` (this) | Plain explanation. |
| `README.md` | Detailed / extended scope documentation. |
| `docs/BLOCKCHAIN_SCOPE.md` | Scope comparison (anchor vs full). |

## 4. How the Anchor Flow Works (Step by Step)
1. Off-chain backend receives tourist data (profile, trip, emergency contacts).
2. Backend normalizes & encrypts PII (AES-GCM). Nothing sensitive goes to chain.
3. It builds a minimal canonical JSON: `{ did, tripId, contacts_min }`.
4. Computes `anchorHash = keccak256(canonicalBytes)`.
5. Calls `register(anchorHash, didUri)` on `TouristIDRegistry` (Sepolia testnet now).
6. Saves `anchorHash`, `txHash`, and a signed QR payload containing `anchorHash` in the database.
7. Verification later:
   - Scanner reads QR → extracts `anchorHash`.
   - Backend calls `getLatest(subjectAddress)`.
   - If on-chain hash == QR hash → Valid. If different → Updated/Revoked.
8. If the ID data changes (rotation), backend computes a new hash and calls `update(...)` (or `adminUpdate` if using a custodial admin wallet).

## 5. Why This Satisfies Your Prompt
| Prompt Requirement | Implementation Provided |
|--------------------|-------------------------|
| Blockchain-based Digital ID | `TouristIDRegistry` hash + DID URI anchor. |
| No PII on chain | Only hash + URI stored (confirmed in contract). |
| Tamper-proof verification | Tx hash + hash comparison on scan. |
| Supports auditors / case files | Each registration/update has an immutable event + tx hash. |
| AI / Geo / Incident flows possible later | Extended scaffold (other contracts) left optional. |
| Simple MVP first | Anchor-only mode isolated and feature-flag friendly. |

## 6. Simple Commands (From `blockchain/` Folder)
```powershell
# Install deps (must be inside the blockchain folder)
cd blockchain
npm install

# Compile
npx hardhat compile

# Deploy registry (Sepolia)
npx hardhat registry:deploy --network sepolia

# Register an anchor (example values)
npx hardhat registry:register --registry 0xRegistryAddr --hash 0xYour32ByteHash --did did:example:tourist123 --network sepolia

# Get latest anchor
npx hardhat registry:get --registry 0xRegistryAddr --subject 0xTouristAddress --network sepolia
```

## 7. What Each Contract (Extended Set) Would Do (Optional)
| Contract | Purpose (Future) |
|----------|------------------|
| `AccessManager.sol` | Roles: admin, responder, vendor, oracle. |
| `DigitalIdentity.sol` | Soulbound tourist/vendor NFTs (if you want richer identity). |
| `GeoFenceRegistry.sol` | Stores zone geometry hashes & metadata. |
| `IncidentManager.sol` | Incident lifecycle + evidence hashes. |
| `ReputationOracle.sol` | Signed reputation score updates. |
| `TouristSafetyHub.sol` | Emits distress / automated risk events. |

These are EXTRA. For your anchor requirement you only need `TouristIDRegistry.sol`.

## 8. Security & Privacy Summary
- On-chain: `anchorHash` (keccak256), `didUri`, version, timestamp.
- Off-chain: All actual PII encrypted (AES-GCM) + stored in backend DB / secure storage.
- If a QR is stolen: Backend also validates signature freshness (implementation to be done off-chain).
- Admin wallet can recover/rotate via `adminUpdate` if using custodial model.

## 9. Future Enhancements (If Needed Later)
- Add nonces to prevent hash replay (if using signed off-chain updates).
- Per-tourist self-custody with meta-transactions.
- Zero-knowledge proof for selective attribute disclosure.
- Move to a cheaper L2/mainnet once stable.

## 10. Quick Validation Checklist
- Does it anchor DTID? Yes. `register()` stores hash + DID.
- Any PII on chain? No.
- Can we update/revoke? Yes (`update`, `adminUpdate`).
- Can verifier detect mismatch? Yes via `getLatest`.
- Are extended features forced? No (they’re optional scaffolding).

## 11. What You Should Do Next
1. Deploy `TouristIDRegistry` to Sepolia.
2. Add its address + RPC + feature flag to backend `.env`.
3. Implement backend canonicalization + hashing + call `register`.
4. Add verification check in scan endpoint.
5. Display status + tx hash in dashboard.

---
If you want I can now provide: (a) backend `RegistryService` snippet, (b) canonical JSON hashing helper, or (c) a root workspace config. Just ask.
