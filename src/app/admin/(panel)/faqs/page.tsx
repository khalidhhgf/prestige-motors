import { guard } from "@/lib/guard";
import { FaqsManager } from "@/components/admin/managers";

export default async function Page() {
  await guard("cms");
  return <FaqsManager />;
}
