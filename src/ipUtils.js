// src/ipUtils.js

/**
 * Converts a dotted-decimal IP address string to a 32-bit unsigned integer
 */
export const ipToLong = (ip) => {
  if (!ip || typeof ip !== "string") {
    throw new Error("Invalid IP address");
  }

  const parts = ip.split(".");
  if (parts.length !== 4) {
    throw new Error("IP address must have 4 octets");
  }

  let result = 0;
  for (let i = 0; i < 4; i++) {
    const octet = parseInt(parts[i], 10);
    if (isNaN(octet) || octet < 0 || octet > 255) {
      throw new Error(`Invalid octet: ${parts[i]}`);
    }
    result = (result << 8) | octet;
  }

  return result >>> 0; // Ensure unsigned 32-bit
};

/**
 * Converts a 32-bit unsigned integer back to dotted-decimal IP string
 */
export const longToIp = (long) => {
  // if (typeof long !== "number" || long < 0 || long > 0xffffffff) {
  //   throw new Error("Invalid long value");
  // }

  return [
    (long >>> 24) & 0xff,
    (long >>> 16) & 0xff,
    (long >>> 8) & 0xff,
    long & 0xff,
  ].join(".");
};

/**
 * Calculates subnet mask from CIDR
 */
export const cidrToMaskLong = (cidr) => {
  if (cidr < 0 || cidr > 32) {
    throw new Error("CIDR must be between 0 and 32");
  }

  if (cidr === 0) return 0;
  return (0xffffffff << (32 - cidr)) >>> 0;
};

/**
 * Validates IP address format
 */
export const validateIP = (ip) => {
  if (!ip) return false;

  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) return false;

  const parts = ip.split(".");
  if (parts.length !== 4) return false;

  for (let part of parts) {
    const num = parseInt(part, 10);
    if (isNaN(num)) return false;
    if (num < 0 || num > 255) return false;
    if (part.length > 1 && part.startsWith("0")) return false;
    if (part !== num.toString()) return false;
  }

  return true;
};

/**
 * Validates CIDR notation
 */
export const validateCIDR = (cidr) => {
  if (!cidr && cidr !== 0) return false;
  const num = parseInt(cidr, 10);
  return !isNaN(num) && num >= 0 && num <= 32;
};
