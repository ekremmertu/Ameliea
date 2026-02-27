// proxy.ts (formerly middleware.ts – Next.js 16+ convention)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Helper function to check if email is admin (server-side)
function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;

  const adminEmailsStr = process.env.ADMIN_EMAILS || "";
  const adminEmails = adminEmailsStr
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);

  return adminEmails.includes(email.toLowerCase());
}

// Helper function to check if user has active purchase (server-side)
async function hasActivePurchase(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("purchases")
      .select("id, status, expires_at")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("purchased_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return false;
    }

    // Check if purchase has expired
    if (data.expires_at) {
      const expiresAt = new Date(data.expires_at);
      const now = new Date();
      if (expiresAt < now) {
        return false; // Purchase expired
      }
    }

    return true; // Active purchase found
  } catch (error) {
    console.error("Error checking purchase in proxy:", error);
    return false;
  }
}

export async function proxy(req: NextRequest) {
  let res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll().map((c) => ({ name: c.name, value: c.value }));
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>): void {
          // IMPORTANT: must update response cookies
          res = NextResponse.next({
            request: { headers: req.headers },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();

  // If user is authenticated, check if admin trying to access dashboard
  if (data.user && req.nextUrl.pathname.startsWith("/dashboard")) {
    if (isAdminEmail(data.user.email)) {
      // Admin trying to access dashboard - redirect to admin panel
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }

    // Check if user has active purchase (non-admin users need purchase to access dashboard)
    const hasPurchase = await hasActivePurchase(supabase, data.user.id);
    if (!hasPurchase) {
      // User doesn't have active purchase - redirect to home with message
      const url = req.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("message", "purchase_required");
      return NextResponse.redirect(url);
    }
  }

  // If user is authenticated but not admin trying to access admin routes
  if (data.user && req.nextUrl.pathname.startsWith("/admin")) {
    if (!isAdminEmail(data.user.email)) {
      // Non-admin trying to access admin - redirect to dashboard
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith("/dashboard") && !data.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Protect invitation dashboard routes
  if (
    req.nextUrl.pathname.includes("/invitation/") &&
    req.nextUrl.pathname.includes("/dashboard") &&
    !data.user
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith("/admin") && !data.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/invitation/:path*/dashboard/:path*", "/admin/:path*"],
};
