const path = require('path');
const dotenv = require('dotenv');

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'GEMINI_API_KEY'
];

const missingVars = requiredVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

const sanitizePrivateKey = (key) => key.replace(/\\n/g, '\n');

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8080,
  corsOrigins: (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean),
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: sanitizePrivateKey(process.env.FIREBASE_PRIVATE_KEY)
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-1.5-pro'
  },
  gcp: {
    region: process.env.GCP_REGION || 'asia-south1'
  }
};

module.exports = env;
