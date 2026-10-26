// Vercel serverless entry: every /api/* request is rewritten here (see vercel.json)
import { createApiApp } from '../server/app';

export default createApiApp();
