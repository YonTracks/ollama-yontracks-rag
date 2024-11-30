"use client";

// import { v4 as uuidv4 } from "uuid";

import DetokenizerComponent from "@/components/DetokenizerComponent";
import DocumentUploader from "@/components/DocumentUploader";
import TokenizerComponent from "@/components/TokenizerComponent";

export default function RAGPage() {
  return (
    <div className="flex w-full flex-col items-center justify-center p-4">
      <h1 className="mb-4 text-2xl font-bold">RAG System</h1>
      <DocumentUploader />
      <div className="sm:flex ">
        <TokenizerComponent />
        <DetokenizerComponent />
      </div>
    </div>
  );
}
