// lib/utils/format.ts

import emojiRegex from "emoji-regex";

/**
 * Removes emojis from a given text string.
 * @param text - The input text containing emojis
 * @returns A string with all emojis removed
 */
export function removeEmojis(text: string) {
  return text.replace(emojiRegex(), "");
}

export function getBaseUrl(url: string) {
  const parsedUrl = new URL(url);
  return `${parsedUrl.protocol}//${parsedUrl.hostname}`;
}

export function generateExcerpt(content: any, maxLength = 200) {
  return content.length > maxLength
    ? `${content.slice(0, maxLength)}...`
    : content;
}

export function formatText(originalText: string) {
  // console.log("Format text test sim!");
  return originalText;
}

/**
 * Truncates a text string to a specified number of words.
 * @param text - The input text to truncate
 * @param tokenLimit - The number of words to limit the text to
 * @returns A truncated string
 */
export function truncateToNWords(text: string, tokenLimit: any) {
  const tokens = text.split(" ");
  return tokens.slice(0, tokenLimit).join(" ");
}

export function formatDate(dateString: string) {
  // console.log("Formatting date:", dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString(undefined, options);
  // console.log("Formatted date:", formattedDate);
  return formattedDate;
}

export function formatSize(size: number) {
  // console.log("Formatting size:", size);
  if (size < 1024) return `${size} B`;
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const formattedSize = `${(size / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  // console.log("Formatted size:", formattedSize);
  return formattedSize;
}
