"use client";
const ErrorPage = ({ error }: { error: Error & { digest?: string } }) => {
  if (error.message === "UNAUTHORIZED") return;
};
export default ErrorPage;
