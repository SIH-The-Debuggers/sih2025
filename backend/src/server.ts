import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RegistryClient, keccakCanonical } from './blockchain';
import path from 'path';
import QRCode from 'qrcode';
import fs from 'fs';
import cors from 'cors';
import { z } from 'zod';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(cors());
app.use((req, _res, next) => { console.log(`[REQ] ${req.method} ${req.url}`); next(); });

const enableChain = process.env.ENABLE_CHAIN_ANCHOR === 'true';
let registry: RegistryClient | null = null;
try { if (enableChain) registry = new RegistryClient(); } catch (e) { console.warn('Registry init skipped:', (e as Error).message); }

const hasDb = !!process.env.DATABASE_URL;
const mem: any[] = [];
const fileStorePath = path.join(process.cwd(), 'backend', 'data', 'identities.json');
function persistToFile() {
  try { fs.writeFileSync(fileStorePath, JSON.stringify(mem, null, 2)); } catch {}
}
function loadFromFile() {
  if (fs.existsSync(fileStorePath)) {
    try { const d = JSON.parse(fs.readFileSync(fileStorePath, 'utf-8')); if (Array.isArray(d)) { mem.push(...d); } } catch {}
  }
}
loadFromFile();

const kycSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/,'invalid wallet'),
  didUri: z.string().min(8).optional(),
  tripId: z.string().min(3).optional(),
  encPIIRef: z.string().optional(),
  fullName: z.string().min(2).max(120),
  destination: z.string().min(2).max(160),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  minimal: z.object({
    contacts: z.array(z.object({ type: z.string(), value: z.string().min(1) })).optional()
  })
});

