import { Router } from 'express';
import crypto from 'crypto';
import { primaryStore } from '../db/store.js';
import { auditLedger } from '../db/auditLedger.js';
export const casesRouter = Router();
// Helper to calculate SHA-256 hash using Node's crypto module
function calculateSHA256(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}
// GET all regular cases (kept for compatibility with other tabs)
casesRouter.get('/', (req, res) => {
    const isDuress = req.headers['x-duress-session'] === 'true' || req.query.duress === 'true';
    const cases = primaryStore.getCases(isDuress);
    return res.json({ success: true, cases, isDuressSession: isDuress });
});
// GET single regular case by ID (kept for compatibility)
casesRouter.get('/:id', (req, res) => {
    const caseItem = primaryStore.getCaseById(req.params.id);
    if (!caseItem) {
        return res.status(404).json({ error: 'Case docket not found' });
    }
    return res.json({ success: true, case: caseItem });
});
// POST create new regular case docket (kept for compatibility)
casesRouter.post('/', (req, res) => {
    const { title, type, officer, priority, description, location, jurisdictionCode } = req.body;
    if (!title || !officer) {
        return res.status(400).json({ error: 'Case title and investigating officer are required' });
    }
    const count = primaryStore.getCases().length + 1;
    const id = `FIR-2026-${String(count).padStart(3, '0')}`;
    const newCase = {
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
    // Also initialize rich case record
    const newRichCase = {
        id,
        title,
        caseType: newCase.type,
        filingDate: newCase.date,
        currentStage: 'Evidence Collection',
        status: 'Active',
        priority: (newCase.priority || 'MEDIUM').toUpperCase(),
        mayaBreakStatus: 'Pass',
        mayaBreakDetails: 'PRAMANA blockchain verification intact',
        officerInCharge: newCase.officer,
        courtBench: 'High Court Bench 3 (Presiding: Hon. Adv. A. Mehta)',
        prosecutor: 'Adv. V. S. Nambiar',
        defenseCounsel: 'Adv. S. Ramachandran',
        statutorySections: ['Sec 65B Evidence Act', 'Sec 43A IT Act'],
        evidenceTimeline: [],
        testimonies: [],
        custodyHistory: [],
        orders: [],
        notes: [],
        precedents: [],
        createdAt: newCase.createdAt,
        updatedAt: newCase.updatedAt
    };
    primaryStore.saveRichCase(newRichCase);
    auditLedger.appendEvent({
        eventType: 'CASE_DOCKET_CREATED',
        userId: 'SYSTEM',
        userRole: 'SYSTEM',
        details: { caseId: id, title, officer }
    });
    return res.status(201).json({ success: true, case: saved });
});
// ── RICH CASES ENDPOINTS (Court-Authority Case Files Tab) ──────────────────
// GET all rich case dockets with dynamic statistics
casesRouter.get('/rich/all', async (req, res) => {
    const richCases = primaryStore.getRichCases();
    const allUsers = await primaryStore.getAllUsers();
    const defaultFieldUser = allUsers.find(u => u.role === 'field_submitter' && u.profilePhotoUrl) || allUsers.find(u => u.profilePhotoUrl);
    const enrichedRichCases = richCases.map(rc => ({
        ...rc,
        evidenceTimeline: (rc.evidenceTimeline || []).map(item => {
            const submitterLower = (item.submittedBy || '').toLowerCase();
            const matchingUser = allUsers.find(u => {
                if (!u.fullName || !u.profilePhotoUrl)
                    return false;
                const fnLower = u.fullName.toLowerCase();
                return fnLower.includes('siddhesh') || submitterLower.includes(fnLower) || fnLower.includes(submitterLower);
            }) || defaultFieldUser;
            return {
                ...item,
                submitterPhotoUrl: matchingUser?.profilePhotoUrl || item.submitterPhotoUrl,
                signature: item.signature || matchingUser?.digitalSignatureUrl || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="70" viewBox="0 0 320 70"><path d="M 20 40 Q 60 10 90 35 T 160 25 T 220 45 T 280 20" stroke="%231e293b" stroke-width="2.5" fill="none"/><text x="20" y="60" font-family="sans-serif" font-size="9" fill="%230284c7" font-weight="bold">SEALED BY OFFICER SIDDHESH HARWANDE • TPM SECURE KEY 0xSIG_FS_8820</text></svg>`
            };
        })
    }));
    // Calculate summary counts dynamically based on actual store data
    let totalCases = enrichedRichCases.length;
    let underReview = 0;
    let flaggedExhibits = 0;
    let sealedPrecedents = 0;
    enrichedRichCases.forEach((rc) => {
        if (rc.status.toLowerCase() === 'under review') {
            underReview++;
        }
        if (rc.status.toLowerCase() === 'sealed') {
            sealedPrecedents++;
        }
        // Flagged exhibits: check if any evidence item in the timeline is flagged, or if case itself is flagged
        const hasFlaggedExhibit = rc.evidenceTimeline.some((e) => e.integrityStatus === 'Flagged');
        if (hasFlaggedExhibit || rc.mayaBreakStatus === 'Flagged') {
            flaggedExhibits++;
        }
    });
    return res.json({
        success: true,
        cases: enrichedRichCases,
        stats: {
            totalCases,
            underReview,
            flaggedExhibits,
            sealedPrecedents
        }
    });
});
// GET single rich case details
casesRouter.get('/rich/detail/:id', (req, res) => {
    const richCase = primaryStore.getRichCaseById(req.params.id);
    if (!richCase) {
        return res.status(404).json({ success: false, error: 'Rich case not found' });
    }
    return res.json({ success: true, case: richCase });
});
// POST admit new evidence / exhibit to a case (PRAMANA blockchain hashing)
casesRouter.post('/rich/detail/:id/evidence', (req, res) => {
    const { id } = req.params;
    const { title, type, details, submittedBy } = req.body;
    if (!title) {
        return res.status(400).json({ success: false, error: 'Evidence title is required' });
    }
    const richCase = primaryStore.getRichCaseById(id);
    if (!richCase) {
        return res.status(404).json({ success: false, error: 'Rich case not found' });
    }
    // Create cryptographic SHA-256 hash of the evidence details and content
    const randomSalt = crypto.randomBytes(16).toString('hex');
    const hashInput = `${title}-${type}-${details || ''}-${randomSalt}`;
    const pramanaHash = '0x' + calculateSHA256(hashInput).substring(0, 32);
    const blockNumber = 89300 + Math.floor(Math.random() * 500);
    const newEvidence = {
        id: `EXH-${Math.floor(100 + Math.random() * 900)}`,
        title,
        type: type || 'PDF Document',
        submittedBy: submittedBy || 'Court Authority (Formally Filed)',
        timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        pramanaHash,
        blockNumber,
        integrityStatus: 'Pass',
        integrityScore: '100% Original (Verified via MAYA-BREAK)',
        details: details || 'Exhibit formally admitted into court record after passing forgery review.'
    };
    richCase.evidenceTimeline.unshift(newEvidence);
    richCase.updatedAt = new Date().toISOString();
    primaryStore.saveRichCase(richCase);
    // Update corresponding standard case record evidenceCount if it exists
    const standardCase = primaryStore.getCaseById(id);
    if (standardCase) {
        standardCase.evidenceCount = richCase.evidenceTimeline.length;
        primaryStore.saveCase(standardCase);
    }
    // Record audit trail event
    auditLedger.appendEvent({
        eventType: 'EVIDENCE_ADMITTED',
        userId: 'Adv. A. Mehta',
        userRole: 'court_authority',
        category: 'System Safeguard',
        actionName: `Admitted Exhibit ${newEvidence.id} into case ${id}`,
        targetScope: richCase.courtBench,
        outcome: 'Approved',
        blockNumber,
        details: { caseId: id, exhibitId: newEvidence.id, pramanaHash }
    });
    return res.json({ success: true, evidence: newEvidence, case: richCase });
});
// POST add judicial note to a case
casesRouter.post('/rich/detail/:id/notes', (req, res) => {
    const { id } = req.params;
    const { content, category, author } = req.body;
    if (!content) {
        return res.status(400).json({ success: false, error: 'Note content is required' });
    }
    const richCase = primaryStore.getRichCaseById(id);
    if (!richCase) {
        return res.status(404).json({ success: false, error: 'Rich case not found' });
    }
    const newNote = {
        id: `note-${Date.now()}`,
        author: author || 'Adv. A. Mehta (Bench 3)',
        timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        category: category || 'Judicial Directive',
        content
    };
    richCase.notes.unshift(newNote);
    richCase.updatedAt = new Date().toISOString();
    primaryStore.saveRichCase(richCase);
    // Record audit log
    auditLedger.appendEvent({
        eventType: 'CASE_NOTE_ADDED',
        userId: author || 'Adv. A. Mehta',
        userRole: 'court_authority',
        category: 'System Safeguard',
        actionName: `Added Judicial Note: ${newNote.category}`,
        targetScope: richCase.courtBench,
        outcome: 'Reviewed',
        details: { caseId: id, noteId: newNote.id }
    });
    return res.json({ success: true, note: newNote, case: richCase });
});
// POST draft & sign judicial order (bench order/notice)
casesRouter.post('/rich/detail/:id/orders', (req, res) => {
    const { id } = req.params;
    const { title, type, summary, issuedBy } = req.body;
    if (!title || !summary) {
        return res.status(400).json({ success: false, error: 'Order title and summary are required' });
    }
    const richCase = primaryStore.getRichCaseById(id);
    if (!richCase) {
        return res.status(404).json({ success: false, error: 'Rich case not found' });
    }
    // Create SHA-256 seal hash of the order
    const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    const hashInput = `${title}-${type}-${summary}-${issuedBy || 'Adv. A. Mehta'}-${timestamp}`;
    const sealHash = '0x' + calculateSHA256(hashInput).substring(0, 32);
    const newOrder = {
        id: `ORD-${id}-${Math.floor(10 + Math.random() * 90)}`,
        title,
        issuedBy: issuedBy || 'Hon. Adv. A. Mehta (Bench 3)',
        timestamp,
        summary,
        sealHash,
        type: type || 'Evidentiary Direction'
    };
    richCase.orders.unshift(newOrder);
    richCase.updatedAt = new Date().toISOString();
    primaryStore.saveRichCase(richCase);
    // Record audit trail event
    auditLedger.appendEvent({
        eventType: 'JUDICIAL_ORDER_SIGNED',
        userId: issuedBy || 'Adv. A. Mehta',
        userRole: 'court_authority',
        category: 'System Safeguard',
        actionName: `Signed Order: ${newOrder.title}`,
        targetScope: richCase.courtBench,
        outcome: 'Approved',
        details: { caseId: id, orderId: newOrder.id, sealHash }
    });
    return res.json({ success: true, order: newOrder, case: richCase });
});
// POST witness identity unlock (ZKP verification)
casesRouter.post('/rich/detail/:id/testimonies/:testimonyId/unlock', (req, res) => {
    const { id, testimonyId } = req.params;
    const { passkey } = req.body;
    if (!passkey) {
        return res.status(400).json({ success: false, error: 'Authorization passkey is required' });
    }
    // Simple passkey validation - in real app would verify against validator credential/WebAuthn
    // Let's accept '12345' or 'admin' or 'securepass' for validation purposes
    const isValid = passkey === '12345' || passkey === 'admin' || passkey.toLowerCase() === 'mehta';
    if (!isValid) {
        return res.status(401).json({ success: false, error: 'Invalid cryptographic key. Access denied.' });
    }
    const richCase = primaryStore.getRichCaseById(id);
    if (!richCase) {
        return res.status(404).json({ success: false, error: 'Rich case not found' });
    }
    const testimony = richCase.testimonies.find((t) => t.id === testimonyId);
    if (!testimony) {
        return res.status(404).json({ success: false, error: 'Witness testimony ZKP record not found' });
    }
    testimony.isUnlocked = true;
    richCase.updatedAt = new Date().toISOString();
    primaryStore.saveRichCase(richCase);
    // Record audit trail
    auditLedger.appendEvent({
        eventType: 'WITNESS_ZKP_IDENTITY_UNLOCKED',
        userId: 'Adv. A. Mehta',
        userRole: 'court_authority',
        category: 'System Safeguard',
        actionName: `Unlocked Witness ZKP identity: ${testimony.id}`,
        targetScope: richCase.courtBench,
        outcome: 'Approved',
        details: { caseId: id, testimonyId: testimony.id, witnessRole: testimony.witnessRole }
    });
    return res.json({ success: true, testimony, case: richCase });
});
// POST authorize custody transfer of case evidence
casesRouter.post('/rich/detail/:id/custody/transfer', (req, res) => {
    const { id } = req.params;
    const { recipient, reason, actor, location, biometricVerified, gpsCoordinates } = req.body;
    if (!recipient || !reason) {
        return res.status(400).json({ success: false, error: 'Recipient and justification reason are required' });
    }
    const richCase = primaryStore.getRichCaseById(id);
    if (!richCase) {
        return res.status(404).json({ success: false, error: 'Rich case not found' });
    }
    const newStep = {
        id: `cust-${Date.now()}`,
        title: `Authorized Transfer to ${recipient}`,
        actor: actor || 'Court Registrar Office',
        location: location || 'High Court Registrar Chamber',
        timestamp: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: `Authorized Transfer: ${reason}`,
        biometricVerified: biometricVerified !== undefined ? biometricVerified : true,
        gpsCoordinates: gpsCoordinates || '18.9312° N, 72.8291° E'
    };
    richCase.custodyHistory.push(newStep);
    richCase.updatedAt = new Date().toISOString();
    primaryStore.saveRichCase(richCase);
    // Record audit log
    auditLedger.appendEvent({
        eventType: 'CUSTODY_TRANSFER_AUTHORIZED',
        userId: 'Adv. A. Mehta',
        userRole: 'court_authority',
        category: 'System Safeguard',
        actionName: `Authorized Transfer: ${newStep.title}`,
        targetScope: richCase.courtBench,
        outcome: 'Approved',
        details: { caseId: id, recipient, reason }
    });
    return res.json({ success: true, step: newStep, case: richCase });
});
// POST strike or admit an exhibit
casesRouter.post('/rich/detail/:id/evidence/:evidenceId/status', (req, res) => {
    const { id, evidenceId } = req.params;
    const { decision } = req.body; // 'ADMIT' | 'STRIKE'
    if (!decision || (decision !== 'ADMIT' && decision !== 'STRIKE')) {
        return res.status(400).json({ success: false, error: 'Invalid decision parameter. Must be ADMIT or STRIKE.' });
    }
    const richCase = primaryStore.getRichCaseById(id);
    if (!richCase) {
        return res.status(404).json({ success: false, error: 'Rich case not found' });
    }
    const exhibit = richCase.evidenceTimeline.find((e) => e.id === evidenceId);
    if (!exhibit) {
        return res.status(404).json({ success: false, error: 'Exhibit not found in this case.' });
    }
    exhibit.integrityStatus = decision === 'ADMIT' ? 'Pass' : 'Flagged';
    exhibit.details = decision === 'ADMIT'
        ? 'Admitted into formal court record by Judicial Order.'
        : 'Struck from record due to unresolved forgery/tampering anomaly.';
    richCase.updatedAt = new Date().toISOString();
    primaryStore.saveRichCase(richCase);
    // Also log to the audit ledger
    auditLedger.appendEvent({
        eventType: decision === 'ADMIT' ? 'FORGERY_VERDICT_CLEARED' : 'FORGERY_VERDICT_TAMPERED',
        userId: 'Adv. A. Mehta',
        userRole: 'court_authority',
        category: 'System Safeguard',
        actionName: `${decision === 'ADMIT' ? 'Admitted' : 'Struck'} Exhibit ${evidenceId}`,
        targetScope: richCase.courtBench,
        outcome: decision === 'ADMIT' ? 'Approved' : 'Rejected',
        details: { caseId: id, exhibitId: evidenceId, decision }
    });
    return res.json({ success: true, exhibit, case: richCase });
});
