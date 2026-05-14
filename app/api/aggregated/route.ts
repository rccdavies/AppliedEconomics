import { NextResponse } from "next/server";
import { getDashboardPayload } from "@/lib/dashboardPayload";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 10;

export async function GET() {
  const payload = await getDashboardPayload();
  return NextResponse.json(payload);
}
