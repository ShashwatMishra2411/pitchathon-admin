"use client";
import React, { useEffect, useState } from "react";

export default function Page() {
  const [list, setList] = useState([]);
  const [selectedHour, setSelectedHour] = useState("hr0");
  const [cart, setCart] = useState([]);
  const [dynamicRates, setDynamicRates] = useState({
    EDF: 0.22,
    EON: 0.24,
    Iberdrola: 0.2,
    Enel: 0.23,
    RWE: 0.25,
    Fortum: 0.21,
  });
  const [error, setError] = useState("");
  const [baseRates, setBaseRates] = useState({
    EDF: 0.22,
    EON: 0.24,
    Iberdrola: 0.2,
    Enel: 0.23,
    RWE: 0.25,
    Fortum: 0.21,
  });

  useEffect(() => {
    const carts = JSON.parse(localStorage.getItem("cart")) || [];
    if (carts.length > 0) {
      carts.forEach((item) => {
        setBaseRates((prevRates) => {
          return {
            ...prevRates,
            [item.company]: baseRates[item.company] + 0.01 * item.quantity,
          };
        });
      });
    }
    const fetchData = async () => {
      const resp = await fetch("/api/getParticipants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const res = await resp.json();
      setList(res);
    };
    fetchData();
    console.log("Hello");
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, []);

  const calculateCosts = () => {
    const hourData = list.find((item) => item.hour === selectedHour);
    if (!hourData) return [];
    return Object.entries(dynamicRates).map(([company, rate]) => ({
      company,
      cost: (hourData.total * rate).toFixed(2), // Format to 2 decimal places
    }));
  };

  const adjustDynamicRate = (company, delta) => {
    setDynamicRates((prevRates) => ({
      ...prevRates,
      [company]: Math.max(
        baseRates[company],
        prevRates[company] + delta * 0.01
      ), // Increment or decrement by 0.01
    }));
  };

  const addToCart = (company, cost) => {
    setError("");
    const alreadyExists = cart.some(
      (item) => item.hour === selectedHour && item.company !== company
    );

    if (alreadyExists) {
      setError(
        `You cannot select multiple providers for the same hour (${selectedHour.substring(
          2
        )}:00 - ${selectedHour.substring(2)}:59).`
      );
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.company === company && item.hour === selectedHour
      );
      if (existingItem) {
        adjustDynamicRate(company, 1); // Increase the rate
        return prevCart.map((item) =>
          item.company === company && item.hour === selectedHour
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      adjustDynamicRate(company, 1); // Increase the rate for new addition
      return [
        ...prevCart,
        { hour: selectedHour, company, cost: parseFloat(cost), quantity: 1 },
      ];
    });
  };

  const updateQuantity = (company, hour, delta) => {
    setCart(
      (prevCart) =>
        prevCart
          .map((item) => {
            if (item.company === company && item.hour === hour) {
              if (item.quantity + delta <= 0) {
                adjustDynamicRate(company, -1); // Decrease rate if item is removed
                return null; // Remove item from cart
              }
              adjustDynamicRate(company, delta); // Adjust rate based on change
              return { ...item, quantity: item.quantity + delta };
            }
            return item;
          })
          .filter((item) => item) // Remove null entries
    );
  };

  const handleBuy = () => {
    localStorage.setItem("bought", JSON.stringify(cart));
    localStorage.setItem("cart", JSON.stringify([]));
    setCart([]);
  };
  // useEffect(() => {
  //   // setCart(JSON.parse(localStorage.getItem("cart")) || []);
  //   localStorage.setItem("cart", JSON.stringify(cart));
  // }, [cart]);
  const costs = calculateCosts();
  console.log(list);
  return (
    <div className="flex flex-col items-center min-h-screen p-4 text-white">
      <h1 className="text-3xl font-bold mb-6">MarketPlace</h1>
      <table className="table-auto border-collapse border border-gray-300 w-full mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2 text-left text-gray-700">
              Time
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-gray-700">
              Demand (kWh)
            </th>
          </tr>
        </thead>
        <tbody>
          {list.map((item, index) => (
            <tr
              key={item.hour}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
            >
              <td className="border border-gray-300 px-4 py-2 text-gray-800">
                {item.hour.substring(2)}:00 - {item.hour.substring(2)}:59
              </td>
              <td className="border border-gray-300 px-4 py-2 text-gray-800">
                {item.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div></div>
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md mb-8">
        <label
          htmlFor="hour-select"
          className="block text-gray-700 font-semibold mb-2"
        >
          Select Hour:
        </label>
        <select
          id="hour-select"
          value={selectedHour}
          onChange={(e) => setSelectedHour(e.target.value)}
          className="w-full text-black border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {list.map((item) => (
            <option className="text-black" key={item.hour} value={item.hour}>
              {item.hour.substring(2)}:00 - {item.hour.substring(2)}:59
            </option>
          ))}
        </select>
        {error && (
          <p className="text-red-500 text-sm font-semibold mb-4">{error}</p>
        )}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Costs for {selectedHour.substring(2)}:00 - {selectedHour.substring(2)}
          :59
        </h2>
        <ul className="space-y-3">
          {costs.map(({ company, cost }) => (
            <li
              key={company}
              className="flex justify-between items-center bg-gray-100 rounded-lg p-3 shadow-sm"
            >
              <span className="font-medium text-gray-800">{company}</span>
              <span className="text-gray-700">€{cost}</span>
              <button
                onClick={() => addToCart(company, cost)}
                className="ml-4 px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
              >
                Add to Cart
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Cart</h2>
        {cart.length === 0 ? (
          <p className="text-gray-600">Your cart is empty.</p>
        ) : (
          <ul className="space-y-3">
            {cart.map((item) => (
              <li
                key={`${item.company}-${item.hour}`}
                className="flex justify-between items-center bg-gray-100 rounded-lg p-3 shadow-sm"
              >
                <span className="font-medium text-gray-800">
                  {item.hour.substring(2)}:00 - {item.hour.substring(2)}:59
                </span>
                <span className="text-gray-700">{item.company}</span>
                <span className="text-gray-700">
                  €{(item.cost * item.quantity).toFixed(2)} ({item.quantity})
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateQuantity(item.company, item.hour, -1)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-400"
                  >
                    -
                  </button>
                  <button
                    onClick={() => updateQuantity(item.company, item.hour, 1)}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-400"
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={handleBuy}
          className="bg-black self-center hover:scale-110 duration-150 ease-in-out p-2 text-lg font-semibold rounded-xl m-2"
        >
          Buy
        </button>
        <button
          onClick={() => {
            localStorage.setItem("cart", JSON.stringify(cart));
          }}
          className="bg-black self-center hover:scale-110 duration-150 ease-in-out p-2 text-lg font-semibold rounded-xl m-2"
        >
          Save
        </button>
      </div>
    </div>
  );
}
