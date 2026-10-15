import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || "http://localhost:4000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const auth = req.headers.get("authorization");
    if (auth) headers["Authorization"] = auth;
    const cookie = req.headers.get("cookie");
    if (cookie) headers["Cookie"] = cookie;

    const res = await fetch(`${BACKEND_URL}/v1/plagiarism`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to reach backend" }, { status: 502 });
  }
}
