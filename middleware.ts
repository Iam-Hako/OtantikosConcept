import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { IS_MAINTENANCE_MODE } from '@/lib/maintenance';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (IS_MAINTENANCE_MODE) {
    if (pathname === '/bakim') {
      return NextResponse.next();
    }

    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Sitemiz geçici olarak bakım aşamasındadır.' },
        { status: 503 }
      );
    }

    const maintenanceUrl = request.nextUrl.clone();
    maintenanceUrl.pathname = '/bakim';
    maintenanceUrl.search = '';
    return NextResponse.redirect(maintenanceUrl);
  }

  if (pathname === '/bakim') {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = '/';
    homeUrl.search = '';
    return NextResponse.redirect(homeUrl);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images)
     * - icons/ (PWA icons)
     * - logo.webp
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|icons/|logo\\.webp|otantikos-logo\\.webp|sw\\.js|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
