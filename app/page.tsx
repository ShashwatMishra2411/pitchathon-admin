"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

export interface IBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IPoint {
  x: number;
  y: number;
}
export interface IDetectedBarcode {
  boundingBox: IBoundingBox;
  cornerPoints: IPoint[];
  format: string;
  rawValue: string;
}

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    male: "0",
    female: "0",
    total: "0",
  });
  const [result, setResult] = useState<IDetectedBarcode>();
  const [value, setValue] = useState({
    teamID: "",
    participantID: "",
    gender: "",
  });
  const [allow, setAllow] = useState<boolean>(true); // Controls when scanning is allowed

  useEffect(() => {}, []);
  useEffect(() => {
    if (!allow) {
      const id = setTimeout(() => {
        setAllow(true); // Re-enable scanning after 5 seconds
      }, 5000);

      return () => {
        clearTimeout(id);
      };
    }
  }, [allow]);

  async function handleScan(result: IDetectedBarcode) {
    if (result.rawValue.length > 0 && allow) {
      // Ensure scanning is only allowed when `allow` is true
      setResult(result);
      console.log(result.rawValue);
      try {
        const jsonString = result.rawValue
          .replace(/(\w+):/g, '"$1":') // Add quotes around keys
          .replace(/'/g, '"'); // Replace single quotes with double quotes
        const jsonObject = JSON.parse(jsonString);
        console.log(jsonObject);
        setValue(jsonObject);

        // Call API to save the result
        const response = await fetch("/api/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Ensures the body is parsed as JSON
          },
          body: JSON.stringify({
            teamid: jsonObject.teamID,
            participantid: jsonObject.participantID,
            gender: jsonObject.gender,
          }),
        });
        console.log(response.body);
      } catch (error) {
        console.error("Failed to parse JSON:", error);
      } finally {
        setAllow(false); // Disable scanning after processing the result
      }
    }
  }

  async function handleClick() {
    setLoading(true);
    const response = await fetch("/api/getParticipants", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const res = await response.json();
    setData(res);
    console.log(res);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col gap-10 justify-center items-center overflow-hidden">
      <h1 className="my-20 mx-10 font-bold text-xl text-center">
        {value?.teamID ? (
          <div>
            <div>Team ID: {value.teamID}</div>
            <div>Participant ID: {value.participantID}</div>
            <div>Gender:{value.gender}</div>
          </div>
        ) : (
          "Please Scan the code"
        )}
      </h1>
      <Scanner
        paused={!allow} // Pause the scanner if scanning is not allowed
        classNames={{}}
        styles={{
          container: {
            width: "60%",
            maxWidth: "500px",
            height: "auto",
            aspectRatio: "1 / 1",
            border: "1px solid red",
          },
        }}
        allowMultiple={false} // Only one scan at a time
        onScan={(result) => {
          handleScan(result[0]); // Pass the first scan result to the handler
        }}
      />
      <div className="flex gap-10">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="flex gap-10">
            <div>Total:{data.total}</div>
            <div>Girls:{data.female}</div>
            <div>Boys:{data.male}</div>
            <button type="button" onClick={handleClick}>
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
