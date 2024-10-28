import { isValidPhoneNumber, parsePhoneNumberWithError } from "libphonenumber-js";

/**
 * @description
 */
export const isMobileNumberValid = (phoneNumber: string): boolean => {
  return isValidPhoneNumber(phoneNumber, {
    defaultCountry: "IN",
  });
};

/**
 * @description
 * @throws {Error} If the phone number is invalid
 */
export const formatMobileNumber = (phoneNumber: string): string => {
  const pn = parsePhoneNumberWithError(phoneNumber, {
    defaultCountry: "IN",
  });
  if (!pn) {
    throw new Error("Invalid phone number");
  }

  return pn.number;
};
