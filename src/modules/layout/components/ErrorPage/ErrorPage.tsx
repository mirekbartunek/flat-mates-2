import { PageTop } from "@/modules/layout";

type ErrorPageProps = {
  title: string;
  desc: string;
};
export const ErrorPage = ({ title, desc }: ErrorPageProps) => {
  return (
    <PageTop>
      <h1 className="text-4xl font-bold tracking-tight text-rose-500 md:text-5xl lg:text-6xl">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-3xl text-lg text-rose-500">{desc}</p>
    </PageTop>
  );
};
