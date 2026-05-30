import { NextResponse } from "next/server"
export async function POST(request: Request) {
  const { email, password } = await request.json()
  const { handleLogin } = await import("@/../src/modules/di/inputs")
  const result = await handleLogin(email, password)
  return NextResponse.json(result)
}
