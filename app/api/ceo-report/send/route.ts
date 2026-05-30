import { NextResponse } from "next/server"
export async function GET() {
  const { sendCEOReport } = await import("@/../src/modules/cpu/ceo")
  const result = await sendCEOReport()
  return NextResponse.json(result)
}
