import { NextResponse } from "next/server"
import { getSession } from "./lib/auth/auth"

export default async function proxy(request) {
    const session = await getSession()

    const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard")

    if (isDashboardPage && !session?.user) {
        return NextResponse.redirect(new URL("/signin", request.url))
    }

    const isSignInPage = request.nextUrl.pathname.startsWith("/signin")
    const isSignUpPage = request.nextUrl.pathname.startsWith("/signup")

    if ((isSignInPage || isSignUpPage) && session?.user) {
        return NextResponse.redirect(
            new URL("/dashboard", request.url)
        )
    }

    return NextResponse.next()
}