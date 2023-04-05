import { type EmailAddress } from "@clerk/nextjs/dist/api";

const getUsernameFromEmail = (emailAddresses: EmailAddress[]): string => {
  for (let index = 0; index < emailAddresses.length; index++) {
    const email = emailAddresses[index];
    if (email?.emailAddress) {
      return email.emailAddress.split("@")[0] || "User";
    }
  }
  return "User";
};

export const getUsername = (
  emailAddresses: EmailAddress[],
  username: string | null,
  firstName: string | null
): string => {
  return (
    username || firstName || getUsernameFromEmail(emailAddresses) || "User"
  );
};
