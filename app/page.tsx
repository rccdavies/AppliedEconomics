import { getDashboardPayload } from "@/lib/dashboardPayload";
import { DashboardClient } from "@/components/DashboardClient";

export const dynamic = "force-dynamic";
/** Vercel serverless ceiling (Hobby ≈10s; Pro can raise in dashboard / plan). */
export const maxDuration = 10;

export default async function Home() {
  const data = await getDashboardPayload();
  return <DashboardClient initial={data} />;
}
