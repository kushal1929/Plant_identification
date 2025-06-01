"use client";

import { useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { identifyPlant, PlantInfo } from "./utils/gemini";

export default function Home() {
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setError(null);
    setPlantInfo(null);
    setLoading(true);

    try {
      // Preview the image
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setImageFile(base64);

        try {
          // Identify the plant
          const info = await identifyPlant(base64);
          console.log("Plant identification response:", info);
          
          // Check if identification failed and handle appropriately
          if (info.name === "Identification Failed") {
            setError("Technical issue occurred during identification");
            setPlantInfo(null);
          } else if (info.name === "Unknown Plant") {
            // We'll handle unknown plants specially, but still set the plantInfo
            setPlantInfo(info);
            setError(null);
          } else {
            // Normal successful identification
            setPlantInfo(info);
            setError(null);
          }
        } catch (err) {
          setError("Failed to identify the plant. Please try again.");
          setPlantInfo(null);
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setLoading(false);
      setError("An error occurred while processing the image.");
      setPlantInfo(null);
      console.error(err);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"]
    },
    maxFiles: 1,
    multiple: false
  });

  const handleRetry = () => {
    setImageFile(null);
    setPlantInfo(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-emerald-800 mb-2">PlantIdentify</h1>
          <p className="text-emerald-600 text-lg">
            Upload a photo of any plant to identify it instantly
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center h-64 transition-colors cursor-pointer ${
                isDragActive
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50"
              }`}
            >
              <input {...getInputProps()} />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-emerald-500 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {isDragActive ? (
                <p className="text-emerald-600 text-center">Drop the image here...</p>
              ) : (
                <p className="text-gray-500 text-center">
                  Drag & drop a plant image here, or click to select a file
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Supports: JPG, PNG, WebP images
              </p>
            </div>

            {imageFile && (
              <div className="mt-4 relative h-48 w-full rounded-lg overflow-hidden">
                <Image
                  src={imageFile}
                  alt="Uploaded plant"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}
            
            {(plantInfo?.name === "Unknown Plant" || error) && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleRetry}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Try with a different image
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                <p className="mt-4 text-emerald-600">Analyzing your plant...</p>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="text-red-500 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <p className="text-red-600 mb-4 text-center">{error}</p>
                <div className="bg-amber-50 rounded-lg p-4 w-full">
                  <h3 className="font-medium text-amber-800 mb-2">Photography Tips:</h3>
                  <ul className="text-sm text-amber-700 list-disc pl-5 space-y-1">
                    <li>Take a clear, well-lit photo</li>
                    <li>Include leaves, flowers, and overall structure</li>
                    <li>Avoid blurry or dark images</li>
                    <li>Try to capture distinctive features of the plant</li>
                  </ul>
                </div>
              </div>
            ) : plantInfo?.name === "Unknown Plant" ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-amber-700">
                  Unknown Plant
                </h2>
                <div className="bg-amber-50 rounded-lg p-4">
                  <h3 className="font-medium text-amber-800 mb-2">Photography Tips:</h3>
                  <p className="text-amber-700">{plantInfo.description}</p>
                </div>
              </div>
            ) : plantInfo ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-emerald-800">
                  {plantInfo.name}
                </h2>
                <p className="text-gray-600 italic">{plantInfo.scientificName}</p>
                <div className="bg-emerald-50 rounded-lg p-3">
                  <p className="text-sm text-emerald-800">
                    <span className="font-medium">Category:</span> {plantInfo.category}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-emerald-700 mb-2">Care Requirements:</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-blue-800 mb-1">Water</p>
                      <p className="text-sm text-blue-700">{plantInfo.careRequirements.water}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-yellow-800 mb-1">Light</p>
                      <p className="text-sm text-yellow-700">{plantInfo.careRequirements.light}</p>
                    </div>
                    <div className="bg-brown-50 rounded-lg p-3" style={{ backgroundColor: "rgb(247, 236, 213)" }}>
                      <p className="text-xs font-medium text-yellow-900 mb-1">Soil</p>
                      <p className="text-sm text-yellow-900">{plantInfo.careRequirements.soil}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-emerald-700 mb-1">Description:</h3>
                  <p className="text-gray-700 text-sm">{plantInfo.description}</p>
                </div>
                <div>
                  <h4 className="font-medium text-emerald-700 mb-1">Type:</h4>
                  <p className="text-gray-700 text-sm">{plantInfo.Type}</p>
                </div>
                <div>
                  <h5 className="font-medium text-emerald-700 mb-1">uses:</h5>
                  <p className="text-gray-700 text-sm">{plantInfo.uses}</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="text-emerald-500 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-emerald-700 mb-2">
                  Upload a Plant Image
                </h2>
                <p className="text-gray-500">
                  Information about your plant will appear here once you upload an image
                </p>
                <div className="mt-6 bg-blue-50 rounded-lg p-4 text-left">
                  <h3 className="font-medium text-blue-800 mb-1">For best results:</h3>
                  <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
                    <li>Take a clear, well-lit photo</li>
                    <li>Include leaves, flowers, and overall structure</li>
                    <li>Avoid blurry or dark images</li>
                    <li>Try to capture distinctive features of the plant</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} PlantIdentify | Powered by Google Gemini AI</p>
        </footer>
      </div>
    </main>
  );
}