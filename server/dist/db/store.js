class PrimaryDataStore {
    users = new Map();
    usersByEmail = new Map();
    duressAlerts = [];
    vettingQueue = [];
    constructor() {
        // Seed default admin / demo records for rapid evaluation if needed
        this.seedDemoUsers();
    }
    seedDemoUsers() {
        const defaultUser = {
            id: 'usr_fs_demo',
            email: 'submitter@nyayakasha.gov.in',
            fullName: 'Inspector Rajesh Kumar',
            role: 'field_submitter',
            passwordHash: 'pbkdf2$salt$hash',
            approvalState: 'active',
            stateHistory: [{ state: 'active', timestamp: new Date().toISOString() }],
            institutionVerified: true,
            vettingApproved: true,
            mfaEnrolled: true,
            mfaType: 'totp',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.users.set(defaultUser.id, defaultUser);
        this.usersByEmail.set(defaultUser.email, defaultUser);
    }
    async saveUser(user) {
        user.updatedAt = new Date().toISOString();
        this.users.set(user.id, user);
        this.usersByEmail.set(user.email.toLowerCase(), user);
        return user;
    }
    async getUserById(id) {
        return this.users.get(id);
    }
    async getUserByEmail(email) {
        return this.usersByEmail.get(email.toLowerCase());
    }
    async getAllUsers() {
        return Array.from(this.users.values());
    }
    // Duress Alerts
    addDuressAlert(alert) {
        const record = {
            ...alert,
            id: `alert_dur_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            timestamp: new Date().toISOString(),
            status: 'UNACKNOWLEDGED'
        };
        this.duressAlerts.unshift(record);
        return record;
    }
    getDuressAlerts() {
        return [...this.duressAlerts];
    }
    // Vetting Queue for Validator
    addToVettingQueue(userId, consentGiven) {
        const item = {
            id: `vet_${Date.now()}`,
            userId,
            submittedAt: new Date().toISOString(),
            consentGiven
        };
        this.vettingQueue.push(item);
        return item;
    }
    getVettingQueue() {
        return [...this.vettingQueue];
    }
}
export const primaryStore = new PrimaryDataStore();
