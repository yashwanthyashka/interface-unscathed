// Pinata API Configuration
// IMPORTANT: Do NOT commit this file to a public repository!
// If using Git, make sure to add this file to your .gitignore file.

export const PINATA_API_KEY = (import.meta as any).env?.VITE_PINATA_API_KEY || "PASTE_YOUR_PINATA_API_KEY_HERE";
export const PINATA_SECRET_API_KEY = (import.meta as any).env?.VITE_PINATA_SECRET_API_KEY || "PASTE_YOUR_PINATA_SECRET_API_KEY_HERE";

export const uploadToPinata = async (file: File): Promise<string> => {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY || PINATA_API_KEY.includes("PASTE")) {
    throw new Error("Pinata API keys are missing or invalid. Please check your environment variables or pinata.ts file.");
  }

  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const data = new FormData();
  data.append('file', file);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET_API_KEY
    },
    body: data
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Pinata upload failed: ${errorData.error?.reason || response.statusText}`);
  }

  const responseData = await response.json();
  return responseData.IpfsHash;
};