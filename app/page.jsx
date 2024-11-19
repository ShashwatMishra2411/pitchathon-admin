"use client";
import React, { useEffect, useState } from "react";

export default function ApplianceStatus() {
  const [applianceList, setApplianceList] = useState([]);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [activeAppliances, setActiveAppliances] = useState([]);
  const [totalPower, setTotalPower] = useState(0);
  const [dailyBill, setDailyBill] = useState(0);

  const COST_PER_KWH = 0.15; // Cost per kWh (adjust based on location)

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("applianceList"));
    if (data) {
      setApplianceList(data);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const hour = new Date().getHours();
      setCurrentHour(hour);
    }, 60000); // Update every minute

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  useEffect(() => {
    const calculateUsage = () => {
      const active = applianceList.filter((appliance) =>
        appliance.hours.includes(currentHour)
      );
      setActiveAppliances(active);

      const power = active.reduce(
        (sum, appliance) => sum + appliance.power * appliance.quantity,
        0
      );
      setTotalPower(power);
      console.log(currentHour);
      let bill = 0;
      for (let i = 0; i <= currentHour; i++) {
        let list = applianceList.filter((appliance) => {
          console.log("includes = ", appliance.hours.includes(i), i);
          return appliance.hours.includes(i);
        });
        console.log("list = " + JSON.stringify(list));
        if (list.length > 0) {
          list.forEach((item) => {
            bill = bill + item.quantity * item.power;
          });
          console.log("bill = ", JSON.stringify(bill));
        }
      }
      setDailyBill(bill * COST_PER_KWH/1000);
    };

    calculateUsage();
  }, [currentHour, applianceList]);

  return (
    <div className="min-h-screen text-white p-6 container">
      <div className="max-w-4xl mx-auto shadow-lg bg-opacity-5 shadow-purple-700 backdrop-blur-3xl p-8 rounded-xl">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          Current Appliance Status
        </h1>
        <p className="text-lg mb-4">
          <strong>Current Hour:</strong> {currentHour}:00
        </p>
        <p className="text-lg mb-4">
          <strong>Total Power Consumption:</strong> {totalPower} W
        </p>
        <p className="text-lg mb-4">
          <strong>Estimated Bill (So Far):</strong> €{dailyBill.toFixed(2)}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Active Appliances:</h2>
        <ul className="list-disc pl-5 space-y-2">
          {activeAppliances.length > 0 ? (
            activeAppliances.map((appliance, index) => (
              <li key={index} className="text-lg">
                <span className="font-medium">{appliance.device}</span> -{" "}
                {appliance.quantity} devices, {appliance.power}W each
              </li>
            ))
          ) : (
            <p>No appliances are active at the moment.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
