import { guard } from "@/lib/guard";
import { NavManager } from "@/components/admin/managers";

export default async function Page() {
  await guard("cms");
  return <NavManager />;
}
