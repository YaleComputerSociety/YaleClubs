"use client";

import { useABTest } from "@/lib/clientABTest";
import { useState } from "react";

export default function ABTestDemo() {
  const { variation, loading, logEvent } = useABTest("homepage_layout");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleClick = () => {
    logEvent("button_click", { timestamp: Date.now() });
    addLog(`Logged button_click event for variation ${variation}`);
  };

  const handleConversion = () => {
    logEvent("conversion", { timestamp: Date.now() });
    addLog(`Logged conversion event for variation ${variation}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading A/B test...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">A/B Testing Demo</h1>

        {/* Current Variation Display */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-2xl font-semibold mb-4">Current Assignment</h2>
          <div className="bg-blue-100 p-4 rounded">
            <p className="text-lg">
              <strong>Test:</strong> homepage_layout
            </p>
            <p className="text-lg">
              <strong>Variation:</strong>{" "}
              <span className="font-mono text-2xl text-blue-600">{variation}</span>
            </p>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Refresh the page multiple times - you should always see the same variation!
          </p>
        </div>

        {/* Visual Differences Based on Variation */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-2xl font-semibold mb-4">Variation Display</h2>
          {variation === "A" ? (
            <div className="bg-red-100 border-4 border-red-500 p-8 rounded-lg text-center">
              <h3 className="text-3xl font-bold text-red-700 mb-4">
                🔴 Version A Layout
              </h3>
              <p className="text-lg text-red-600">
                This is what users in variation A see
              </p>
            </div>
          ) : (
            <div className="bg-green-100 border-4 border-green-500 p-8 rounded-lg text-center">
              <h3 className="text-3xl font-bold text-green-700 mb-4">
                🟢 Version B Layout
              </h3>
              <p className="text-lg text-green-600">
                This is what users in variation B see
              </p>
            </div>
          )}
        </div>

        {/* Event Logging Buttons */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-2xl font-semibold mb-4">Test Event Logging</h2>
          <div className="flex gap-4">
            <button
              onClick={handleClick}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Log Button Click
            </button>
            <button
              onClick={handleConversion}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Log Conversion
            </button>
          </div>
        </div>

        {/* Event Log Display */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Event Log</h2>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No events logged yet. Click the buttons above!</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Analytics Link */}
        <div className="mt-8 bg-yellow-50 border-2 border-yellow-300 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">View Analytics</h3>
          <p className="mb-3">
            Open your browser console and run this to see analytics:
          </p>
          <code className="block bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
            fetch('/api/abtest/analytics?testName=homepage_layout').then(r =&gt; r.json()).then(console.log)
          </code>
        </div>
      </div>
    </div>
  );
}
