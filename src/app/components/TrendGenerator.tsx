'use client';

import { useState } from 'react';
import { Wand2, History } from 'lucide-react';
import {Card} from './Card';

interface GenerationResult {
  sentence: string;
  imageUrl: string;
  trends: string[];
}

interface CloudinaryImage {
  secure_url: string;
  context?: {
    alt?: string;
  };
}
type ImageCardProps = {
  url: string;
  title: string;
  tags: string[];
};

export default function TrendGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingRecent, setIsFetchingRecent] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [recentImages, setRecentImages] = useState<CloudinaryImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [news, setNews] = useState<ImageCardProps[]>([]);
  const [loadIndex, setLoadIndex] = useState<number>(10);

  const generateContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Generation failed');
      
      setResult(data);
      uploadToCloudinary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
     
    }
  };

  async function uploadToCloudinary ( imageData: GenerationResult) {
    if (!imageData) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imageData.imageUrl,
          sentence: imageData.sentence,
          alt: imageData.trends.join(', '),
          title: imageData.sentence,
          tags: imageData.trends
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const fetchRecentImages = async () => {
    setIsFetchingRecent(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cloudinary/recent');
      const data = await response.json();
      
      console.log("has images", data);
      
      setRecentImages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recent images');
    } finally {
      setIsFetchingRecent(false);
    }
  };

  return (
    <div >
      <div className="flex gap-4 mb-6">
        <button
          onClick={generateContent}
          disabled={isLoading}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Wand2 className="w-5 h-5" />
          {isLoading ? 'Generating...' : 'Generate Trending Content'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        
        <div className="mt-6 space-y-4">
          <Card 
              url={result.imageUrl}
              title={result.sentence}
              tags={result.trends}
            />
         </div>
      )}

      {recentImages.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Images</h2>
          <div className="grid grid-cols-2 gap-4">
            {recentImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image.secure_url}
                  alt={image.context?.alt || 'Generated image'}
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                />
                {image.context?.alt && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {image.context.alt}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
          onClick={fetchRecentImages}
          disabled={isFetchingRecent}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <History className="w-5 h-5" />
          {isFetchingRecent ? 'Loading...' : 'Recent Images'}
        </button>
    </div>
  );
}