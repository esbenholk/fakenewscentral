import { NextResponse } from 'next/server';
import googleTrends from 'google-trends-api';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerationResult {
  sentence: string;
  imageUrl: string;
  trends: string[];
  geo: string;
}
async function uploadToCloudinary ( imageData: GenerationResult) {
  if (!imageData) return;
    
  try {

    console.log("uploads image", imageData);

    imageData.trends.push(imageData.geo)
    const response = await fetch(`${process.env.BASE_URL}/api/cloudinary/upload`, {
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
      console.log("fails upload to cloud", data);

      throw new Error(data.error || 'Upload failed');

    } 
  } catch (err) {
    console.log("fails upload to cloud", err);

  } finally {
    console.log("ends upload to cloud");

  }
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const geo = url.searchParams.get('geo') || 'DE';
    const keyword = url.searchParams.get('keyword') || '';
    let trends = [
      "election", "president", "economy", "inflation", "stock market",
      "cryptocurrency", "interest rates", "banking crisis", "job market", "unemployment",
      "healthcare", "pandemic", "vaccine", "mental health", "drug prices",
      "education", "college debt", "student loans", "school policies", "teacher strikes",
      "technology", "AI", "machine learning", "cybersecurity", "big data",
      "climate change", "global warming", "carbon emissions", "renewable energy", "wildfires",
      "natural disasters", "hurricane", "earthquake", "flood", "drought",
      "sports", "Olympics", "FIFA", "NBA", "NFL",
      "entertainment", "Hollywood", "blockbuster", "Netflix", "streaming wars",
      "social media", "Twitter", "Facebook", "TikTok", "influencers",
      "crime", "police", "gun control", "mass shooting", "drug cartel",
      "immigration", "border control", "refugees", "asylum", "migrant crisis",
      "war", "conflict", "military", "terrorism", "diplomacy",
      "science", "space exploration", "NASA", "quantum computing", "genetics",
      "medicine", "cancer research", "biotech", "medical breakthrough", "public health",
      "real estate", "housing market", "mortgage rates", "rent control", "urban development",
      "transportation", "electric vehicles", "self-driving cars", "public transit", "airlines",
      "fashion", "luxury brands", "fast fashion", "sustainability", "trend forecast",
      "business", "startup funding", "corporate layoffs", "market trends", "IPO",
      "legal", "Supreme Court", "legislation", "human rights", "privacy laws",
      "food", "agriculture", "supply chain", "nutrition", "plant-based diet",
      "energy", "oil prices", "nuclear power", "offshore wind", "solar farms",
      "culture", "artificial intelligence ethics", "cancel culture", "censorship", "free speech",
      "space", "Mars mission", "asteroid mining", "exoplanets", "space tourism"
    ];

    

    const additionalKeywords = ["zuckerberg", "elon musk", "bezos", "internet", "social media", "world war 3", "algorithms", "technology", "arteficial intelligence", "AI", "fake news", "truth", "community notes", "twitter", "oligarchy", "dictatorship", "artist", "generative media", "the zuck", "the image Elon Musk wants the internet to forget", "meme", "pepe"]  // Get trending topics
    // const trendData = await googleTrends.dailyTrends({
    //   geo: geo,
    // });


    console.log("has trend data");
    

    // let trends = JSON.parse(trendData)
    //   .default.trendingSearchesDays[0]
    //   .trendingSearches
    //   .slice(0, 10)
    //   .map((trend: any) => trend.title.query);

    // console.log("has google trends", trends);
    // let amount = 3;
    // if (trends.length < amount) {
    //   amount = trends.length;
    // }
    let chosenTrends = [];
    for (let i = 0;i < 3; i++) {
      const index = Math.floor(Math.random()*trends.length)
      var item = trends[index]; 
      if (index > -1) { // only splice array when item is found
        trends.splice(index, 1); // 2nd parameter means remove one item only
      }
      chosenTrends.push(item);
    }
    if(keyword != ""){
      chosenTrends.push(keyword);
    } else {
      chosenTrends.push(additionalKeywords[Math.floor(Math.random()*additionalKeywords.length)])
    }
  

    console.log("has sorted google trends", chosenTrends);
    

    // Generate sentence using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: `using maximum 100 characters, Create an alarming news headline that naturally incorporates some or all of these trending topics: ${chosenTrends.join(', ')}`
      }],
      max_tokens: 100,
    });



    const sentence = completion.choices[0].message.content || '';
    sentence.replace('"', '');

    console.log("has openai sentence", sentence);

    
    // Generate image using DALL-E
    const image = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a photorealistic image that fits this headline:  ${sentence}`,
      n: 1,
      size: "1024x1024",
    });

    console.log("has openai image", image);


    trends = chosenTrends;

    const data = {
      trends,
      sentence,
      imageUrl: image.data[0].url || 'imageurlplaceholder',
      geo: geo
    };
    
 
    
    uploadToCloudinary(data);

    console.log("returns:", data);
    return NextResponse.json(data);

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}