import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { priceId, lang } = await req.json();
    
    // Stripe unterstützt diese Sprachen offiziell
    let stripeLocale: any = "en";
    if (lang === "de") stripeLocale = "de";
    if (lang === "fr") stripeLocale = "fr";
    if (lang === "es") stripeLocale = "es";
    if (lang === "it") stripeLocale = "it";
    if (lang === "pt") stripeLocale = "pt";
    if (lang === "nl") stripeLocale = "nl";
    if (lang === "pl") stripeLocale = "pl";
    if (lang === "tr") stripeLocale = "tr";
    
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://praxisonline24.com"}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://praxisonline24.com"}/`,
      locale: stripeLocale,
      metadata: { lang },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Fehler beim Checkout" }, { status: 500 });
  }
}