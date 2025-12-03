// src/components/SubnetVisualizer.jsx
import React from "react";

const SubnetVisualizer = ({ allocationPlan, ipRanges }) => {
  const totalCapacity = allocationPlan.totalUsed + allocationPlan.reserve;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#e8f0fe] p-4 rounded-lg border border-[#3b6de8]">
          <div className="text-[#1447e6] font-bold text-2xl">
            {totalCapacity.toLocaleString()}
          </div>
          <div className="text-[#0f2e7a] text-sm">Total Capacity</div>
        </div>
        <div className="bg-[#ecfdf5] p-4 rounded-lg border border-[#a7f3d0]">
          <div className="text-[#047857] font-bold text-2xl">
            {allocationPlan.totalUsed.toLocaleString()}
          </div>
          <div className="text-[#065f46] text-sm">Allocated</div>
        </div>
        <div className="bg-[#fffbeb] p-4 rounded-lg border border-[#fcd34d]">
          <div className="text-[#b45309] font-bold text-2xl">
            {allocationPlan.reserve.toLocaleString()}
          </div>
          <div className="text-[#92400e] text-sm">Reserve</div>
        </div>
        <div className="bg-[#faf5ff] p-4 rounded-lg border border-[#d8b4fe]">
          <div className="text-[#7c3aed] font-bold text-2xl">
            {allocationPlan.efficiency}%
          </div>
          <div className="text-[#5b21b6] text-sm">Efficiency</div>
        </div>
      </div>

      {/* Visual Allocation Bar */}
      <div className="bg-[#f8fafc] rounded-lg p-4 border border-[#e2e8f0]">
        <h3 className="font-bold text-[#1a1f36] mb-2">Space Allocation</h3>
        <div className="h-8 bg-[#e2e8f0] rounded-full overflow-hidden flex">
          {allocationPlan.allocations.map((alloc, index) => (
            <div
              key={index}
              className="h-full transition-all duration-500"
              style={{
                width: `${(alloc.allocated / totalCapacity) * 100}%`,
                backgroundColor: getDepartmentColor(alloc.department),
              }}
              title={`${alloc.department}: ${alloc.allocated} hosts`}
            />
          ))}
          {allocationPlan.reserve > 0 && (
            <div
              className="h-full bg-[#94a3b8]"
              style={{
                width: `${(allocationPlan.reserve / totalCapacity) * 100}%`,
              }}
              title={`Reserve: ${allocationPlan.reserve} hosts`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3">
          {allocationPlan.allocations.map((alloc, index) => (
            <div
              key={index}
              className="flex items-center text-sm text-[#374151]"
            >
              <div
                className="w-3 h-3 mr-2 rounded"
                style={{
                  backgroundColor: getDepartmentColor(alloc.department),
                }}
              />
              {alloc.department} ({alloc.allocated})
            </div>
          ))}
          <div className="flex items-center text-sm text-[#374151]">
            <div className="w-3 h-3 mr-2 bg-[#94a3b8] rounded" />
            Reserve ({allocationPlan.reserve})
          </div>
        </div>
      </div>

      {/* Department Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allocationPlan.allocations.map((alloc, index) => (
          <div
            key={index}
            className="border border-[#e2e8f0] rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <h4 className="font-bold text-lg text-[#1a1f36] mb-2">
              {alloc.department}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-[#4a5568]">Required:</span>
                <span className="font-mono text-[#1a1f36]">
                  {alloc.required}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-[#4a5568]">Allocated:</span>
                <span className="font-mono text-[#1a1f36]">
                  {alloc.allocated} (/{alloc.cidr})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-[#4a5568]">Wasted:</span>
                <span className="font-mono text-[#dc2626]">{alloc.wasted}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#4a5568]">Utilization:</span>
                <span className="font-mono text-[#047857]">
                  {alloc.utilization}
                </span>
              </div>
              {ipRanges[index] && (
                <div className="mt-3 p-2 bg-[#f8fafc] rounded border border-[#e2e8f0] text-xs font-mono text-[#1a1f36]">
                  {ipRanges[index].range}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function for department colors - refined palette
const getDepartmentColor = (department) => {
  const colors = {
    HR: "#3b6de8", // Soft blue
    "Customer Service": "#10b981", // Emerald green
    Development: "#8b5cf6", // Purple
    Marketing: "#f59e0b", // Amber
    Finance: "#ef4444", // Red
    Operations: "#06b6d4", // Cyan
    IT: "#f97316", // Orange
    Sales: "#ec4899", // Pink
    Engineering: "#6366f1", // Indigo
  };
  return colors[department] || "#6b7280"; // Gray as fallback
};

export default SubnetVisualizer;
