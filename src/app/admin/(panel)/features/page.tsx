import { guard } from "@/lib/guard";
import { FeaturesManager } from "@/components/admin/managers";

export default async function Page() {
  await guard("vehicles");
  return <FeaturesManager />;
}
