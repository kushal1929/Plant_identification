import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export interface PlantInfo {
  name: string;
  scientificName: string;
  category: string;
  careRequirements: {
    water: string;
    light: string;
    soil: string;
  };
  description: string;
  Type: string;
  uses: string;
}

export async function identifyPlant(imageBase64: string): Promise<PlantInfo> {
  try {
    // Remove the data URL prefix if present
    const base64Data = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create prompt for plant identification
    const prompt = `
      I'm sending you an image of a plant. Please identify it and provide the following information:
      1. Common name
      2. Scientific name
      3. Plant category (e.g., succulent, flowering plant, tree, etc.)
      4. Care requirements (water, light, soil)
      5. Brief description
      6. If it is posionous or not 
      7. can it be used for home decoration (if yes it's benifets like looks good or more oxygen supply etc)
      
      Format your response as a JSON object with the following structure:
      {
        "name": "Common Name",
        "scientificName": "Scientific Name",
        "category": "Plant Category",
        "careRequirements": {
          "water": "Water requirements",
          "light": "Light requirements",
          "soil": "Soil requirements"
        },
        "description": "Brief description",
        "Type":"Posionous or non-Posinous",
        "uses":"decorative and it's benifits"
      }
    `;

    // Generate content with the image
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Extract the JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse plant information");
    }
    
    return JSON.parse(jsonMatch[0]) as PlantInfo;
  } catch (error) {
    console.error("Error identifying plant:", error);
    return {
      name: "Identification Failed",
      scientificName: "N/A",
      category: "N/A",
      careRequirements: {
        water: "N/A",
        light: "N/A",
        soil: "N/A"
      },
      description: "Sorry, we couldn't identify this plant. Please try again with a clearer image.",
      Type: "N/A",
      uses: "N/A"
    };
  }
}