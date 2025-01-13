import * as React from "react";
import { Html, Button, Tailwind, Text, Link } from "@react-email/components";
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
  message
}: OwnerBookingMessageProps) => {
  // TODO: Vyresit kdyz nekdo ma setting v anglictine
  return (
    <Tailwind>
      <Html lang="en">
        <Text>
          Hey, {ownerName}, {tenantName} wants to live in {propertyTitle}!
        </Text>
        <Text>{tenantName} left you a message.</Text>
        <Text>{message}</Text>
        <Text>
          Manage this in the <Link href={linkToDashBoard}>Dashboard</Link>
        </Text>

        <Text>Note: for further communication, use email. Flat Mates does not support messaging. {tenantName}’s email: {tenantEmail}</Text>
      </Html>
    </Tailwind>
  );
};
