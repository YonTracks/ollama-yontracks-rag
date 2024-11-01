// lib/utils/handleImageUpload.ts

/* export const handleImageUpload = async (file: File) => {
  console.log("Uploading image:", file.name);
  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => {
        console.error("Error converting image to Base64:", error);
        reject(error);
      };
    });
  };

  const base64Image = await toBase64(file);

  return base64Image;
};
*/

export const handleImageUpload = async (file: File): Promise<string> => {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
