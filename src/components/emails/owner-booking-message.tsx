import * as React from "react";
import { Html, Tailwind, Text, Link } from "@react-email/components";

type OwnerBookingMessageProps = {
  tenantName: string;
  linkToDashBoard: string;
  propertyTitle: string;
  ownerName: string;
  tenantEmail: string;
  message: string;
};

export const OwnerBookingMessage = ({
  tenantName,
  ownerName,
  linkToDashBoard,
  propertyTitle,
  tenantEmail,
  message,
}: OwnerBookingMessageProps) => {
  return (
    <Tailwind>
      <Html lang="en">
        <Text className="text-xl font-bold">Hey {ownerName}! 👋</Text>

        <Text className="text-lg">
          You have a new booking request for <strong>{propertyTitle}</strong>!
        </Text>

        <Text className="mt-4 font-medium">About the potential tenant:</Text>
        <Text className="ml-4">
          • Name: {tenantName}
          <br />• Contact:{" "}
          <Link href={`mailto:${tenantEmail}`}>{tenantEmail}</Link>
        </Text>

        <Text className="mt-4 font-medium">Their message:</Text>
        <Text className="ml-4 rounded-md bg-gray-50 p-3 italic">
          &#34;{message}&#34;
        </Text>

        <Text className="mt-6">
          Ready to respond?{" "}
          <Link
            href={linkToDashBoard}
            className="text-blue-600 hover:text-blue-800"
          >
            Review this request in your Dashboard →
          </Link>
        </Text>

        <Text className="mt-6 border-t pt-4 text-sm text-gray-500">
          Note: For all future communication, please use email directly. Flat
          Mates is here to connect you, but doesn&#39;t provide messaging
          functionality.
        </Text>
      </Html>
    </Tailwind>
  );
};
