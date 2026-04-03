import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const mockSession = request.cookies.get("mock_session")?.value;
  const isMockUser = mockSession === "user";
  const isMockAdmin = mockSession === "admin";
  const isAuthenticated = !!user || isMockUser || isMockAdmin;

  const path = request.nextUrl.pathname;

  // Skip middleware for static assets
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/favicon.ico") ||
    path.includes(".svg") ||
    path.includes(".png") ||
    path.includes(".jpg") ||
    path.includes(".jpeg")
  ) {
    return response;
  }

  // Auth/Redirect logic
  // The root path '/' is now the login page
  const isAuthPage = path === "/";
  const isAuthCallback = path === "/auth/callback";
  const isAdminRoute = path.startsWith("/admin") || path.startsWith("/quiz/admin");
  const isProtectedRoute = path.startsWith("/quiz") || path.startsWith("/dashboard") || isAdminRoute;

  // Redirect legacy /login to root
  if (path === "/login") {
     return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect to root if not authenticated and trying to access protected route
  if (!isAuthenticated && isProtectedRoute && !isAuthCallback) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect to dashboard if already authenticated and trying to access login/root
  // Temporarily disabled to allow viewing the login page directly
  /*
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  */

  // Admin access control
  if (isAdminRoute && !isMockAdmin) {
    // If not mock admin, check Supabase role
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } else {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: "/:path*",
};
