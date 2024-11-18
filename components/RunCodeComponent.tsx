// components/RunCodeComponent.tsx

"use client";

import { useTheme } from "next-themes";
import React, { useState } from "react";
import { CodeBlock, dracula, github } from "react-code-blocks";
import { FaCheck, FaCopy, FaPlay } from "react-icons/fa";

interface ButtonCodeblockProps {
  code: string;
  lang: string;
}

export default function RunCodeComponent({ code, lang }: ButtonCodeblockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const { theme } = useTheme();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  };

  const runCode = async () => {
    try {
      const response = await fetch("/api/execute-python", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();
      setExecutionResult(result.output || "Error executing code");
    } catch (error) {
      console.log("Error running code:", error);
      setExecutionResult("Error executing code");
    }
  };

  return (
    <div className="relative my-4 flex flex-col overflow-scroll text-start">
      <div className="absolute right-2 top-2 flex space-x-2">
        <button onClick={copyToClipboard}>
          {isCopied ? <FaCheck /> : <FaCopy />}
        </button>
        {lang === "python" && (
          <button onClick={runCode}>
            <FaPlay />
          </button>
        )}
      </div>
      <CodeBlock
        customStyle={
          theme === "dark"
            ? { background: "#303033" }
            : { background: "#fcfcfc" }
        }
        text={code}
        language={lang}
        showLineNumbers={false}
        theme={theme === "dark" ? dracula : github}
      />
      {executionResult && (
        <div className="mt-4 rounded-md p-2">
          <h4 className="font-semibold">Execution Result:</h4>
          <pre>{executionResult}</pre>
        </div>
      )}
    </div>
  );
}
