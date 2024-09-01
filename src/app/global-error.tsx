"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Error");

  console.error(error);
  return (
    <html>
      <body>
        <Alert variant="destructive" onClick={reset}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("title")}</AlertTitle>
          <AlertDescription>
            {t("description", { message: error.message })}
          </AlertDescription>
        </Alert>
      </body>
    </html>
  );
}
