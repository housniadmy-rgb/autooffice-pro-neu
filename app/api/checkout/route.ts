import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Mock für den Build – gibt immer eine Test-URL zurück
  return NextResponse.json({ 
    url: "https://buy.stripe.com/test"
  });
}