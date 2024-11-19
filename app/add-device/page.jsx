"use client";
import React, { useEffect, useState } from "react";

export default function ApplianceForm() {
  const [applianceData, setApplianceData] = useState({
    device: "",
    power: "",
    quantity: 1,
    hours: "",
  });

  const [applianceList, setApplianceList] = useState([]);
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("applianceList"));
    if (data) {
      setApplianceList(data);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setApplianceData({ ...applianceData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newAppliance = {
      device: applianceData.device,
      power: parseFloat(applianceData.power),
      quantity: parseInt(applianceData.quantity),
      hours: applianceData.hours
        .split(",")
        .map((hour) => parseInt(hour.trim())),
    };

    const updatedApplianceList = [...applianceList, newAppliance];
    setApplianceList(updatedApplianceList);
    localStorage.setItem("applianceList", JSON.stringify(updatedApplianceList));
    setApplianceData({ device: "", power: "", quantity: 1, hours: "" });
  };

  const handleDelete = (index) => {
    const updatedApplianceList = applianceList.filter((_, i) => i !== index);
    setApplianceList(updatedApplianceList);
    localStorage.setItem("applianceList", JSON.stringify(updatedApplianceList));
  };

  return (
    <div className="min-h-screen text-white p-6 container">
      <div className="max-w-4xl mx-auto shadow-lg bg-opacity-5 shadow-purple-700 backdrop-blur-3xl p-8 rounded-xl">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          Enter Appliance Details
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="device" className="block text-lg font-medium">
              Device Name
            </label>
            <input
              type="text"
              id="device"
              name="device"
              value={applianceData.device}
              onChange={handleChange}
              className="w-full  p-3 rounded-md border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
              required
            />
          </div>
          <div>
            <label htmlFor="power" className="block text-lg font-medium">
              Power Consumption (W)
            </label>
            <input
              type="number"
              id="power"
              name="power"
              value={applianceData.power}
              onChange={handleChange}
              className="w-full p-3 rounded-md border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
              required
            />
          </div>
          <div>
            <label htmlFor="quantity" className="block text-lg font-medium">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={applianceData.quantity}
              onChange={handleChange}
              className="w-full p-3 rounded-md border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
              min="1"
              required
            />
          </div>
          <div>
            <label htmlFor="hours" className="block text-lg font-medium">
              Hours of Usage (comma-separated)
            </label>
            <input
              type="text"
              id="hours"
              name="hours"
              value={applianceData.hours}
              onChange={handleChange}
              className="w-full p-3 rounded-md border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
              placeholder="e.g., 8, 9, 10"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-300"
          >
            Submit
          </button>
        </form>

        <div className="mt-8">
          <h2 className="text-xl font-semibold">Appliance List:</h2>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            {applianceList.map((appliance, index) => (
              <li key={index} className="text-lg">
                <span className="font-medium">{appliance.device}</span> -{" "}
                {appliance.quantity} devices, {appliance.power}W each, used at
                hours: {appliance.hours.join(", ")}
                <button
                  onClick={() => handleDelete(index)}
                  className="ml-4 text-white text-base font-semibold rounded-2xl p-2 bg-red-500 hover:scale-105 duration-150"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
