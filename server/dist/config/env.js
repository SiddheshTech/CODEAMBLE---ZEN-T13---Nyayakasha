import dotenv from 'dotenv';
dotenv.config();
export const ENV = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET || 'nyayakasha_super_secret_jwt_key_2026_dharma_consensus',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    WEBAUTHN_RP_ID: process.env.WEBAUTHN_RP_ID || 'localhost',
    WEBAUTHN_ORIGIN: process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000',
    TURNSTILE_SECRET: process.env.TURNSTILE_SECRET || '0x4AAAAAAAx_mock_secret_turnstile',
    POLYGON_RPC_URL: process.env.POLYGON_RPC_URL || 'https://rpc-amoy.polygon.technology',
    BLOCKCHAIN_PRIVATE_KEY: process.env.BLOCKCHAIN_PRIVATE_KEY || '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
};
