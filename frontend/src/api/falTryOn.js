// // src/api/falTryOn.js
// export async function generateTryOn(modelImageFile, garmentImageFile) {
//     const FAL_API_URL = 'https://api.fal.ai/fal/tryon'; // Replace with the actual endpoint
//     const FAL_API_KEY = '126fdc47-3b56-43f1-a689-33599faf91d3:97cd71f82d0dd039f6321f98245afa44'; // Use secure env handling for real app
  
//     const formData = new FormData();
//     formData.append('model', modelImageFile);
//     formData.append('garment', garmentImageFile);
  
//     const response = await fetch(FAL_API_URL, {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${FAL_API_KEY}`,
//       },
//       body: formData,
//     });
  
//     if (!response.ok) {
//       throw new Error('Failed to generate try-on');
//     }
  
//     const data = await response.json();
//     return data.image_url || data.result_url; // depending on API response format
//   }
  
  // falTryOn.js
import { fal } from "@fal-ai/client";

// Initialize the fal client with your API key
fal.config({
    credentials: "e538dd3f-6e32-4a0f-a568-8b6a15700096:d9afbabbf6a0bb90904bf042d59c55ea",
});

export async function generateTryOn(modelImageUrl, garmentImageUrl, category = "tops") {
  try {
    const result = await fal.subscribe("fashn/tryon", {
      input: {
        model_image: modelImageUrl,
        garment_image: garmentImageUrl,
        category,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    return result.data;
  } catch (error) {
    console.error("Error generating try-on:", error);
    throw error;
  }
}
