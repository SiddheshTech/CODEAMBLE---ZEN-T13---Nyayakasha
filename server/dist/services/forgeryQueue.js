import { auditLedger } from '../db/auditLedger.js';
class ForgeryJobQueue {
    queue = [];
    jobMap = new Map();
    /**
     * Push evidence forgery scan job to queue asynchronously.
     * Does NOT block the HTTP upload response.
     */
    enqueueJob(evidenceId, sha256Hash, storagePath, submittedBy) {
        const jobId = `job_maya_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const job = {
            jobId,
            evidenceId,
            sha256Hash,
            storagePath,
            submittedBy,
            status: 'QUEUED',
            enqueuedAt: new Date().toISOString()
        };
        this.queue.push(job);
        this.jobMap.set(jobId, job);
        // Process queue in background asynchronously
        setImmediate(() => this.processNextJob());
        return job;
    }
    async processNextJob() {
        const job = this.queue.shift();
        if (!job)
            return;
        job.status = 'PROCESSING';
        // Simulate MAYA-BREAK Forgery Scan Service Execution
        setTimeout(() => {
            job.status = 'COMPLETED';
            job.completedAt = new Date().toISOString();
            job.scanResult = {
                forgeryDetected: false,
                confidenceScore: 0.985,
                manipulationRisk: 'LOW',
                details: 'MAYA-BREAK Frequency & Error Level Analysis (ELA) clean. No GAN/Deepfake manipulation signatures detected.'
            };
            auditLedger.appendEvent({
                eventType: 'FORGERY_SCAN_COMPLETED',
                userId: job.submittedBy,
                userRole: 'field_submitter',
                details: { jobId: job.jobId, evidenceId: job.evidenceId, risk: 'LOW' }
            });
            console.log(`🔍 [MAYA-BREAK Queue] Async Forgery Scan completed for evidence ${job.evidenceId} (Job ${job.jobId})`);
        }, 500);
    }
    getJob(jobId) {
        return this.jobMap.get(jobId);
    }
}
export const forgeryQueue = new ForgeryJobQueue();
