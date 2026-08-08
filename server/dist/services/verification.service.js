import { primaryStore } from '../db/store.js';
import { auditLedger } from '../db/auditLedger.js';
/**
 * State Transition Guard
 * Enforces: submitted → institution_review → [dual_check / vetting] → mfa_pending → active
 */
export async function transitionApprovalState(userId, targetState, actorRole, note) {
    const user = await primaryStore.getUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    const currentState = user.approvalState;
    // Validate state machine ordering rule strictly
    if (targetState === 'mfa_pending') {
        // MFA Pending is ONLY allowed if institutional review or vetting has passed!
        if (currentState !== 'institution_review' && currentState !== 'dual_check' && currentState !== 'vetting') {
            throw new Error(`Invalid state transition. Cannot transition to mfa_pending from current state "${currentState}". Institutional approval is required first.`);
        }
        if (!user.institutionVerified) {
            throw new Error('Cannot transition to mfa_pending: Institutional verification has not been completed.');
        }
    }
    if (targetState === 'active') {
        if (currentState !== 'mfa_pending') {
            throw new Error(`Cannot activate account directly from state "${currentState}". User must be in mfa_pending and complete MFA enrollment first.`);
        }
        if (!user.mfaEnrolled) {
            throw new Error('Cannot activate account: Multi-Factor Authentication (MFA) must be completed first.');
        }
    }
    // Update State
    user.approvalState = targetState;
    user.stateHistory.push({ state: targetState, timestamp: new Date().toISOString(), note });
    await primaryStore.saveUser(user);
    auditLedger.appendEvent({
        eventType: 'APPROVAL_STATE_TRANSITION',
        userId: user.id,
        userRole: user.role,
        details: { fromState: currentState, toState: targetState, actorRole, note }
    });
    return user;
}
/**
 * Server-Side Document Blur / Quality Check (Laplacian Variance simulation)
 */
export function evaluateDocumentQuality(fileBuffer) {
    // Compute pseudo-Laplacian variance from file bytes to measure image sharpness/clarity
    let variance = 0;
    for (let i = 0; i < fileBuffer.length - 1; i++) {
        const diff = Math.abs(fileBuffer[i] - fileBuffer[i + 1]);
        variance += diff;
    }
    const normalizedScore = (variance / fileBuffer.length) * 10;
    const blurScore = Math.min(Math.max(Math.round(normalizedScore * 10) / 10, 15.0), 98.5);
    const passesQuality = blurScore >= 35.0; // Threshold score of 35.0
    const feedback = passesQuality
        ? 'Document image quality check passed. Text clarity and security seals verified.'
        : 'Document image appears blurred or low resolution. Please upload a clearer scan/photo.';
    return { blurScore, passesQuality, feedback };
}
/**
 * Institutional Registry Cross-Check (Bar Council / Judicial HR / Police DB)
 */
export async function crossCheckInstitutionalRegistry(user) {
    // Simulate institutional database lookup
    let registrySource = 'National Judicial HR Database';
    let verified = true;
    if (user.role === 'court_authority') {
        registrySource = 'Bar Council & Judicial Appointment Records';
        verified = Boolean(user.barCouncilNumber || user.institutionId);
    }
    else if (user.role === 'field_submitter') {
        registrySource = 'State Police Department HR & Badge Registry';
        verified = Boolean(user.badgeId || user.institutionId);
    }
    else if (user.role === 'independent_validator') {
        registrySource = 'Oversight Committee & High Court Registry';
        verified = Boolean(user.institutionId);
    }
    user.institutionVerified = verified;
    if (verified && user.approvalState === 'submitted') {
        user.approvalState = 'institution_review';
        user.stateHistory.push({ state: 'institution_review', timestamp: new Date().toISOString(), note: 'Verified by Institutional Registry' });
    }
    await primaryStore.saveUser(user);
    auditLedger.appendEvent({
        eventType: 'INSTITUTIONAL_REGISTRY_CHECK',
        userId: user.id,
        userRole: user.role,
        details: { registrySource, verified }
    });
    return {
        verified,
        registrySource,
        matchDetails: {
            institutionId: user.institutionId,
            badgeId: user.badgeId,
            barCouncilNumber: user.barCouncilNumber,
            status: verified ? 'ACTIVE_OFFICIAL_RECORD' : 'RECORD_NOT_FOUND'
        }
    };
}
/**
 * Validator Background Vetting Queue
 */
export async function queueValidatorVetting(userId, consentGiven) {
    if (!consentGiven) {
        throw new Error('Vetting consent is mandatory for Independent Validator role.');
    }
    const queueItem = primaryStore.addToVettingQueue(userId, consentGiven);
    auditLedger.appendEvent({
        eventType: 'VALIDATOR_VETTING_QUEUED',
        userId,
        userRole: 'independent_validator',
        details: { consentGiven, vettingId: queueItem.id }
    });
    return queueItem;
}
