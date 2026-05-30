import { NextResponse } from "next/server"
export async function POST(request: Request) {
  const { email, password, name } = await request.json()
  const { handleRegister } = await import("@/../src/modules/di/inputs")
  const result = await handleRegister(email, password, name)
  return NextResponse.json(result)
}
