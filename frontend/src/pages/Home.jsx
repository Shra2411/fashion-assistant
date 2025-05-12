import { useState } from 'react';
import { fal } from '@fal-ai/client';
import FileUpload from '../components/FileUpload';
import TryOnResult from '../components/TryOnResult';

// Configure FAL.AI client
fal.config({
//   credentials: import.meta.env.VITE_FAL_AI_KEY,
    credentials: "e538dd3f-6e32-4a0f-a568-8b6a15700096:d9afbabbf6a0bb90904bf042d59c55ea",
});

export default function Home() {
  const [modelImage, setModelImage] = useState(null);
  const [modelImageUrl, setModelImageUrl] = useState(null);
  const [garmentImage, setGarmentImage] = useState(null);
  const [garmentImageUrl, setGarmentImageUrl] = useState(null);
  const [category, setCategory] = useState('tops');
  const [resultUrls, setResultUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
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

  const toggleAdvancedOptions = () => {
    setAdvancedOptions(prev => ({
      ...prev,
      showAdvanced: !prev.showAdvanced
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Virtual Clothes Try-On</h1>
        
        {/* Upload Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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
            <h2 className="text-xl font-semibold mb-4">Upload Garment</h2>
            <p className="text-sm text-gray-500 mb-2">
              Front-facing garment photo, plain background recommended (JPEG/PNG)
            </p>
            <FileUpload 
              onUpload={handleGarmentUpload} 
              type="garment" 
              accept="image/jpeg, image/png"
            />
            {garmentImageUrl && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Preview:</h3>
                <img 
                  src={garmentImageUrl} 
                  alt="Garment preview" 
                  className="mt-1 max-h-40 rounded-md border border-gray-200"
                />
              </div>
            )}
          </div>
        </div>

        
        

        {/* Action Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleTryOn}
            disabled={isLoading || !modelImage || !garmentImage}
            className={`px-8 py-3 rounded-md text-white font-medium text-lg ${
              isLoading || !modelImage || !garmentImage 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-md'
            } transition-colors duration-200`}
          >
            {isLoading ? (
              <span className="flex items-center">
                {/* <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg> */}
                Processing...
              </span>
            ) : (
              'Generate Try-On'
            )}
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {progress && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Progress</h3>
                <div className="mt-2 text-sm text-blue-700 whitespace-pre-wrap">
                  <p>{progress}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          
          {resultUrls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resultUrls.map((url, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4">
                    <img 
                      src={url} 
                      alt={`Try-on result ${index + 1}`} 
                      className="w-full h-auto rounded-md"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/500x500?text=Image+failed+to+load';
                      }}
                    />
                  </div>
                  <div className="bg-gray-50 px-4 py-3 flex justify-end">
                    <a
                      href={url}
                      target="_blank" rel="noopener noreferrer"
                      download={`tryon-result-${index + 1}.png`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <TryOnResult isLoading={isLoading} />
          )}
        </div>
      </div>
    </div>
  );
}