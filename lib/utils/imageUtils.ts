// lib/utils/imageUtils.ts

// Validate base64Image before sending

export const isValidBase64 = (image: string) => {
  // Check if the string starts with a valid data URL prefix
  const dataUrlPattern = /^data:image\/(png|jpeg|jpg);base64,/;
  return dataUrlPattern.test(image);
};
