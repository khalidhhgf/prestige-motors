import { guard } from "@/lib/guard";
import TestDrivesManager from "@/components/admin/TestDrivesManager";

export default async function Page() {
  await guard("testdrives");
  return <TestDrivesManager />;
}
