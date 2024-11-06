// components/PromptList.tsx

import React from "react";

interface PromptListProps {
  setPrompt: (prompt: string) => void;
}

const PromptList: React.FC<PromptListProps> = ({ setPrompt }) => {
  const prompts = [
    "Create a snake game using Go.",
    "Explain E=MC².",
    "Write a poem about the ocean.",
    "There are 49 dogs signed up for a dog show. There are 36 more small dogs than large dogs. How many small dogs have signed up to compete?",
    "Crack the following code. A numeric lock has a 3 digit key. Here are the hints given: 4, 8, 2, one number is correct and well placed. 4, 1, 6, one number is correct but wrong placed. 2, 0, 4, two numbers are correct but wrong placed. 7, 3, 8, nothing is correct. 7, 8, 0, one number is correct but wrong placed. A) 062 B) 602 C) 042 D) 204",
    "Write code to check if number is prime, use that to see if the number 7 is prime",
  ];

  return (
    <div className="flex flex-col items-center space-y-2 p-4">
      <h2 className="mb-2 text-lg font-semibold">Try one of these prompts</h2>
      <ul className="w-full max-w-md space-y-2">
        {prompts.map((prompt, index) => (
          <li key={index}>
            <button
              className="w-full rounded-md bg-gray-100 px-4 py-2 text-left shadow-sm hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
              onClick={() => setPrompt(prompt)}
            >
              {prompt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PromptList;
