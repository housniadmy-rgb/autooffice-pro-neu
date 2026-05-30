import { NextResponse } from "next/server"
export async function GET() {
  return NextResponse.json({
    stripe_key_exists: !!process.env.STRIPE_SECRET_KEY,
    stripe_key_prefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) || "none",
    brevo_key_exists: !!process.env.BREVO_API_KEY,
  })
}
