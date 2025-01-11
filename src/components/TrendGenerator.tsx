import { useState } from 'react';
import { Wand2 } from 'lucide-react';

interface GenerationResult {
  sentence: string;
  imageUrl: string;
  trends: string[];
}

export default function TrendGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Generation failed');
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6">
      <button
        onClick={generateContent}
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Wand2 className="w-5 h-5" />
        {isLoading ? 'Generating...' : 'Generate Trending Content'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Trending Topics:</h3>
            <div className="flex flex-wrap gap-2">
              {result.trends.map((trend, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                >
                  {trend}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Generated Sentence:</h3>
            <p className="text-gray-600">{result.sentence}</p>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold text-gray-700 mb-2">Generated Image:</h3>
            <img
              src={result.imageUrl}
              alt={result.sentence}
              className="w-full rounded-lg shadow-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}