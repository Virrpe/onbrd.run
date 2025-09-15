import { NextRequest } from 'next/server';
import { q } from '../../../../lib/db';

const ADMIN_HEADER = 'x-onbrd-admin';

export async function GET(req: NextRequest) {
  // Check for admin header
  const adminKey = req.headers.get(ADMIN_HEADER);
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Get basic stats
    const totalAudits = await q('SELECT COUNT(*) as count FROM audits');
    const recentAudits = await q('SELECT COUNT(*) as count FROM audits WHERE created_at > NOW() - INTERVAL 24 hours');
    const avgScore = await q('SELECT AVG(score) as avg FROM audits');
    
    const stats = {
      totalAudits: totalAudits[0]?.count || 0,
      recentAudits: recentAudits[0]?.count || 0,
      avgScore: Math.round(avgScore[0]?.avg || 0),
      timestamp: new Date().toISOString()
    };

    // Return simple HTML page
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Onbrd Admin Stats</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .stat { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .stat-value { font-size: 2em; font-weight: bold; color: #2563eb; }
    .stat-label { color: #666; }
  </style>
</head>
<body>
  <h1>Onbrd Admin Stats</h1>
  <div class="stat">
    <div class="stat-label">Total Audits</div>
    <div class="stat-value">${stats.totalAudits}</div>
  </div>
  <div class="stat">
    <div class="stat-label">Last 24 Hours</div>
    <div class="stat-value">${stats.recentAudits}</div>
  </div>
  <div class="stat">
    <div class="stat-label">Average Score</div>
    <div class="stat-value">${stats.avgScore}</div>
  </div>
  <p><small>Last updated: ${stats.timestamp}</small></p>
</body>
</html>`;

    return new Response(html, {
      headers: { 'content-type': 'text/html' }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}