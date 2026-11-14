import { guard } from "@/lib/guard";
import { BrandsManager } from "@/components/admin/managers";

export default async function Page() {
  await guard("brands");
  return <BrandsManager />;
}
