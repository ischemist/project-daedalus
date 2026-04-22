import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth/config"

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    const signInUrl = new URL("/signin", request.url)
    signInUrl.searchParams.set("redirectTo", request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/planning/:path*", "/runtimes/:path*", "/workers/:path*", "/artifacts/:path*", "/settings/:path*"],
}
