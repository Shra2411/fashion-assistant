    {/* Settings Panel */}
    <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Try-On Settings</h2>
            <button
              onClick={toggleAdvancedOptions}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {advancedOptions.showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Garment Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2"
              >
                <option value="tops">Tops</option>
                <option value="bottoms">Bottoms</option>
                <option value="one-pieces">One Pieces</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Results</label>
              <select
                value={advancedOptions.numSamples}
                onChange={(e) => setAdvancedOptions({...advancedOptions, numSamples: parseInt(e.target.value)})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2"
              >
                {[1, 2, 3, 4].map(num => (
                  <option key={num} value={num}>{num} {num > 1 ? 'variants' : 'variant'}</option>
                ))}
              </select>
            </div>
          </div>

          {advancedOptions.showAdvanced && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Garment Photo Type</label>
                  <select
                    value={advancedOptions.garmentPhotoType}
                    onChange={(e) => setAdvancedOptions({...advancedOptions, garmentPhotoType: e.target.value})}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2"
                  >
                    <option value="auto">Auto Detect</option>
                    <option value="model">On Model</option>
                    <option value="flat-lay">Flat Lay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guidance Scale ({advancedOptions.guidanceScale})</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={advancedOptions.guidanceScale}
                    onChange={(e) => setAdvancedOptions({...advancedOptions, guidanceScale: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Higher values preserve more detail but may oversaturate</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Processing Steps ({advancedOptions.timesteps})</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={advancedOptions.timesteps}
                    onChange={(e) => setAdvancedOptions({...advancedOptions, timesteps: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">More steps = better quality but slower</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="nsfwFilter"
                    checked={advancedOptions.nsfwFilter}
                    onChange={(e) => setAdvancedOptions({...advancedOptions, nsfwFilter: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="nsfwFilter" className="ml-2 block text-sm text-gray-700">
                    NSFW Filter
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="coverFeet"
                    checked={advancedOptions.coverFeet}
                    onChange={(e) => setAdvancedOptions({...advancedOptions, coverFeet: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="coverFeet" className="ml-2 block text-sm text-gray-700">
                    Cover Feet
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="adjustHands"
                    checked={advancedOptions.adjustHands}
                    onChange={(e) => setAdvancedOptions({...advancedOptions, adjustHands: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="adjustHands" className="ml-2 block text-sm text-gray-700">
                    Adjust Hands
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="restoreBackground"
                    checked={advancedOptions.restoreBackground}
                    onChange={(e) => setAdvancedOptions({...advancedOptions, restoreBackground: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="restoreBackground" className="ml-2 block text-sm text-gray-700">
                    Restore Background
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="restoreClothes"
                    checked={advancedOptions.restoreClothes}
                    onChange={(e) => setAdvancedOptions({...advancedOptions, restoreClothes: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="restoreClothes" className="ml-2 block text-sm text-gray-700">
                    Keep Other Clothes
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="longTop"
                    checked={advancedOptions.longTop}
                    onChange={(e) => setAdvancedOptions({...advancedOptions, longTop: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="longTop" className="ml-2 block text-sm text-gray-700">
                    Long Top
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Seed Value</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={advancedOptions.seed}
                    onChange={(e) => setAdvancedOptions({...advancedOptions, seed: parseInt(e.target.value) || 42})}
                    className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2"
                  />
                  <button
                    onClick={() => setAdvancedOptions({...advancedOptions, seed: Math.floor(Math.random() * 100000)})}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                  >
                    Randomize
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Same seed + same inputs = same result</p>
              </div>
            </div>
          )}
        </div>