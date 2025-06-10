import React, { useState } from 'react';
import { fal } from '@fal-ai/client';
import { XMarkIcon } from '@heroicons/react/24/solid';
import FileUpload from './FileUpload';
import TryOnResult from './TryOnResult';

const TryOnModal = ({ showTryOn, setShowTryOn, selectedItem }) => {
  const [modelImage, setModelImage] = useState(null);
    const [modelImageUrl, setModelImageUrl] = useState(null);
    const [garmentImage, setGarmentImage] = useState(null);
    const [garmentImageUrl, setGarmentImageUrl] = useState(null);
    const [category, setCategory] = useState('tops');
    const [resultUrls, setResultUrls] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tryOnResult, setTryOnResult] = useState(null);

    const [advancedOptions, setAdvancedOptions] = useState({
      showAdvanced: false,
      garmentPhotoType: 'auto',
      nsfwFilter: true,
      coverFeet: false,
      adjustHands: false,
      restoreBackground: false,
      restoreClothes: false,
      longTop: false,
      guidanceScale: 2,
      timesteps: 50,
      seed: 42,
      numSamples: 1,
    });
  
    const handleModelUpload = async (file) => {
      setModelImage(file);
      setModelImageUrl(URL.createObjectURL(file));
    };
  
    const handleGarmentUpload = async (file) => {
      setGarmentImage(file);
      setGarmentImageUrl(URL.createObjectURL(file));
    };
  
    const uploadImageToFal = async (file) => {
      try {
        const result = await fal.storage.upload(file);
        return result;
      } catch (err) {
        console.error('Upload error:', err);
        throw new Error('Failed to upload image to FAL storage');
      }
    };
  
    const handleTryOn = async () => {
      if (!modelImage || !garmentImage) {
        setError('Please upload both a model image and a garment image');
        return;
      }
  
      setIsLoading(true);
      setError(null);
      setResultUrls([]);
      setProgress('Starting try-on process...');
  
      try {
        // Step 1: Upload model image
        setProgress('Uploading model image...');
        const modelImageUrl = await uploadImageToFal(modelImage);
        
        // Step 2: Upload garment image
        setProgress('Uploading garment image...');
        const garmentImageUrl = await uploadImageToFal(garmentImage);
  
        // Step 3: Submit try-on request
        setProgress('Submitting try-on request...');
        const result = await fal.subscribe("fashn/tryon", {
          input: {
            model_image: modelImageUrl,
            garment_image: garmentImageUrl,
            category: category,
            garment_photo_type: advancedOptions.garmentPhotoType,
            nsfw_filter: advancedOptions.nsfwFilter,
            cover_feet: advancedOptions.coverFeet,
            adjust_hands: advancedOptions.adjustHands,
            restore_background: advancedOptions.restoreBackground,
            restore_clothes: advancedOptions.restoreClothes,
            long_top: advancedOptions.longTop,
            guidance_scale: advancedOptions.guidanceScale,
            timesteps: advancedOptions.timesteps,
            seed: advancedOptions.seed,
            num_samples: advancedOptions.numSamples,
          },
          logs: true,
          onQueueUpdate: (update) => {
            if (update.status === "IN_PROGRESS") {
              const messages = update.logs.map(log => log.message);
              setProgress(messages.join('\n'));
            }
          },
        });
  
        console.log('API Response:', result);
  
        if (!result) {
          throw new Error('No response received from API');
        }
  
        if (result.error) {
          throw new Error(result.error.message || 'API returned an error');
        }
  
        if (!result.data.images || result.data.images.length === 0) {
          throw new Error('API completed but returned no images');
        }
  
        setResultUrls(result.data.images.map(img => img.url));
        setProgress('Try-on completed successfully!');
      } catch (err) {
        console.error('Full error details:', err);
        
        let errorMessage = 'Failed to process images. Please try again.';
        if (err.message.includes('NSFW')) {
          errorMessage = 'Content flagged as inappropriate. Please try different images.';
        } else if (err.message.includes('size') || err.message.includes('dimension')) {
          errorMessage = 'Image size or dimensions not supported. Please try different images.';
        } else if (err.response?.status === 429) {
          errorMessage = 'Too many requests. Please wait and try again later.';
        } else if (err.message) {
          errorMessage = err.message;
        }
  
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
  
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
