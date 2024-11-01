import DocumentUploader from "@/components/DocumentUploader";
import React from "react";

function RAGPage() {
  return (
    <div className="flex flex-col w-full justify-center items-center p-2 sm:p-4">
      <h1 className="text-xl sm:text-2xl mb-2 sm:mb-4">RAG Page</h1>

      <div>
        <DocumentUploader />
      </div>
    </div>
  );
}

export default RAGPage;
