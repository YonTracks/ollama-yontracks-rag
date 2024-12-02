// lib/tools/getBase64Image.ts

/**
 * Converts an image file to a base64-encoded string.
 * @param imageFile - The image file to be converted
 */
export async function getBase64Image(args: {
  imageFile: File;
}): Promise<string> {
  const { imageFile } = args;

  try {
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  } catch (error: unknown) {
    console.error("Error converting image to base64:", error);
    return JSON.stringify({
      error: `Error converting image to base64: ${error}`,
    });
  }
}
