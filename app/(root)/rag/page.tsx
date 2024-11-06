import React from "react";

import DocumentUploader from "@/components/DocumentUploader";

function RAGPage() {
  return (
    <div className="flex w-full flex-col items-center justify-center p-2 sm:p-4">
      <h1 className="mb-2 text-xl sm:mb-4 sm:text-2xl">RAG Page</h1>

      <div>
        <DocumentUploader />
      </div>
    </div>
  );
}

export default RAGPage;
