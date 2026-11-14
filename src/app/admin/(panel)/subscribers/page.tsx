import { guard } from "@/lib/guard";
import { SubscribersManager } from "@/components/admin/managers";

export default async function Page() {
  await guard("leads");
  return <SubscribersManager />;
}
