import { Html, Tailwind, Text } from "@react-email/components";

type AcceptedTenantMessageProps = {
  tenantName: string;
  ownerName: string;
  propertyTitle: string;
  ownerEmail: string;
  monthlyPrice: number;
};

export const AcceptedTenantMessage = ({
  tenantName,
  ownerName,
  propertyTitle,
  ownerEmail,
  monthlyPrice,
}: AcceptedTenantMessageProps) => {
  return (
    <Tailwind>
      <Html lang="en">
        <Text>Great news {tenantName}! 🎉</Text>

        <Text>
          Your request to live in <strong>{propertyTitle}</strong> has been
          accepted!
        </Text>

        <Text>Property details:</Text>
        <Text className="ml-4">
          • Monthly rent: ${monthlyPrice}
          <br />• Owner: {ownerName}
        </Text>

        <Text>Next steps:</Text>
        <Text className="ml-4">
          • Contact {ownerName} at {ownerEmail} to arrange the details
          <br />
          • Discuss move-in dates and paperwork
          <br />• Set up payment arrangements
        </Text>

        <Text className="mt-4">Welcome to your new home! 🏠</Text>

        <Text className="mt-4 text-sm text-gray-500">
          Note: All further communication should be done via email. Flat Mates
          doesn&#39;t provide in-app messaging.
        </Text>
      </Html>
    </Tailwind>
  );
};
