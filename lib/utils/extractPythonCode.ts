// lib/utils/extractPythonCode.ts

export const extractPythonCode = (response: string) => {
  const codeRegex = /<\|python_tag\|>([\s\S]+?)$/g; // Adjusted regex pattern to capture content till end
  let match;
  const snippets: Array<{ code: string; language: string }> = [];

  while ((match = codeRegex.exec(response)) !== null) {
    snippets.push({
      code: match[1].trim(),
      language: "python",
    });
  }

  // console.log("Extracted Python Snippets:", snippets); // Debugging log
  return snippets.length > 0 ? snippets : null;
};
