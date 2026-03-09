import { NextRequest, NextResponse } from 'next/server';
import {
  getBanners,
  getActiveBanners,
  createBanner,
} from '@/lib/db/banners';
import { BannerType } from '@/lib/db/types';

// GET /api/banners - Get banners
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as BannerType | null;
    const activeOnly = searchParams.get('active') === 'true';

    let banners;
    if (activeOnly) {
      // Get only active banners (for frontend display)
      banners = await getActiveBanners(type || undefined);
    } else {
      // Get all banners (for admin)
      banners = await getBanners({
        type: type || undefined,
      });
    }

    return NextResponse.json({
      success: true,
      banners,
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

// POST /api/banners - Create banner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.type || !body.title) {
      return NextResponse.json(
        { success: false, error: 'Type and title are required' },
        { status: 400 }
      );
    }

    // Validate banner type
    if (!['announcement', 'promotional', 'popup'].includes(body.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid banner type' },
        { status: 400 }
      );
    }

    const banner = await createBanner(body);

    return NextResponse.json({
      success: true,
      banner,
    });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}
