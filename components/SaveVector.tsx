// components/SaveVector.tsx

"use client";

import { useState } from "react";

export const SaveVector = () => {
  const [text, setText] = useState("");

  const handleSave = async () => {
    await fetch("/api/saveVector", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
    alert("Vector saved!");
  };

  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleSave}>Save</button>
    </div>
  );
};
