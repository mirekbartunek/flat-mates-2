import { ErrorPage } from "@/modules/layout";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("Not-Found");
  return (
    <div>
      <ErrorPage title={t("title")} desc={t("description")} />
    </div>
  );
}
