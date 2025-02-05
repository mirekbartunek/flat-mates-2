import * as React from "react";
import { Html, Tailwind, Text } from "@react-email/components";

type RejectedTenantMessageProps = {
  tenantName: string;
  ownerName: string;
  propertyTitle: string;
};

export const RejectedTenantMessage = ({
  tenantName,
  propertyTitle,
}: RejectedTenantMessageProps) => {
  return (
    <Tailwind>
      <Html lang="en">
        <Text>Hi {tenantName},</Text>

        <Text>
          We wanted to let you know that your request to live in{" "}
          <strong>{propertyTitle}</strong> was not accepted at this time.
        </Text>

        <Text>
          Don&#39;t be discouraged! There are many other great properties
          available on Flat Mates.
        </Text>

        <Text>Some tips for your next application:</Text>
        <Text className="ml-4">
          • Include a detailed introduction about yourself
          <br />
          • Mention your occupation and lifestyle
          <br />• Explain why you&#39;re interested in the property
        </Text>

        <Text className="mt-4">
          Keep looking! Your perfect home is out there. 🏠
        </Text>

        <Text className="mt-4 text-sm text-gray-500">
          This is an automated message. Please do not reply to this email.
        </Text>
      </Html>
    </Tailwind>
  );
};
