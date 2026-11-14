import { guard } from "@/lib/guard";
import VehicleList from "@/components/admin/VehicleList";

export default async function Page() {
  await guard("vehicles");
  return <VehicleList />;
}
