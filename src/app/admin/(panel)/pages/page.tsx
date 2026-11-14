import { guard } from "@/lib/guard";
import { PagesManager } from "@/components/admin/managers";

export default async function Page() {
  await guard("cms");
  return <PagesManager />;
}
