import { type EmailAddress } from "@clerk/nextjs/dist/api";
import { ChripSchema } from "./types";

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

export const isValidEmoji = (emoji: string): boolean => {
  try {
    if (!/\p{Extended_Pictographic}/u.test(emoji)) {
      throw new Error("You can only post emojies.");
    }
    ChripSchema.parse({ content: emoji });
  } catch (e) {
    return false;
  }
  return true;
};
