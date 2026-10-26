// Scheduled jobs, triggered by Vercel Cron (see vercel.json). Vercel sends "Authorization: Bearer $CRON_SECRET".
import type { Express } from 'express';
import { timingSafeEqual } from 'crypto';
import { GoogleNotConnected, googleConfigured, scanGmailForBills } from './google.js';

function fromCron(header: string | undefined): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function registerCronRoutes(app: Express) {
  app.get('/api/cron/daily', async (req, res) => {
    if (!fromCron(req.headers.authorization)) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }
    const report: Record<string, unknown> = {};
    if (googleConfigured()) {
      try {
        report.gmail = await scanGmailForBills();
      } catch (error) {
        report.gmail = error instanceof GoogleNotConnected ? error.message : 'failed';
        if (!(error instanceof GoogleNotConnected)) console.error('Daily Gmail scan failed:', error);
      }
    }
    console.log('Daily job:', JSON.stringify(report));
    res.json(report);
  });
}
