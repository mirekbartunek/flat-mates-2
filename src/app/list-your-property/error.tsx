"use client";
const ErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  if (error.message === "UNAUTHORIZED") return;
};
export default ErrorPage;
