// src/components/TryOnModal.jsx
import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { generateTryOn } from '../api/falTryOn';

const TryOnModal = ({ onClose, selectedItem }) => {
  const [modelImage, setModelImage] = useState(null);
  const [outputImage, setOutputImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleModelUpload = (e) => {
    const file = e.target.files[0];
    if (file) setModelImage(file);
  };

  const handleTryOn = async () => {
    if (!modelImage || !selectedItem.image) return;
    setLoading(true);
    try {
      const garmentBlob = await fetch(selectedItem.image).then(res => res.blob());
      const garmentFile = new File([garmentBlob], 'garment.jpg', { type: 'image/jpeg' });
      const resultUrl = await generateTryOn(modelImage, garmentFile);
      setOutputImage(resultUrl);
    } catch (err) {
      alert('Try-On failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-red-500 hover:text-red-700">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-center mb-4">Virtual Try-On</h2>

        <input type="file" accept="image/*" onChange={handleModelUpload} />
        <div className="mt-4 flex justify-center">
          <button
            disabled={loading}
            onClick={handleTryOn}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full"
          >
            {loading ? 'Generating...' : 'Generate Try-On'}
          </button>
        </div>

        {outputImage && (
          <div className="mt-6">
            <img src={outputImage} alt="Try-On Result" className="w-full max-h-[500px] object-contain rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
};

export default TryOnModal;
