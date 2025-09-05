import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
// CommonJS build; imports remain via ES syntax thanks to esModuleInterop

// Lazy load artifact (assumes compiled in root hardhat artifacts path OR root/blockchain/artifacts)
function loadArtifact() {
  const candidatePaths = [
    path.join(__dirname, '..', '..', 'artifacts', 'contracts', 'TouristIDRegistry.sol', 'TouristIDRegistry.json'),
    path.join(__dirname, '..', '..', 'blockchain', 'artifacts', 'contracts', 'TouristIDRegistry.sol', 'TouristIDRegistry.json')
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  }
  throw new Error('Contract artifact not found. Compile with Hardhat (artifacts missing). Looked in: ' + candidatePaths.join(' | '));
}

export class RegistryClient {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract?: ethers.Contract;
  private address: string;

  constructor() {
    const rpc = process.env.SEPOLIA_RPC_URL;
    const pk = process.env.PRIVATE_KEY;
    this.address = process.env.REGISTRY_ADDRESS || '';
    if (!rpc || !pk || !this.address) throw new Error('Missing RPC / PRIVATE_KEY / REGISTRY_ADDRESS');
    this.provider = new ethers.JsonRpcProvider(rpc);
    this.wallet = new ethers.Wallet(pk, this.provider);
  }

  init() {
    if (this.contract) return this.contract;
    const artifact = loadArtifact();
    this.contract = new ethers.Contract(this.address, artifact.abi, this.wallet);
    return this.contract;
  }

  async register(_subject: string, hash: string, didUri: string) {
    const c = this.init();
    // If owner-based per-subject function exists, use it; else fallback to msg.sender registration.
    let tx;
    if (typeof c.registerFor === 'function') {
      tx = await c.registerFor(_subject, hash, didUri);
    } else {
      tx = await c.register(hash, didUri); // legacy path
    }
    const rc = await tx.wait();
    return { txHash: tx.hash, gasUsed: rc?.gasUsed?.toString() };
  }

  async update(_subject: string, hash: string, didUri: string) {
    const c = this.init();
    let tx;
    if (typeof c.updateFor === 'function') {
      tx = await c.updateFor(_subject, hash, didUri);
    } else {
      tx = await c.update(hash, didUri);
    }
    const rc = await tx.wait();
    return { txHash: tx.hash, gasUsed: rc?.gasUsed?.toString() };
  }

  // Non-blocking variants (return immediately without waiting for confirmation)
  async registerNoWait(subject: string, hash: string, didUri: string) {
    const c = this.init();
    const tx = typeof c.registerFor === 'function' ? await c.registerFor(subject, hash, didUri) : await c.register(hash, didUri);
    return { txHash: tx.hash };
  }

  async updateNoWait(subject: string, hash: string, didUri: string) {
    const c = this.init();
    const tx = typeof c.updateFor === 'function' ? await c.updateFor(subject, hash, didUri) : await c.update(hash, didUri);
    return { txHash: tx.hash };
  }

  async getLatest(subject: string) {
    const c = this.init();
    return c.getLatest(subject);
  }
}

export function keccakCanonical(obj: any): { canonical: string; hash: string } {
  // create stable, sorted JSON
  function sort(o: any): any {
    if (Array.isArray(o)) return o.map(sort);
    if (o && typeof o === 'object') {
      return Object.keys(o).sort().reduce((acc: any, k) => { acc[k] = sort(o[k]); return acc; }, {});
    }
    return o;
  }
  const canonical = JSON.stringify(sort(obj));
  const hash = ethers.keccak256(ethers.toUtf8Bytes(canonical));
  return { canonical, hash };
}

export type { };
