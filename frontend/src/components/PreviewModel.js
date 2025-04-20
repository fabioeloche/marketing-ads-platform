import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaSync } from 'react-icons/fa';

const PreviewModal = ({ isOpen, adData }) => {
  // Hooks must be called at the top level, not conditionally
  const [highlightAd, setHighlightAd] = useState(true);
  const [deviceType, setDeviceType] = useState('mobile'); // mobile or desktop
  
  // Ad content state
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [generatedAds, setGeneratedAds] = useState([]);

  // Helper function to clean data - filter out items with only dashes
  const cleanData = (value) => {
    if (!value) return '';
    // Check if string only contains dashes or is empty after trimming
    if (/^-+$/.test(value.trim()) || value.trim() === '') {
      return '';
    }
    return value;
  };

  // Ad assets - headlines and descriptions
  const headlines = Array.from(
    { length: 15 },
    (_, i) => cleanData(adData?.[`Headline ${i + 1}`]) || ''
  ).filter(headline => headline !== '');
  
  const descriptions = Array.from(
    { length: 4 },
    (_, i) => cleanData(adData?.[`Description ${i + 1}`]) || ''
  ).filter(description => description !== '');

  // Generate a random ad combination
  const generateRandomAd = () => {
    // Randomly select 2 unique headlines
    const shuffledHeadlines = [...headlines].sort(() => 0.5 - Math.random());
    const selectedHeadlines = shuffledHeadlines.slice(0, 2);

    // Randomly select 2 unique descriptions
    const shuffledDescriptions = [...descriptions].sort(
      () => 0.5 - Math.random()
    );
    const selectedDescriptions = shuffledDescriptions.slice(0, 2);

    // Clean path data
    const path1 = cleanData(adData?.['Path 1']) || '';
    const path2 = cleanData(adData?.['Path 2']) || '';

    return {
      'Headline 1': selectedHeadlines[0],
      'Headline 2': selectedHeadlines[1],
      'Description 1': selectedDescriptions[0],
      'Description 2': selectedDescriptions[1],
      'Final URL': adData?.['Final URL'] || 'www.yourexpenseapp.com',
      'Path 1': path1,
      'Path 2': path2,
    };
  };

  // Generate initial set of ad combinations
  useEffect(() => {
    if (adData) {
      // Clean the adData paths before using
      const cleanedAdData = {
        ...adData,
        'Path 1': cleanData(adData['Path 1']),
        'Path 2': cleanData(adData['Path 2'])
      };
      
      const initialAds = [cleanedAdData];

      const randomAds = Array(630)
        .fill()
        .map(() => generateRandomAd());
      setGeneratedAds([...initialAds, ...randomAds]);
    } else {
      // No adData provided, generate all random ads
      const sampleAds = Array(10)
        .fill()
        .map(() => generateRandomAd());
      setGeneratedAds(sampleAds);
    }
  }, [adData]); // Re-run when adData changes

  // Early return after hooks are defined
  if (!isOpen || generatedAds.length === 0) return null;

  // Get current ad data
  const currentAd = generatedAds[currentAdIndex];

  // Extract data from current ad
  const headline = currentAd['Headline 1'] || 'The google is running';
  const headline2 = currentAd['Headline 2'] || '';
  const description =
    currentAd['Description 1'] || "We'll provide you the best service";
  const description2 = currentAd['Description 2'] || '';
  
  // Improved URL handling
  const fullUrl = currentAd['Final URL'] || 'www.google.com';
  
  // Extract just the domain and optionally subdomain
  let baseUrl = '';
  try {
    // Use URL constructor if it's a valid URL
    if (fullUrl.includes('http')) {
      const urlObject = new URL(fullUrl);
      baseUrl = urlObject.hostname;
    } else if (fullUrl.includes('://')) {
      // Handle other protocols
      baseUrl = fullUrl.split('://')[1].split('/')[0];
    } else {
      // Just domain name or domain with path
      baseUrl = fullUrl.split('/')[0];
    }
  } catch (e) {
    // Fallback if URL parsing fails
    baseUrl = fullUrl.split('/')[0];
  }
  
  // Format the display URL with paths - only use valid paths
  const path1 = cleanData(currentAd['Path 1']);
  const path2 = cleanData(currentAd['Path 2']);
  
  // Construct the display URL
  const displayUrl = path1 && path2 
    ? `${baseUrl}/${path1}/${path2}`
    : path1 
    ? `${baseUrl}/${path1}` 
    : baseUrl;

  // Navigation functions
  const nextAd = () => {
    setCurrentAdIndex((prevIndex) =>
      prevIndex === generatedAds.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevAd = () => {
    setCurrentAdIndex((prevIndex) =>
      prevIndex === 0 ? generatedAds.length - 1 : prevIndex - 1
    );
  };

  // Regenerate ads but keep the original adData
  const regenerateAds = () => {
    if (adData) {
      // Clean the adData paths before using
      const cleanedAdData = {
        ...adData,
        'Path 1': cleanData(adData['Path 1']),
        'Path 2': cleanData(adData['Path 2'])
      };
      
      const newRandomAds = Array(629)
        .fill()
        .map(() => generateRandomAd());
      setGeneratedAds([cleanedAdData, ...newRandomAds]);
    }
    setCurrentAdIndex(0);
  };
  
  return (
    <div className="bg-gray-100 p-4 md:p-8 rounded-lg shadow-md w-full min-h-screen mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-3 sm:p-4 border-b mb-6">
        <div className="flex items-center space-x-3 sm:space-x-5 mb-3 sm:mb-0">
          <span className="font-medium text-base sm:text-lg">Preview</span>
          <div className="flex space-x-3">
            <button className="text-gray-500 px-3 py-1" onClick={prevAd}>
              <FaChevronLeft size={16} />
            </button>

            <button className="text-gray-500 px-3 py-1" onClick={nextAd}>
              <FaChevronRight size={16} />
            </button>

            <button
              className="text-gray-500 px-3 py-1 ml-2"
              onClick={regenerateAds}
            >
              <FaSync size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <button
            className={`p-2 rounded ${
              deviceType === 'mobile'
                ? 'text-blue-500 bg-blue-100'
                : 'text-gray-500'
            }`}
            onClick={() => setDeviceType('mobile')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12" y2="18"></line>
            </svg>
          </button>
          <button
            className={`p-2 ${
              deviceType === 'desktop'
                ? 'text-blue-500 bg-blue-100 rounded'
                : 'text-gray-500'
            }`}
            onClick={() => setDeviceType('desktop')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Device with Ad */}
      <div className="flex justify-center relative w-full py-4">
        {deviceType === 'mobile' ? (
          // Phone Frame
          <div className="border-4 sm:border-8 border-gray-300 rounded-3xl bg-white shadow-lg w-full max-w-[350px] sm:max-w-[400px] md:max-w-[450px] h-auto">
            <div className="h-5 sm:h-8 flex justify-center items-center bg-gray-200 rounded-t-lg">
              <div className="w-16 sm:w-24 h-1.5 sm:h-2 bg-gray-400 rounded-full"></div>
            </div>
            {/* Ad Content */}
            <div className="p-3 sm:p-5">
              <div
                className={`border rounded-md bg-white p-3 sm:p-5 ${
                  highlightAd ? 'ring-3 ring-blue-500' : ''
                }`}
              >
                <div className="text-sm sm:text-base text-gray-500 mb-2">
                  Sponsored
                </div>
                <div className="flex items-center mb-2 sm:mb-3">
                  <div className="w-6 sm:w-7 h-6 sm:h-7 mr-2 sm:mr-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm sm:text-base font-bold">
                      G
                    </span>
                  </div>
                  <span className="text-sm sm:text-base text-gray-600">
                    {displayUrl}
                  </span>
                </div>
                <h3 className="text-blue-600 font-medium text-base sm:text-xl">
                  {headline}
                  {headline2 && <span> | {headline2}</span>}
                </h3>
                <p className="text-sm sm:text-lg text-gray-700 mt-2 sm:mt-3">
                  {description}
                  {description2 && <span> {description2}</span>}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Desktop Frame
          <div className="border-2 sm:border-4 border-gray-300 rounded-lg bg-white shadow-lg w-full max-w-[700px] lg:max-w-[900px]">
            <div className="h-7 sm:h-9 bg-gray-200 flex items-center px-3 sm:px-4 space-x-2 sm:space-x-3">
              <div className="w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-red-400"></div>
              <div className="w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-yellow-400"></div>
              <div className="w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-green-400"></div>
            </div>
            {/* Ad Content */}
            <div className="p-4 sm:p-6">
              <div
                className={`border rounded-md bg-white p-4 sm:p-6 ${
                  highlightAd ? 'ring-3 ring-blue-500' : ''
                }`}
              >
                <div className="text-sm sm:text-base text-gray-500 mb-2 sm:mb-3">
                  Sponsored
                </div>
                <div className="flex items-center mb-2 sm:mb-3">
                  <div className="w-6 sm:w-7 h-6 sm:h-7 mr-2 sm:mr-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm sm:text-base font-bold">
                      G
                    </span>
                  </div>
                  <span className="text-sm sm:text-base text-gray-600">
                    {displayUrl}
                  </span>
                </div>
                <h3 className="text-blue-600 font-medium text-lg sm:text-2xl">
                  {headline}
                  {headline2 && <span> | {headline2}</span>}
                </h3>
                <p className="text-base sm:text-xl text-gray-700 mt-2 sm:mt-3">
                  {description}
                  {description2 && <span> {description2}</span>}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewModal;