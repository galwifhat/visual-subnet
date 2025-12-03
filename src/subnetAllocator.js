// src/subnetAllocator.js
import { ipToLong, longToIp } from "./ipUtils.js";
// Pre-defined optimal subnet sizes (CIDR to host count mapping)
export const SUBNET_SIZES = [
  { cidr: 32, hosts: 1, usable: 1, type: "Single Host" },
  { cidr: 31, hosts: 2, usable: 2, type: "Point-to-Point" },
  { cidr: 30, hosts: 4, usable: 2, type: "Tiny" },
  { cidr: 29, hosts: 8, usable: 6, type: "Micro" },
  { cidr: 28, hosts: 16, usable: 14, type: "Small" },
  { cidr: 27, hosts: 32, usable: 30, type: "Small+" },
  { cidr: 26, hosts: 64, usable: 62, type: "Medium" },
  { cidr: 25, hosts: 128, usable: 126, type: "Medium+" },
  { cidr: 24, hosts: 256, usable: 254, type: "Large" },
  { cidr: 23, hosts: 512, usable: 510, type: "X-Large" },
  { cidr: 22, hosts: 1024, usable: 1022, type: "XX-Large" },
  { cidr: 21, hosts: 2048, usable: 2046, type: "XXX-Large" },
  { cidr: 20, hosts: 4096, usable: 4094, type: "Jumbo" },
  { cidr: 19, hosts: 8192, usable: 8190, type: "Jumbo+" },
  { cidr: 18, hosts: 16384, usable: 16382, type: "Massive" },
  { cidr: 17, hosts: 32768, usable: 32766, type: "Massive+" },
  { cidr: 16, hosts: 65536, usable: 65534, type: "Giant" },
];

// Find the most efficient CIDR for a given number of hosts
export const findOptimalSubnet = (requiredHosts) => {
  for (const subnet of SUBNET_SIZES) {
    if (subnet.usable >= requiredHosts) {
      return { ...subnet };
    }
  }
  throw new Error(`Requirement too large: ${requiredHosts} hosts`);
};

// Calculate allocation plan
export const calculateAllocationPlan = (totalHosts, departments) => {
  const results = {
    allocations: [],
    totalUsed: 0,
    totalWasted: 0,
    efficiency: 0,
    reserve: 0,
  };

  // Allocate each department
  departments.forEach((dept) => {
    const optimalSubnet = findOptimalSubnet(dept.hosts);
    const wasted = optimalSubnet.usable - dept.hosts;

    results.allocations.push({
      department: dept.name,
      required: dept.hosts,
      allocated: optimalSubnet.usable,
      cidr: optimalSubnet.cidr,
      type: optimalSubnet.type,
      wasted: wasted,
      utilization: ((dept.hosts / optimalSubnet.usable) * 100).toFixed(1) + "%",
    });

    results.totalUsed += optimalSubnet.usable;
    results.totalWasted += wasted;
  });

  results.reserve = totalHosts - results.totalUsed;
  results.efficiency = (
    ((results.totalUsed - results.totalWasted) / results.totalUsed) *
    100
  ).toFixed(1);

  return results;
};

// Generate IP ranges for visualization
export const generateIPRanges = (baseIP, allocations) => {
  let currentIP = ipToLong(baseIP);
  const ranges = [];

  allocations.forEach((allocation) => {
    const networkSize = Math.pow(2, 32 - allocation.cidr);
    const range = {
      department: allocation.department,
      network: longToIp(currentIP),
      cidr: allocation.cidr,
      range: `${longToIp(currentIP)}/${allocation.cidr}`,
      firstUsable: longToIp(currentIP + 1),
      lastUsable: longToIp(currentIP + networkSize - 2),
      broadcast: longToIp(currentIP + networkSize - 1),
      size: allocation.allocated,
    };

    ranges.push(range);
    currentIP += networkSize;
  });

  return ranges;
};
