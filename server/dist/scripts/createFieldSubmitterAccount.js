import { primaryStore } from '../db/store.js';
import { hashPassword } from '../utils/crypto.js';
import { auditLedger } from '../db/auditLedger.js';
async function createAccount() {
    const email = 'meetbhanu125@gmail.com';
    const rawPassword = 'FieldSubmitter!2026SecurePass';
    const fullName = 'Meet Bhanushali';
    const role = 'field_submitter';
    const badgeId = 'FS-POL-88201';
    const jurisdictionCode = 'MH-MUM-DIST-01';
    // Check if existing
    const existing = await primaryStore.getUserByEmail(email);
    if (existing) {
        console.log(`ℹ️ Account already exists for ${email}. Updating status to active.`);
        existing.approvalState = 'active';
        existing.institutionVerified = true;
        existing.vettingApproved = true;
        existing.mfaEnrolled = false;
        existing.passwordHash = await hashPassword(rawPassword);
        await primaryStore.saveUser(existing);
        console.log('✅ Updated existing account to ACTIVE status.');
        console.log(`User ID: ${existing.id}`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${rawPassword}`);
        process.exit(0);
    }
    const passwordHash = await hashPassword(rawPassword);
    const userId = `usr_fs_${Date.now()}`;
    const newUser = {
        id: userId,
        email,
        fullName,
        role: 'field_submitter',
        passwordHash,
        badgeId,
        jurisdictionCode,
        approvalState: 'active',
        stateHistory: [
            { state: 'submitted', timestamp: new Date().toISOString(), note: 'Account signup created' },
            { state: 'institution_review', timestamp: new Date().toISOString(), note: 'Auto verified' },
            { state: 'active', timestamp: new Date().toISOString(), note: 'Fully approved field submitter account' }
        ],
        institutionVerified: true,
        vettingApproved: true,
        mfaEnrolled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    await primaryStore.saveUser(newUser);
    auditLedger.appendEvent({
        eventType: 'USER_SIGNUP_APPROVED',
        userId: newUser.id,
        userRole: newUser.role,
        details: { email: newUser.email, approvalState: 'active' }
    });
    console.log('=======================================================');
    console.log('✅ Field Submitter Account Created & Approved Successfully!');
    console.log(`👤 Name: ${fullName}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${rawPassword}`);
    console.log(`🆔 User ID: ${userId}`);
    console.log(`🛡️ Badge ID: ${badgeId}`);
    console.log(`📍 Jurisdiction Code: ${jurisdictionCode}`);
    console.log(`⚡ Approval State: active`);
    console.log('=======================================================');
    process.exit(0);
}
createAccount().catch((err) => {
    console.error('Error creating account:', err);
    process.exit(1);
});
