import { guard } from "@/lib/guard";
import { BlogManager } from "@/components/admin/managers";

export default async function Page() {
  await guard("cms");
  return <BlogManager />;
}
