import { guard } from "@/lib/guard";
import { UsersManager } from "@/components/admin/managers";

export default async function Page() {
  await guard("users");
  return <UsersManager />;
}