// KYC submission: stores ALL addresses normalized to lowercase for consistency.
app.post('/api/kyc', async (req: Request, res: Response) => {
  try {
    const parsed = kycSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'validation_failed', details: parsed.error.flatten() });
  let { walletAddress, didUri, minimal, encPIIRef, tripId, fullName, destination, startDate, endDate } = parsed.data;
  // Normalize wallet address once; we will ONLY store lowercase in DB going forward.
  const lowerWallet = walletAddress.toLowerCase();
  walletAddress = lowerWallet;
    const chainId = 11155111; // could be moved to env
    if (!tripId) {
      const d = new Date();
      const ymd = d.toISOString().slice(0,10).replace(/-/g,'')
      const rand = Math.random().toString(16).slice(2,6);
      tripId = `trip-${ymd}-${rand}`;
    }
    if (!didUri) {
      // Uniqueness per issuance: wallet + tripId
      didUri = `did:tourist:${chainId}:${lowerWallet}:${tripId}`;
    }

    const hashInput = {
      wallet: lowerWallet,
      tripId, // logical journey grouping
      fullName,
      destination,
      startDate,
      endDate,
      contacts: minimal.contacts || []
    };
    const { hash } = keccakCanonical(hashInput);
  // Check if a record for THIS wallet + tripId already exists (multi-trip supported).
  let existing = hasDb ? await prisma.touristIdentity.findUnique({ where: { subjectAddr_tripId: { subjectAddr: walletAddress, tripId } } }) : mem.find(r => r.subjectAddr === walletAddress && r.tripId === tripId);
    let txHash = 'off-chain-only';
    const fastTx = process.env.FAST_TX === 'true';
    console.log('[KYC] parsed input for', walletAddress, 'tripId=', tripId, 'fastTx=', fastTx);
    
    if (enableChain && registry) {
      console.log('[KYC] chain write start for trip:', tripId);
      // Use wallet address as subject, encode trip info in DID URI
      const subjectAddress = walletAddress; // Contract expects address type
      const tripSpecificDidUri = `${didUri}-${tripId}`; // Trip info in DID URI
      
      try {
        // Always register as new for each trip (same address, different DID URI per trip)
        if (fastTx) { 
          const { txHash: h } = await registry.registerNoWait(subjectAddress, hash, tripSpecificDidUri); 
          txHash = h; 
        } else { 
          const { txHash: h } = await registry.register(subjectAddress, hash, tripSpecificDidUri); 
          txHash = h; 
        }
        console.log('[KYC] chain write done tx=', txHash);
      } catch (error: any) {
        console.warn('[KYC] register failed, trying update:', error.message);
        // If register fails, try update
        try {
          if (fastTx) { 
            const { txHash: h } = await registry.updateNoWait(subjectAddress, hash, tripSpecificDidUri); 
            txHash = h; 
          } else { 
            const { txHash: h } = await registry.update(subjectAddress, hash, tripSpecificDidUri); 
            txHash = h; 
          }
          console.log('[KYC] chain update done tx=', txHash);
        } catch (updateError: any) {
          console.error('[KYC] both register and update failed:', updateError.message);
          // Continue without blockchain anchor but log the error
          txHash = 'blockchain-failed';
        }
      }
    }
    let record;
    if (hasDb) {
      if (existing) {
        record = await prisma.touristIdentity.update({
          where: { subjectAddr_tripId: { subjectAddr: walletAddress, tripId } },
            data: { anchorHash: hash, didUri, version: existing.version + 1, registerTx: txHash, encPIIRef, contactsMin: JSON.stringify(minimal.contacts || []), fullName, destination, startDate: new Date(startDate), endDate: new Date(endDate) }
        });
      } else {
        record = await prisma.touristIdentity.create({
          data: { subjectAddr: walletAddress, tripId, didUri, anchorHash: hash, version: 1, registerTx: txHash, encPIIRef: encPIIRef || 'local', contactsMin: JSON.stringify(minimal.contacts || []), fullName, destination, startDate: new Date(startDate), endDate: new Date(endDate) }
        });
      }
    } else {
      if (existing) {
        existing.anchorHash = hash;
        existing.didUri = didUri;
        existing.version = existing.version + 1;
        existing.registerTx = txHash;
        existing.updatedAt = new Date().toISOString();
        existing.fullName = fullName;
        existing.destination = destination;
        existing.startDate = startDate;
        existing.endDate = endDate;
        record = existing;
      } else {
        record = { id: (mem.length + 1).toString(), subjectAddr: walletAddress, tripId, didUri, anchorHash: hash, registerTx: txHash, version: 1, encPIIRef: encPIIRef || 'local', contactsMin: JSON.stringify(minimal.contacts || []), fullName, destination, startDate, endDate, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        mem.push(record);
      }
      persistToFile();
    }
    console.log('[KYC] upsert done id=', record.id);
    res.json({ ok: true, id: record.id, anchorHash: record.anchorHash, version: record.version, txHash, storage: hasDb ? 'postgres' : 'file', didUri, tripId });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.options('/api/kyc', (_req, res) => { res.sendStatus(204); });
app.get('/api/kyc', (_req, res) => {
  return res.status(405).json({ error: 'Use POST for /api/kyc', hint: 'Send JSON { walletAddress, didUri, minimal, encPIIRef, tripId }' });
});

// Verify anchor for a wallet (case-insensitive by normalizing to lowercase)
app.get('/api/verify', async (req: Request, res: Response) => {
  try {
    const walletAddressRaw = req.query.walletAddress as string | undefined;
    if (!walletAddressRaw) return res.status(400).json({ error: 'walletAddress required' });
    const walletAddress = walletAddressRaw.toLowerCase();
    let record = hasDb ? await prisma.touristIdentity.findFirst({ where: { subjectAddr: walletAddress } }) : mem.find(r => r.subjectAddr === walletAddress);
    if (!record && hasDb) {
      // Legacy fallback: maybe stored with original case
      record = await prisma.touristIdentity.findFirst({ where: { subjectAddr: walletAddressRaw } });
    }
    if (!record) return res.status(404).json({ error: 'not found' });

    let onChainProcessed: any = null;
    if (enableChain && registry) {
      const onChainRaw = await registry.getLatest(walletAddress);
      // Expect tuple: [anchorHash, didUri, updatedAt(BigInt), version(BigInt)]
      if (onChainRaw && onChainRaw.anchorHash) {
        const { anchorHash, didUri, updatedAt, version } = onChainRaw;
        onChainProcessed = {
          anchorHash,
          didUri,
          updatedAt: Number(updatedAt),
          version: Number(version)
        };
      } else if (Array.isArray(onChainRaw)) {
        const [anchorHash, didUri, updatedAt, version] = onChainRaw as any[];
        onChainProcessed = {
          anchorHash,
          didUri,
          updatedAt: Number(updatedAt),
          version: Number(version)
        };
      }
    }

    res.json({
      subjectAddr: record.subjectAddr,
      storedAnchor: record.anchorHash,
      didUri: record.didUri,
      version: record.version,
      onChain: onChainProcessed,
      match: onChainProcessed ? onChainProcessed.anchorHash === record.anchorHash : true,
      storage: hasDb ? 'postgres' : 'file'
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Generate QR payload (wallet param normalized to lowercase)
app.get('/api/qr/:wallet', async (req: Request, res: Response) => {
  try {
    const wallet = req.params.wallet.toLowerCase();
    let record = hasDb ? await prisma.touristIdentity.findFirst({ where: { subjectAddr: wallet } }) : mem.find(r => r.subjectAddr === wallet);
    if (!record && hasDb) {
      // Legacy fallback for pre-normalization entries
      record = await prisma.touristIdentity.findFirst({ where: { subjectAddr: req.params.wallet } });
    }
    if (!record) return res.status(404).json({ error: 'not found' });
    const contacts = (()=>{ try { return JSON.parse(record.contactsMin || '[]'); } catch { return []; } })();
    const payload = {
      w: record.subjectAddr,
      did: record.didUri,
      trip: record.tripId,
      name: record.fullName || null,
      dest: record.destination || null,
      start: record.startDate ? (record.startDate instanceof Date ? record.startDate.toISOString().slice(0,10) : new Date(record.startDate).toISOString().slice(0,10)) : null,
      end: record.endDate ? (record.endDate instanceof Date ? record.endDate.toISOString().slice(0,10) : new Date(record.endDate).toISOString().slice(0,10)) : null,
      contacts,
      anchor: record.anchorHash,
      ver: record.version,
      ts: Math.floor(Date.now()/1000)
    };
    const text = JSON.stringify(payload);
    const png = await QRCode.toDataURL(text, { errorCorrectionLevel: 'M', width: 320 });
    res.json({ png, payload });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// List all trips or trips for a specific wallet: /api/trips?wallet=0x...
app.get('/api/trips', async (req: Request, res: Response) => {
  try {
    const wallet = (req.query.wallet as string | undefined)?.toLowerCase();
    if (!hasDb) {
      const filtered = wallet ? mem.filter(r => r.subjectAddr === wallet) : mem;
      return res.json(filtered.map(stripRecord));
    }
    const rows = await prisma.touristIdentity.findMany({
      where: wallet ? { subjectAddr: wallet } : undefined,
      orderBy: { createdAt: 'desc' }
    });
    res.json(rows.map(stripRecord));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Get a single trip record by wallet + tripId
app.get('/api/trips/:wallet/:tripId', async (req: Request, res: Response) => {
  try {
    const wallet = req.params.wallet.toLowerCase();
    const tripId = req.params.tripId;
    let record;
    if (hasDb) {
      record = await prisma.touristIdentity.findFirst({ where: { subjectAddr: wallet, tripId } });
    } else {
      record = mem.find(r => r.subjectAddr === wallet && r.tripId === tripId);
    }
    if (!record) return res.status(404).json({ error: 'not found' });
    res.json(detailedRecord(record));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Helper to normalize / strip sensitive fields (currently we include everything relevant)
function stripRecord(r: any) {
  return {
    subjectAddr: r.subjectAddr,
    tripId: r.tripId,
    fullName: r.fullName || null,
    destination: r.destination || null,
    startDate: r.startDate ? dateIso(r.startDate) : null,
    endDate: r.endDate ? dateIso(r.endDate) : null,
    didUri: r.didUri,
    anchorHash: r.anchorHash,
    version: r.version,
    registerTx: r.registerTx,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt
  };
}
function detailedRecord(r: any) {
  const base = stripRecord(r);
  let contacts: any[] = [];
  try { contacts = JSON.parse(r.contactsMin || '[]'); } catch {}
  return { ...base, contacts, encPIIRef: r.encPIIRef || null };
}
function dateIso(d: any) {
  if (d instanceof Date) return d.toISOString().slice(0,10);
  try { return new Date(d).toISOString().slice(0,10); } catch { return null; }
}

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log('Backend up on', port);
  console.log('Server is running and ready to accept connections');
});
