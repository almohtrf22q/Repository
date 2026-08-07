import type { Context, Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { createSession } from './_auth';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  });
}

export default async (req: Request, _context: Context) => {
  if (req.method === 'OPTIONS') return json({ ok: true });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const { username, password } = await req.json();

  // Real credentials come from Netlify environment variables (Site settings ->
  // Environment variables), never from the frontend bundle. A fallback is
  // provided only so the site still works before you set them — change this
  // immediately in production.
  const ADMIN_USERNAME = Netlify.env.get('ADMIN_USERNAME') || 'admin';
  const ADMIN_PASSWORD = Netlify.env.get('ADMIN_PASSWORD') || '123456';

  const cleanUser = (username || '').trim().toLowerCase();
  const validUser = cleanUser === ADMIN_USERNAME.toLowerCase();
  const validPass = password === ADMIN_PASSWORD;

  if (!validUser || !validPass) {
    return json({ error: 'invalid_credentials' }, 401);
  }

  const store = getStore('almuhtarif-data');
  const token = await createSession(store);

  return json({ token });
};

export const config: Config = {
  path: '/api/admin-login'
};
