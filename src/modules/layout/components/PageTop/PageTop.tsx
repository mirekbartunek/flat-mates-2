import type { ReactNode } from "react";

export const PageTop = async ({ children }: { children: ReactNode }) => {
  return (
    <section className="w-screen bg-rose-100 py-12 md:py-24 lg:py-32 dark:bg-neutral-900">
      <div className="container mx-auto px-4 text-center md:px-6">
        {children}
      </div>
    </section>
  );
};
