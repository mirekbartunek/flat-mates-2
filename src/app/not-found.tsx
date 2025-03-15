import { ErrorPage } from "@/modules/layout";

export default async function NotFound() {
  return (
    <div>
      <ErrorPage title="Not Found" desc="Could not find requested resource" />
    </div>
  );
}
