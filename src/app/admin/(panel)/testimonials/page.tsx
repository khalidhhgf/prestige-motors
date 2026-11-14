import { guard } from "@/lib/guard";
import { TestimonialsManager } from "@/components/admin/managers";

export default async function Page() {
  await guard("cms");
  return <TestimonialsManager />;
}
