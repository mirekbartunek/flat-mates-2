"use client";
import { NewNewListingForm } from "@/modules/listings/components/NewNewListingForm/NewNewListingForm";
import { env } from "@/env";
import { redirect } from "next/navigation";

const Page = () => {
  if (env.NODE_ENV === "production") return redirect("/")
  return <NewNewListingForm/>
}

export default Page;
