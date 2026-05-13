import { getDashboardPayload } from "@/lib/dashboardPayload";
import { DashboardClient } from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getDashboardPayload();
  return <DashboardClient initial={data} />;
}
