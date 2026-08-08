import { Router } from 'express';
import { auditLedger } from '../db/auditLedger.js';
import { primaryStore } from '../db/store.js';
export const healthRouter = Router();
healthRouter.get('/health', async (req, res) => {
    const ledgerIntegrity = auditLedger.verifyIntegrity();
    const users = await primaryStore.getAllUsers();
    return res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'NYAYAKASHA Authentication & Security Backend',
        ledgerIntegrity,
        registeredUsersCount: users.length,
        duressAlertsCount: primaryStore.getDuressAlerts().length
    });
});
