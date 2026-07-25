import type { Context, Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { verifyToken } from './_auth';

const BOOKINGS_KEY = 'all-bookings';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS'
    }
  });
}

async function loadBookings(store: ReturnType<typeof getStore>) {
  const data = await store.get(BOOKINGS_KEY, { type: 'json' });
  return (data as any[]) || [];
}

export default async (req: Request, _context: Context) => {
  if (req.method === 'OPTIONS') return json({ ok: true });

  const store = getStore('almuhtarif-data');
  const url = new URL(req.url);

  // ---- GET: list all (admin only) OR single lookup by orderId (public) ----
  if (req.method === 'GET') {
    const orderId = url.searchParams.get('orderId');
    const bookings = await loadBookings(store);

    if (orderId) {
      // Public order tracking: only return the matching booking, nothing else.
      const found = bookings.find((b: any) => b.orderId === orderId);
      return found ? json(found) : json({ error: 'not_found' }, 404);
    }

    // Full list requires a valid admin session token.
    const auth = req.headers.get('authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    const valid = await verifyToken(store, token);
    if (!valid) return json({ error: 'unauthorized' }, 401);

    return json(bookings);
  }

  // ---- POST: create a new booking (public — customers booking a service) ----
  if (req.method === 'POST') {
    const body = await req.json();
    const bookings = await loadBookings(store);

    const orderId = body.orderId || 'MHT-' + Math.floor(1000 + Math.random() * 9000);
    const newBooking = {
      ...body,
      orderId,
      createdAt: body.createdAt || new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      status: body.status || 'pending'
    };

    bookings.unshift(newBooking);
    await store.setJSON(BOOKINGS_KEY, bookings);
    return json(newBooking, 201);
  }

  // ---- PATCH: update booking status / payment status (admin only) ----
  if (req.method === 'PATCH') {
    const auth = req.headers.get('authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    const valid = await verifyToken(store, token);
    if (!valid) return json({ error: 'unauthorized' }, 401);

    const body = await req.json();
    const { orderId, status, paymentStatus } = body;
    const bookings = await loadBookings(store);

    const idx = bookings.findIndex((b: any) => b.orderId === orderId);
    if (idx === -1) return json({ error: 'not_found' }, 404);

    if (status) bookings[idx].status = status;
    if (paymentStatus) bookings[idx].paymentStatus = paymentStatus;
    bookings[idx].updatedAt = new Date().toISOString().slice(0, 10);

    await store.setJSON(BOOKINGS_KEY, bookings);
    return json(bookings[idx]);
  }

  return json({ error: 'method_not_allowed' }, 405);
};

export const config: Config = {
  path: '/api/bookings'
};
