"use client";
import React, { useState, useEffect } from "react";

// Function to calculate hourly consumption and which devices are used
const calculateHourlyConsumption = (applianceList) => {
  const hourlyConsumption = Array.from({ length: 24 }, () => ({
    total: 0,
    devices: [],
  }));
  applianceList.forEach((appliance) => {
    appliance.hours.forEach((hour) => {
      const consumptionPerHour = (appliance.power * appliance.quantity) / 1000; // in kWh
      hourlyConsumption[hour].total += consumptionPerHour;
      hourlyConsumption[hour].devices.push(appliance.device);
    });
  });

  return hourlyConsumption;
};

export default function Display() {
  const [applianceList, setApplianceList] = useState([]);

  useEffect(() => {
    // Fetch appliance data (use mock data or fetch from an API)
    const data = JSON.parse(localStorage.getItem("applianceList"));
    if (data) {
      setApplianceList(data);
    }
  }, []);

  const hourlyConsumption = calculateHourlyConsumption(applianceList);

  // Calculate total energy consumption
  const totalConsumption = hourlyConsumption.reduce(
    (sum, hour) => sum + hour.total,
    0
  );
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("totalConsumption", totalConsumption);
    }
  }, [totalConsumption]);
  return (
    <div className="min-h-screen text-white p-6">
      <h1 className="text-3xl font-extrabold text-center mb-8">
        Hourly Energy Consumption
      </h1>

      <div className="overflow-x-auto shadow-lg rounded-lg border border-purple-600">
        <table className="min-w-full table-auto border-collapse bg-opacity-5">
          <thead>
            <tr className="bg-purple-800">
              <th className="border border-purple-600 px-4 py-2 text-left">
                Hour
              </th>
              <th className="border border-purple-600 px-4 py-2 text-left">
                Energy Consumption (kWh)
              </th>
              <th className="border border-purple-600 px-4 py-2 text-left">
                Devices Used
              </th>
            </tr>
          </thead>
          <tbody>
            {hourlyConsumption.map((hourData, index) => (
              <tr
                key={index}
                className={`bg-opacity-20 ${
                  index % 2 === 0 ? "bg-purple-900" : "bg-black"
                } hover:bg-purple-700`}
              >
                <td className="border border-purple-600 px-4 py-2">
                  {index}:00
                </td>
                <td className="border border-purple-600 px-4 py-2">
                  {hourData.total.toFixed(2)}
                </td>
                <td className="border border-purple-600 px-4 py-2">
                  {hourData.devices.length > 0
                    ? hourData.devices.join(", ")
                    : "None"}
                </td>
              </tr>
            ))}
            {/* Total row */}
            <tr className="bg-purple-800 text-white font-bold">
              <td className="border border-purple-600 px-4 py-2 text-left">
                Total
              </td>
              <td className="border border-purple-600 px-4 py-2 text-left">
                {totalConsumption.toFixed(2)}
              </td>
              <td className="border border-purple-600 px-4 py-2 text-left">
                -
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
