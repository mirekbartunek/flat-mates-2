import { PageTop } from "@/modules/layout";
import { Paragraph, Heading1, Heading2 } from "@/modules/typography";
import { getServerAuthSession } from "@/server/auth";
import Link from "next/link";

const Page = async () => {
  const u = await getServerAuthSession();
  return (
    <main>
      <PageTop>
        <Heading1>List your property</Heading1>
        <Paragraph className="mx-auto mt-4 max-w-3xl text-lg">
          Interested in listing your property? Here are all the needed steps
        </Paragraph>
      </PageTop>
      <div className="container flex flex-col gap-5">
        <section className="mt-5 flex flex-col gap-10">
          <article>
            <Heading2>What do I need?</Heading2>
            <Paragraph>
              To list properties on our platform, you need to verify yourself on
              of our checkpoints. First, apply for verification. Afterwards, you
              can verify on the checkpoints Make sure to bring your ID, so we
              can verify your identity.
            </Paragraph>
          </article>
          <article>
            <Heading2>What to do after?</Heading2>
            <Paragraph>
              Right after you are verified, you can list your property!
            </Paragraph>
          </article>
        </section>
        {u?.user.verified_status === "VERIFIED" ? (
          <p>
            It seems like you are verified, go ahead, make that listing!{" "}
            <Link href="/listing/new">Start here</Link>
          </p>
        ) : null}
      </div>
    </main>
  );
};
export default Page;
