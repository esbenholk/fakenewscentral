import { NextResponse } from 'next/server';


export async function GET(request: Request) {

  try {

    const recentImagesResponse = await fetch(`${process.env.BASE_URL}/api/cloudinary/recent?limit=${encodeURIComponent(100)}&skip=${encodeURIComponent(0)}`);
    const data = await recentImagesResponse.json();
    
    console.log("CALLS 100 IMAGES", recentImagesResponse);
    
    if (!recentImagesResponse.ok) throw new Error(data.error || 'Generation failed');

    return NextResponse.json(data);
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
 
}