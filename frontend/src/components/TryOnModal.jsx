import React, { useState } from 'react';
import { fal } from '@fal-ai/client';
import { XMarkIcon } from '@heroicons/react/24/solid';
import FileUpload from './FileUpload';
import TryOnResult from './TryOnResult';

const TryOnModal = ({ showTryOn, setShowTryOn, selectedItem }) => {
  const [modelImage, setModelImage] = useState(null);
  const [tryOnResult, setTryOnResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleModelUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setModelImage(imageUrl); // Set the model image URL
    }
  };

  const handleTryOn = async () => {
    if (!modelImage || !selectedItem?.image) return;

    setLoading(true);
    try {
      // Pass the model image from user and garment image from selectedItem
      const result = await generateTryOn(modelImage, selectedItem.image);
      setTryOnResult(result); // Store the result for displaying
    } catch (error) {
      console.error('Try-on failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!showTryOn || !selectedItem) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg max-w-3xl w-full relative shadow-xl">
        <button
          onClick={() => setShowTryOn(false)}
          className="absolute top-4 right-4 text-zinc-500 hover:text-red-400"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">Virtual Clothes Try-On</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Model Upload */}
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Upload Model Photo</h2>
                      <p className="text-sm text-gray-500 mb-2">
                        Clear full-body photo, plain background recommended (JPEG/PNG)
                      </p>
                      <FileUpload 
                        onUpload={handleModelUpload} 
                        type="model" 
                        accept="image/jpeg, image/png"
                      />
                      {modelImageUrl && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-1">Preview:</h3>
                          <img 
                            src={modelImageUrl} 
                            alt="Model preview" 
                            className="mt-1 max-h-40 rounded-md border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                  
                      <div>
  <h2 className="text-xl font-semibold mb-4">Selected Garment</h2>
  <p className="text-sm text-gray-500 mb-2">
    This image is provided from our catalog. You cannot change it.
  </p>

  <div className="mt-4">
    <label className="block font-semibold mb-2">Garment Preview</label>
            <div className="border p-4 rounded-lg text-center dark:border-zinc-600">
              <img src={selectedItem.image} type="garment" alt="garment" className="w-full h-48 object-contain mx-auto" />
              <p className="text-sm mt-2">{selectedItem.title}</p>
            </div>
  </div>
</div>
</div>
                      
          {/* Garment Preview (comes from selectedItem.image)
          <div>
            <label className="block font-semibold mb-2">Garment Preview</label>
            <div className="border p-4 rounded-lg text-center dark:border-zinc-600">
              <img src={selectedItem.image} type="garment" alt="garment" className="w-full h-48 object-contain mx-auto" />
              <p className="text-sm mt-2">{selectedItem.title}</p>
            </div>
          </div>
        </div> */}


        <div className="mt-6 text-center">
          <button
            onClick={handleTryOn}
            className="bg-emerald-500 hover:bg-emerald-600 px-6 py-2 text-white rounded-full"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Try-On'}
          </button>
        </div>

        {tryOnResult && (
          <div className="mt-6 text-center">
            <h3 className="font-semibold mb-2">Result</h3>
            <img src={tryOnResult.output_image} alt="Try-On Result" className="w-full h-80 object-contain mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
};

export default TryOnModal;
