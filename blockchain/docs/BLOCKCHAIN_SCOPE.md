# Blockchain Scope vs Overall Solution

The blockchain layer specifically addresses integrity, trust, auditability, and decentralized identity within the Smart Tourist Safety system.

## Blockchain Responsibilities
Anchor-Only MVP (current active):
1. DTID integrity anchoring: store (anchorHash, didUri) per subject.
2. Provide immutable tx hash & version history for audits.
3. No PII on-chain; only hash anchor + DID pointer.

Extended Mode (optional later):
4. Identity (Tourist & Vendor) issuance (non-transferable) with revocation.
5. Role-based authorization for responders, admins, oracle signer.
6. Geo-fence zone registration & version tracking (hash anchoring of geometry).
7. Incident lifecycle logging with immutable history via events.
8. Evidence hash anchoring (IPFS / cloud refs) to prove media / AI report existed at time X.
9. Distress & automated risk alert events for real-time systems to consume.
10. Reputation score storage updated via signed oracle data (no raw analytics on-chain).
11. Minimal personally identifiable data—only hashed references.

## Explicitly Out of Scope (Off-Chain)
- Heavy geospatial computation / inside-geo-fence checks
- AI inference (image, video, anomaly detection)
- Raw media storage / streaming
- Push notifications / real-time routing
- Detailed workflow & escalation logic (future upgrade)
- Analytics dashboards & BI aggregation

## Design Principles
- Minimal on-chain state, rich off-chain context (hash anchors)
- Strong role separation (admin vs responder vs oracle)
- Upgrade-ready modular separation of contracts
- Gas efficiency (simple structs, no loops over dynamic arrays on-chain)
- Privacy preserving (hashes, not raw PII)

## Event-Centric Integration
Off-chain microservices subscribe to emitted events (e.g., via ethers.js + WebSocket provider) and perform:
- Auto-creation of related database records
- Fetching & pinning of referenced IPFS content
- Running AI classifiers on new evidence then anchoring result hashes back
- Sending notifications to responders / tourist devices

## Security Considerations
- Admin multisig recommended
- Oracle signer rotation via AccessManager role changes
- Replay protection via including contract + chainid in signed score messages
- No external calls in state mutation -> reentrancy-safe by design

## Future Enhancements
- EIP-712 typed data meta-transactions for gasless UX
- zk-proof based selective disclosure for age / nationality
- On-chain slashing for responder misconduct if governed by DAO
- Layer-2 deployment for lower fees (zkSync / Base / Arbitrum)
