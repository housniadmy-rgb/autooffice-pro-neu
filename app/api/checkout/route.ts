import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")
    const { priceId } = await request.json()
    
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${request.headers.get("origin")}/dashboard?success=true`,
      cancel_url: `${request.headers.get("origin")}/?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    return NextResponse.json({ error: "Fehler beim Erstellen der Checkout-Session" }, { status: 500 })
  }
}
