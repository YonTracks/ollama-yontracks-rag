// lib/utils/extractCodeSnippets.ts

export const extractCodeSnippets = (response: string) => {
  const codeRegex = /```(.*?)\n([\s\S]+?)```/g;
  let match;
  const snippets: Array<{ code: string; language: string }> = [];

  while ((match = codeRegex.exec(response)) !== null) {
    snippets.push({
      code: match[2].trim(),
      language: match[1] || "plaintext",
    });
  }

  return snippets.length > 0 ? snippets : null;
};
