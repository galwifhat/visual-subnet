import { useState } from "react";
import { calculateSubnetDetails } from "./calculateSubnetDetails";
import { calculateAllocationPlan, generateIPRanges } from "./subnetAllocator";
import SubnetVisualizer from "./components/SubnetVisualizer";
import { Toaster, toast } from "react-hot-toast";
import { validateIP, validateCIDR } from "./ipUtils";

function App() {
  const [mode, setMode] = useState("basic");
  const [allocationData, setAllocationData] = useState({
    totalHosts: 0,
    departments: [
      { name: "HR", hosts: 1 },
      { name: "Customer Service", hosts: 0 },
      { name: "Development", hosts: 0 },
    ],
  });

  // Basic subnet calculator state
  const [ipInput, setIpInput] = useState("192.168.1.0");
  const [cidrInput, setCidrInput] = useState("24");
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({ ip: "", cidr: "" });

  // Allocation results
  const [allocationResults, setAllocationResults] = useState(null);
  const [ipRanges, setIpRanges] = useState(null);

  // Basic calculator handlers
  const handleIPChange = (value) => {
    setIpInput(value);
    if (errors.ip) {
      setErrors((prev) => ({ ...prev, ip: "" }));
    }
  };

  const handleCIDRChange = (value) => {
    setCidrInput(value);
    if (errors.cidr) {
      setErrors((prev) => ({ ...prev, cidr: "" }));
    }
  };

  const handleBasicCalculate = (e) => {
    e.preventDefault();

    // Validate inputs
    const ipValid = validateIP(ipInput);
    const cidrValid = validateCIDR(cidrInput);

    if (!ipValid || !cidrValid) {
      const newErrors = {
        ip: !ipValid ? "Invalid IP address format" : "",
        cidr: !cidrValid ? "CIDR must be between 0-32" : "",
      };
      setErrors(newErrors);

      if (!ipValid)
        toast.error("Please enter a valid IP address (e.g., 192.168.1.1)");
      if (!cidrValid) toast.error("Please enter a valid CIDR (0-32)");
      return;
    }

    setErrors({ ip: "", cidr: "" });

    try {
      const data = calculateSubnetDetails(ipInput, parseInt(cidrInput));
      setResults(data);

      // AUTO-POPULATE ALLOCATION DATA
      setAllocationData((prev) => ({
        ...prev,
        totalHosts: data["Usable Hosts"],
      }));

      toast.success(
        "Subnet calculated successfully! Switch to Allocation tab to plan departments."
      );
    } catch (error) {
      toast.error(error.message);
      setResults(null);
    }
  };

  // NEW: Use basic calculator results in allocation mode
  const useBasicResultsForAllocation = () => {
    if (!results) {
      toast.error("Please calculate a subnet first");
      return;
    }

    setAllocationData((prev) => ({
      ...prev,
      totalHosts: results["Usable Hosts"],
    }));

    setMode("allocation");
    toast.success(
      `Allocation base set to ${results["Usable Hosts"]} usable hosts`
    );
  };

  const handleAllocationCalculate = () => {
    // Validate allocation inputs
    if (allocationData.totalHosts <= 0) {
      toast.error("Please set total available hosts");
      return;
    }

    const totalRequested = allocationData.departments.reduce(
      (sum, dept) => sum + dept.hosts,
      0
    );
    if (totalRequested === 0) {
      toast.error("Please set host requirements for departments");
      return;
    }

    if (totalRequested > allocationData.totalHosts) {
      toast.error(
        `Total requested hosts (${totalRequested}) exceeds available hosts (${allocationData.totalHosts})`
      );
      return;
    }

    try {
      const plan = calculateAllocationPlan(
        allocationData.totalHosts,
        allocationData.departments
      );

      const ranges = generateIPRanges(ipInput, plan.allocations);

      setAllocationResults(plan);
      setIpRanges(ranges);
      toast.success("Allocation plan generated!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const addDepartment = () => {
    setAllocationData((prev) => ({
      ...prev,
      departments: [
        ...prev.departments,
        { name: `Dept ${prev.departments.length + 1}`, hosts: 10 },
      ],
    }));
  };

  const updateDepartment = (index, field, value) => {
    setAllocationData((prev) => ({
      ...prev,
      departments: prev.departments.map((dept, i) =>
        i === index
          ? {
              ...dept,
              [field]: field === "hosts" ? parseInt(value) || 0 : value,
            }
          : dept
      ),
    }));
  };

  const getInputClassName = (field) => {
    const baseClasses =
      "p-3 border rounded-lg focus:ring-2 focus:ring-[#e8f0fe] transition-colors duration-200";
    const errorClasses = "border-red-400 bg-red-50";
    const normalClasses = "border-[#e2e8f0]";

    return `${baseClasses} ${errors[field] ? errorClasses : normalClasses}`;
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1a1f36",
            color: "#fff",
          },
        }}
      />

      <div className="min-h-screen bg-[#f7fafc] p-8">
        <h1 className="text-4xl font-bold text-[#1a1f36] mb-2 text-center">
          IP Subnet Calculator
        </h1>
        <p className="text-[#4a5568] text-center mb-8">
          Calculate subnets and visualize IP allocations
        </p>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-[#e2e8f0]">
            <button
              onClick={() => setMode("basic")}
              className={`px-6 py-3 rounded-md transition-colors ${
                mode === "basic"
                  ? "bg-[#1447e6] text-white"
                  : "text-[#1447e6] hover:bg-[#e8f0fe]"
              }`}
            >
              <i className="fa-solid fa-calculator"> </i>
              <span> Basic Calculator</span>
            </button>

            <button
              onClick={() => setMode("allocation")}
              className={`px-6 py-3 rounded-md transition-colors ${
                mode === "allocation"
                  ? "bg-[#1447e6] text-white"
                  : "text-[#1447e6] hover:bg-[#e8f0fe]"
              }`}
            >
              <i class="fa-solid fa-arrow-trend-up"></i>
              <span> Visual Allocation </span>
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-[#e2e8f0]">
          {mode === "basic" ? (
            /* Basic Calculator */
            <div>
              <form onSubmit={handleBasicCalculate} className="space-y-4 mb-6">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block mb-1">IP Address</label>
                    <input
                      type="text"
                      value={ipInput}
                      onChange={(e) => handleIPChange(e.target.value)}
                      placeholder="Network IP (e.g., 192.168.1.0)"
                      className={`w-full ${getInputClassName("ip")}`}
                    />
                    {errors.ip && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="mr-1">⚠</span>
                        {errors.ip}
                      </p>
                    )}
                  </div>

                  <div className="w-24">
                    <label className="block mb-1">CIDR</label>
                    <input
                      type="number"
                      value={cidrInput}
                      onChange={(e) => handleCIDRChange(e.target.value)}
                      placeholder="CIDR"
                      min="0"
                      max="32"
                      className={`w-full ${getInputClassName("cidr")}`}
                    />
                    {errors.cidr && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="mr-1">⚠</span>
                        {errors.cidr}
                      </p>
                    )}
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="bg-[#1447e6] text-white px-6 py-3 rounded-lg hover:bg-[#0f2e7a] transition duration-150 whitespace-nowrap"
                    >
                      Calculate
                    </button>
                  </div>
                </div>
              </form>

              {/* NEW: Use Results Button */}
              {results && (
                <div className="mb-6">
                  <button
                    onClick={useBasicResultsForAllocation}
                    className="bg-[#047857] text-white px-6 py-3 rounded-lg hover:bg-[#065f46] transition duration-150 w-full"
                  >
                    Use This Subnet for Allocation Planning
                  </button>
                  <p className="text-sm text-[#4a5568] text-center mt-2">
                    Total Usable Hosts:{" "}
                    <strong>{results["Usable Hosts"]}</strong> | Network:{" "}
                    <strong>{results["Network Address"]}</strong>
                  </p>
                </div>
              )}

              {/* Results Table */}
              {results && (
                <div className="border border-[#e2e8f0] rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-[#e2e8f0]">
                    <tbody className="bg-white divide-y divide-[#e2e8f0]">
                      {Object.entries(results).map(([key, value]) => (
                        <tr key={key} className="hover:bg-[#f7fafc]">
                          <td className="px-6 py-4 font-medium text-[#1a1f36] w-1/2">
                            {key}
                          </td>
                          <td className="px-6 py-4 text-[#1a1f36] w-1/2 font-mono">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Visual Allocation Interface */
            <div className="space-y-6">
              {/* NEW: Allocation Status Banner */}
              {results && (
                <div className="bg-[#e8f0fe] border border-[#3b6de8] rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-[#1447e6]">
                        Using Subnet Results
                      </h3>
                      <p className="text-[#1447e6] text-sm">
                        Network: {results["Network Address"]} | Usable Hosts:{" "}
                        {results["Usable Hosts"]} | Total Capacity:{" "}
                        {results["Total Hosts"]}
                      </p>
                    </div>
                    <button
                      onClick={() => setMode("basic")}
                      className="bg-[#1447e6] text-white px-4 py-2 rounded text-sm hover:bg-[#0f2e7a]"
                    >
                      Recalculate
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1a1f36] mb-2">
                      Total Available Hosts
                    </label>
                    <input
                      type="number"
                      value={allocationData.totalHosts}
                      onChange={(e) =>
                        setAllocationData((prev) => ({
                          ...prev,
                          totalHosts: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full p-3 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#e8f0fe] focus:border-[#1447e6]"
                      min="1"
                    />
                    <p className="text-xs text-[#4a5568] mt-1">
                      Based on your subnet calculation:{" "}
                      {results ? results["Usable Hosts"] : "Not set"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1a1f36] mb-2">
                      Base IP Network
                    </label>
                    <input
                      type="text"
                      value={ipInput}
                      onChange={(e) => setIpInput(e.target.value)}
                      placeholder="e.g., 192.168.0.0"
                      className="w-full p-3 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#e8f0fe] focus:border-[#1447e6]"
                    />
                    <p className="text-xs text-[#4a5568] mt-1">
                      Start IP for allocation ranges
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-[#1a1f36]">Departments</h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addDepartment}
                        className="bg-[#047857] text-white px-3 py-2 rounded text-sm hover:bg-[#065f46]"
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  {allocationData.departments.map((dept, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={dept.name}
                        onChange={(e) =>
                          updateDepartment(index, "name", e.target.value)
                        }
                        className="flex-1 p-3 border border-[#e2e8f0] rounded focus:ring-2 focus:ring-[#e8f0fe] focus:border-[#1447e6]"
                        placeholder="Department name"
                      />
                      <input
                        type="number"
                        value={dept.hosts}
                        onChange={(e) =>
                          updateDepartment(index, "hosts", e.target.value)
                        }
                        className="w-24 p-3 border border-[#e2e8f0] rounded focus:ring-2 focus:ring-[#e8f0fe] focus:border-[#1447e6]"
                        placeholder="Hosts"
                        min="1"
                      />
                      {allocationData.departments.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setAllocationData((prev) => ({
                              ...prev,
                              departments: prev.departments.filter(
                                (_, i) => i !== index
                              ),
                            }))
                          }
                          className="bg-[#dc2626] text-white px-3 py-3 rounded hover:bg-[#b91c1c]"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Total Requested Display */}
                  <div className="bg-[#f7fafc] p-3 rounded border border-[#e2e8f0]">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#4a5568]">
                        Total Requested Hosts:
                      </span>
                      <span className="font-bold text-[#1a1f36]">
                        {allocationData.departments.reduce(
                          (sum, dept) => sum + dept.hosts,
                          0
                        )}
                        {allocationData.totalHosts > 0 && (
                          <span className="text-[#4a5568] ml-2">
                            / {allocationData.totalHosts} available
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAllocationCalculate}
                disabled={allocationData.totalHosts <= 0}
                className="w-full bg-[#1447e6] text-white p-3 rounded-lg hover:bg-[#0f2e7a] transition duration-150 disabled:bg-[#cbd5e1] disabled:cursor-not-allowed"
              >
                Generate Allocation Plan
              </button>

              {allocationResults && (
                <SubnetVisualizer
                  allocationPlan={allocationResults}
                  ipRanges={ipRanges}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
