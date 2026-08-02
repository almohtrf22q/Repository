import type { Context, Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { verifyToken } from './_auth';

const SITE_DATA_KEY = 'site-data';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS'
    }
  });
}

export default async (req: Request, _context: Context) => {
  if (req.method === 'OPTIONS') return json({ ok: true });

  const store = getStore('almuhtarif-data');

  // ---- GET: public — every visitor needs to see current offers/services/theme ----
  if (req.method === 'GET') {
    const data = await store.get(SITE_DATA_KEY, { type: 'json' });
    // Returns null if nothing has been saved yet — the frontend falls back
    // to its built-in defaults in that case.
    return json(data || null);
  }

  // ---- PUT: admin only — replaces the whole shared offers/services/theme snapshot ----
  if (req.method === 'PUT') {
    const auth = req.headers.get('authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    const valid = await verifyToken(store, token);
    if (!valid) return json({ error: 'unauthorized' }, 401);

    const body = await req.json();
    const { offers, services, theme } = body;

    // Merge with whatever is already stored so a client that only changed
    // one of the three (e.g. just the theme) doesn't wipe out the others.
    const existing = (await store.get(SITE_DATA_KEY, { type: 'json' })) as any || {};
    const next = {
      offers: offers !== undefined ? offers : existing.offers,
      services: services !== undefined ? services : existing.services,
      theme: theme !== undefined ? theme : existing.theme,
      updatedAt: new Date().toISOString()
    };

    await store.setJSON(SITE_DATA_KEY, next);
    return json(next);
  }

  return json({ error: 'method_not_allowed' }, 405);
};

export const config: Config = {
  path: '/api/site-data'
};
