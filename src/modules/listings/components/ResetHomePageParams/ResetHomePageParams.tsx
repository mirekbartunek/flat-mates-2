"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getUrl } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const ResetHomePageParams = () => {
  const params = useSearchParams();
  return params.size > 0 ? (
    <Link href={`${getUrl()}/`} className={buttonVariants()}>
      Try resetting the params
    </Link>
  ) : null;
};
