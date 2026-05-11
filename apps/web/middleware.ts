import type { NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static assets)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - mockServiceWorker.js (MSW worker file)
     * - any path with a file extension (images, css, js)
     */
    '/((?!_next/static|_next/image|favicon.ico|mockServiceWorker.js|.*\\..*).*)',
  ],
};
