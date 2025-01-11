import { NextResponse } from 'next/server';
import googleTrends from 'google-trends-api';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    // Get trending topics
    const trendData = await googleTrends.dailyTrends({
      geo: 'US',
    });
    
    const trends = JSON.parse(trendData)
      .default.trendingSearchesDays[0]
      .trendingSearches
      .slice(0, 10)
      .map((trend: any) => trend.title.query);

    let amount = 3;
    if (trends.length < 3) {
      amount = trends.length;
    }
    let chosenTrends = [];
    for (let index = 0; index < amount; index++) {
      var item = trends[Math.floor(Math.random()*trends.length)]; 
      chosenTrends.push(item);
    }

    // Generate sentence using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: `Create an alarming news headline that naturally incorporates some or all of these trending topics: ${chosenTrends.join(', ')}`
      }],
      max_tokens: 100,
    });

    const sentence = completion.choices[0].message.content || '';

    // Generate image using DALL-E
    const image = await openai.images.generate({
      model: "dall-e-3",
      prompt: sentence,
      n: 1,
      size: "1024x1024",
    });

    return NextResponse.json({
      chosenTrends,
      sentence,
      imageUrl: image.data[0].url,
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}