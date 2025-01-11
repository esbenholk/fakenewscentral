import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  // const {skip, limit} = req.query;

  try {
    const result = await cloudinary.search
      .expression('folder:fakenewscentral')
      .sort_by('created_at', 'desc')
      .with_field('context')
      .with_field('tags')
      .max_results(10)
      .execute();

    console.log("has recent images", result);
    
    return NextResponse.json(result.resources);
  } catch (error) {
    console.error('Cloudinary fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent images' },
      { status: 500 }
    );
  }
}