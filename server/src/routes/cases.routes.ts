import { Router, Request, Response } from 'express';
import { primaryStore, CaseRecord } from '../db/store.js';
import { auditLedger } from '../db/auditLedger.js';

export const casesRouter = Router();

// GET all cases
casesRouter.get('/', (req: Request, res: Response) => {
  const cases = primaryStore.getCases();
  return res.json({ success: true, cases });
});

// GET single case by ID
casesRouter.get('/:id', (req: Request, res: Response) => {
  const caseItem = primaryStore.getCaseById(req.params.id);
  if (!caseItem) {
    return res.status(404).json({ error: 'Case docket not found' });
  }
  return res.json({ success: true, case: caseItem });
});

// POST create new case docket
casesRouter.post('/', (req: Request, res: Response) => {
  const { title, type, officer, priority, description, location, jurisdictionCode } = req.body;
  if (!title || !officer) {
    return res.status(400).json({ error: 'Case title and investigating officer are required' });
  }

  const count = primaryStore.getCases().length + 1;
  const id = `FIR-2026-${String(count).padStart(3, '0')}`;
  
  const newCase: CaseRecord = {
    id,
    title,
    type: type || 'General Investigation',
    status: 'Active',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    officer,
    evidenceCount: 0,
    testimonyCount: 0,
    priority: priority || 'Medium',
    description: description || 'New case docket initialized on Nyayakasha network.',
    location: location || 'District Headquarters',
    jurisdictionCode: jurisdictionCode || 'MH-MUM-DIST-01',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const saved = primaryStore.saveCase(newCase);
  auditLedger.recordEvent('CASE_DOCKET_CREATED', 'SYSTEM', { caseId: id, title, officer });

  return res.status(201).json({ success: true, case: saved });
});
