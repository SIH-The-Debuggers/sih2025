# Smart Tourist Safety – Blockchain (Anchor-Only MVP)

Minimal on-chain integrity anchor for each Digital Tourist ID (DTID). No PII stored.

## Contract
`TouristIDRegistry.sol` stores for each subject address:
- `anchorHash` (keccak256 of canonical minimal DTID bundle)
- `didUri` (off-chain pointer)
- `version` (increments on update)
- `updatedAt` timestamp

Events: `AnchorRegistered`, `AnchorUpdated` provide immutable audit trail.

## Workflow
1. Backend canonicalizes minimal JSON (e.g. `{did, tripId, contacts_min}`)
2. Compute `anchorHash`
3. Call `register(anchorHash, didUri)` (Sepolia)
4. Store `anchorHash`, `txHash`, issue QR embedding hash
5. Verification compares QR hash with `getLatest(subject)`
6. Changes => `update` (or `adminUpdate`)

## Commands
```powershell
cd blockchain
npm install
npx hardhat compile
npx hardhat registry:deploy --network sepolia
npx hardhat registry:register --registry 0xRegistryAddr --hash 0xYour32ByteHash --did did:example:tourist123 --network sepolia
```

## Env
| Name | Purpose |
|------|---------|
| SEPOLIA_RPC_URL | Sepolia RPC endpoint |
| PRIVATE_KEY | Deployer/admin key |
| ENABLE_CHAIN_ANCHOR | Backend feature flag |

## Matches Requirements
| Requirement | Delivered |
|-------------|-----------|
| Only anchor hash + DID URI on chain | Yes |
| No PII | Yes |
| Tamper-proof verification | Events + tx hash |
| Update / revocation | `update`, `adminUpdate` |
| Simple minimal code | Extraneous contracts removed |

## Next
Integrate backend hashing + call registry; surface tx hash in dashboard.

---
All non-anchor contracts removed to keep project lean.
