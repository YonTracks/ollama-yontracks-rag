// components/CodeBlockComponent.tsx

"use client";

import { useTheme } from "next-themes";
import React, { useState } from "react";
import { CodeBlock, dracula, github } from "react-code-blocks";
import { FaCheck, FaCopy } from "react-icons/fa";
interface ButtonCodeblockProps {
  code: string;
  lang: string;
}

export default function CodeBlockComponent({
  code,
  lang,
}: ButtonCodeblockProps) {
  const [isCopied, setisCopied] = useState(false);
  const { theme } = useTheme();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setisCopied(true);

    setTimeout(() => {
      setisCopied(false);
    }, 1500);
  };

  return (
    <div className="relative my-4 flex  flex-col overflow-scroll text-start  ">
      <button
        onClick={copyToClipboard}
        className="absolute right-2 top-2 size-5"
      >
        {isCopied ? (
          <FaCheck className="size-4 scale-100 transition-all" />
        ) : (
          <FaCopy className="size-4 scale-100 transition-all" />
        )}
      </button>
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
    </div>
  );
}
