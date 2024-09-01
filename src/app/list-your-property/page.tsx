import { PageTop } from "@/modules/layout";
import { getTranslations } from "next-intl/server";
import { Paragraph, Heading1, Heading2 } from "@/modules/typography";
import { api } from "@/trpc/server";
import { getServerAuthSession } from "@/server/auth";

const Page = async () => {
  const t = await getTranslations("Start-Renting");
  const currentUser = await getServerAuthSession();
  let user;
  if (currentUser) {
    user = await api.users.protectedMe();
  }
  return (
    <main>
      <PageTop>
        <Heading1>{t("title")}</Heading1>
        <Paragraph className="mx-auto mt-4 max-w-3xl text-lg">
          {t("description")}
        </Paragraph>
      </PageTop>
      <div className="container flex flex-col gap-5">
        <section className="mt-5 flex flex-col gap-10">
          <article>
            <Heading2>{t("What-Do-I-Need.title")}</Heading2>
            <Paragraph>{t("What-Do-I-Need.description")}</Paragraph>
          </article>
          <article>
            <Heading2>{t("What-To-Do-After.title")}</Heading2>
            <Paragraph>{t("What-To-Do-After.description")}</Paragraph>
            <p>ADD verficy sattsu</p>
          </article>
        </section>
      </div>
    </main>
  );
};
export default Page;
