// src/calculateSubnetDetails.js
import { ipToLong, longToIp, cidrToMaskLong } from "./ipUtils.js";

export const calculateSubnetDetails = (ipAddress, cidr) => {
  const ipLong = ipToLong(ipAddress);
  const cidrNum = parseInt(cidr, 10);

  if (cidrNum < 0 || cidrNum > 32) {
    throw new Error("Invalid CIDR value. Must be between 0 and 32.");
  }

  // Subnet Mask
  const maskLong = cidrToMaskLong(cidrNum);

  // Network Address
  const networkLong = ipLong & maskLong;

  // Broadcast Address
  const broadcastLong = (networkLong | (~maskLong >>> 0)) >>> 0;

  // Host Calculations
  const hostBits = 32 - cidrNum;
  const totalHosts = Math.pow(2, hostBits);
  const usableHosts = totalHosts > 2 ? totalHosts - 2 : 0;

  // Format outputs
  const subnetMaskStr = longToIp(maskLong);
  const networkAddressStr = longToIp(networkLong);
  const broadcastAddressStr = longToIp(broadcastLong);
  const firstUsableHostStr =
    usableHosts > 0 ? longToIp(networkLong + 1) : "N/A";
  const lastUsableHostStr =
    usableHosts > 0 ? longToIp(broadcastLong - 1) : "N/A";

  // Wildcard Mask
  const wildcardLong = ~maskLong >>> 0;
  const wildcardStr = longToIp(wildcardLong);

  return {
    "IP Address": ipAddress,
    "CIDR Notation": `/${cidrNum}`,
    "Subnet Mask": subnetMaskStr,
    "Wildcard Mask": wildcardStr,
    "Network Address": networkAddressStr,
    "First Usable Host": firstUsableHostStr,
    "Last Usable Host": lastUsableHostStr,
    "Broadcast Address": broadcastAddressStr,
    "Total Hosts": totalHosts,
    "Usable Hosts": usableHosts,
    "Host Bits": hostBits,
  };
};
