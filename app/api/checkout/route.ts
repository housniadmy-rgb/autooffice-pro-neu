import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")
    const { priceId, lang } = await request.json()
    const origin = request.headers.get("origin") || "https://autooffice-pro-neu.vercel.app"
    
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      locale: (lang || "en") as any,
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
