import { getStore } from '@netlify/blobs';

const SESSIONS_KEY_PREFIX = 'session-';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export async function createSession(store: ReturnType<typeof getStore>): Promise<string> {
  const token = crypto.randomUUID() + crypto.randomUUID();
  const expiresAt = Date.now() + SESSION_TTL_MS;
  await store.setJSON(SESSIONS_KEY_PREFIX + token, { expiresAt });
  return token;
}

export async function verifyToken(store: ReturnType<typeof getStore>, token: string): Promise<boolean> {
  if (!token) return false;
  const session = await store.get(SESSIONS_KEY_PREFIX + token, { type: 'json' }) as { expiresAt: number } | null;
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    await store.delete(SESSIONS_KEY_PREFIX + token);
    return false;
  }
  return true;
}
