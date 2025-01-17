'use client';

import { useState, useEffect } from 'react';
import {Card} from './Card';

interface GenerationResult {
  sentence: string;
  imageUrl: string;
  trends: string[];
}


type ImageCardProps = {
  url: string;
  title: string;
  tags: string[];
  date: string;
  geo: string;
};

function getTodaysDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = String(today.getFullYear()).slice(-2); // Get last two digits of the year

  return `${day}.${month}.${year}`;
}

function formatDateString(dateString: string) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = String(date.getFullYear()).slice(-2); // Get last two digits of the year

  return `${day}.${month}.${year}`;
}

export default function TrendGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingRecent, setIsFetchingRecent] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [news, setNews] = useState<ImageCardProps[]>([]);
  const [loadIndex, setLoadIndex] = useState<number>(0);
  const [region, setRegion] = useState<string>('DK');
  const [keyword, setKeyword] = useState<string>('');

    // Run fetchRecentImages on component mount
  useEffect(() => {
      loadContent();
  }, []);

  const loadContent = async () =>{
    await fetchRecentImages();
  }

  const generateContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/generate?geo=${encodeURIComponent(region)}&keyword=${encodeURIComponent(keyword)}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Generation failed');

      let _tempNews = news;
      const _imageCardProp: ImageCardProps = {
        title: data.sentence,
        url: data.imageUrl,
        tags: data.trends, 
        date: getTodaysDate(),
        geo: data.geo 
      };
      _tempNews.unshift(_imageCardProp);
      setNews(_tempNews);      

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
     
    }
  };


  const fetchRecentImages = async () => {
    setIsFetchingRecent(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/cloudinary/recent?skip=${loadIndex}limit=${10}`);
      const data = await response.json();
      let _tempNews = news;
      if(data){
        for (let index = 0; index < data.length; index++) {
          const element = data[index];  
          console.log("HAS RECENT IMAGE", element, element.tags);
          
          const _imageCardProp: ImageCardProps = {
            title: element.title,
            url: element.url,
            tags: element.tags, 
            date: formatDateString(element.date),
            geo: element.tags[element.tags.length-1] 
          };
          _tempNews.push(_imageCardProp);
        }
        // if(news.length > 0){
        //   for (let index = 0; index < news.length; index++) {
        //     _tempNews.push(news[index]);
        //   }
        // }
        setNews(_tempNews);
        setLoadIndex(loadIndex+10)
      } else {
        setIsFetchingRecent(false);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recent images');
    } finally {
      setIsFetchingRecent(false);
    }
  };

  return (
    <div className="Container">
      <div className='Field'>
        <input
          type="text"
          placeholder="keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}

        >
          <option value="DK">DK</option>
          <option value="DE">DE</option>
          <option value="GB">GB</option>
          <option value="US">US</option>
        </select>
        <button
          onClick={generateContent}
          disabled={isLoading}
          className="Button"
        >
          {isLoading ? 'Obtaining...' : 'Obtain Story'}
        </button>
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}
      {news.length > 0 && (
        <>
          {news.map((card, index) => (
            <div className="Card" key={index}>
                <Card 
                  url={card.url}
                  title={card.title}
                  tags={card.tags}
                  date={card.date}
                  geo={card.geo}
                />
              </div>
            ))}
        </>
      )}

      <button
          onClick={fetchRecentImages}
          disabled={isFetchingRecent}
          className="Button Loadmore"        >
          {isFetchingRecent ? 'Obtaining...' : 'Obtain older stories'}
        </button>
    </div>
  );
}