import { guard } from "@/lib/guard";
import MediaLibrary from "@/components/admin/MediaLibrary";

export default async function Page() {
  await guard("media");
  return <MediaLibrary />;
}
