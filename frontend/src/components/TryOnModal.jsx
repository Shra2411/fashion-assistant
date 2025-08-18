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
    // Upload model image
    setProgress('Uploading model image...');
    const uploadedModelUrl = await uploadImageToFal(modelImage);

    // Upload garment image
    setProgress('Uploading garment image...');
    const uploadedGarmentUrl = await uploadImageToFal(garmentImage);

    // Submit try-on request
    setProgress('Submitting try-on request...');
    const result = await fal.subscribe("fal-ai/fashn/tryon/v1.5", {
      input: {
        model_image: uploadedModelUrl,
        garment_image: uploadedGarmentUrl,
        category: category || "auto",
        mode: "balanced", // or "performance" or "quality"
        garment_photo_type: advancedOptions.garmentPhotoType || "auto",
        moderation_level: advancedOptions.nsfwFilter ? "permissive" : "none",
        seed: advancedOptions.seed || 42,
        num_samples: advancedOptions.numSamples || 1,
        segmentation_free: true,
        output_format: "png"
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          const messages = update.logs.map(log => log.message);
          setProgress(messages.join('\n'));
        }
      }
    });

    console.log('API Response:', result);

    if (!result || result.error) {
      throw new Error(result?.error?.message || 'API returned an error');
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
            <label className="block font-semibold mb-2">Upload Model Photo</label>
            <div className="border-2 border-dashed p-4 rounded-lg relative text-center dark:border-zinc-600">
              {modelImage ? (
                <img src={modelImage} alt="model" className="w-full h-48 object-contain mx-auto" />
              ) : (
                <p className="text-sm text-zinc-400">Click to upload model image</p>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleModelUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Garment Preview (comes from selectedItem.image) */}
          <div>
            <label className="block font-semibold mb-2">Garment Preview</label>
            <div className="border p-4 rounded-lg text-center dark:border-zinc-600">
              <img src={selectedItem.image} alt="garment" className="w-full h-48 object-contain mx-auto" />
              <p className="text-sm mt-2">{selectedItem.title}</p>
            </div>
          </div>
        </div>

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
