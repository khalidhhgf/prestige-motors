import { guard } from "@/lib/guard";
import { getSettings } from "@/lib/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function Page() {
  await guard("settings");
  return <SettingsForm initial={await getSettings()} />;
}
