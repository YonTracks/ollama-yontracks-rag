// components/CodeBlockComponent.tsx

"use client";

import React, { useState } from "react";
import { CodeBlock, dracula, github } from "react-code-blocks";
import { useTheme } from "next-themes";
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
      <div className="relative my-4 overflow-scroll overflow-x-scroll  flex flex-col scrollbar-hide text-start  ">
         <button
            onClick={copyToClipboard}
            className="h-5 w-5 absolute top-2 right-2"
         >
            {isCopied ? (
               <FaCheck className="w-4 h-4 scale-100 transition-all" />
            ) : (
               <FaCopy className="w-4 h-4 scale-100 transition-all" />
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
