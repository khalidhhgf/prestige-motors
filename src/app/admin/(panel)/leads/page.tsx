import { guard } from "@/lib/guard";
import LeadsManager from "@/components/admin/LeadsManager";

export default async function Page() {
  await guard("leads");
  return <LeadsManager />;
}
