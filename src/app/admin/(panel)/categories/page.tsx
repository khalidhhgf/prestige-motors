import { guard } from "@/lib/guard";
import { CategoriesManager } from "@/components/admin/managers";

export default async function Page() {
  await guard("categories");
  return <CategoriesManager />;
}
