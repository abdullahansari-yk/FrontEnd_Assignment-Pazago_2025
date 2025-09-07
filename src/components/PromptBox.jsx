// src/components/PromptBox.jsx
import React from "react";
import { useState } from "react";
import sendBtn from "../assets/sendBtn.svg";
import ReactMarkdown from "react-markdown";

const PromptBox = ({ onSend, disabled = false }) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  };

  return (
    <div className="p-4  border-none">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask for Weather..."
          className="text-xl  text-black w-full pr-12 pl-4 py-5 lg:py-4 border rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={disabled}
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2"
          disabled={disabled}
        >
          <img src={sendBtn} alt="Send" className=" w-9 h-9 " />
        </button>
      </form>
    </div>
  );
};

export default PromptBox;