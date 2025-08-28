import React, { useState } from "react";
import NumberTextLab from "./components/NumberTextLab";
import GraphicsAnalyzer from "./components/GraphicsAnalyzer";

export default function App() {
  const [tab, setTab] = useState("numbers_and_text");

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Digital Representation Lab</h1>
        <nav className="space-x-2">
          <button
            className={`px-4 py-2 rounded ${
              tab === "numbers_and_text" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setTab("numbers_and_text")}
          >
            Numbers and Text
          </button>
          <button
            className={`px-4 py-2 rounded ${
              tab === "graphics" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setTab("graphics")}
          >
            Graphics
          </button>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4">
        {tab === "numbers_and_text" && <NumberTextLab />}
        {tab === "graphics" && <GraphicsAnalyzer />}
      </main>
    </div>
  );
}
