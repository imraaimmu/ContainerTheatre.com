import { NextRequest, NextResponse } from 'next/server';
import {
  getBannerById,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
} from '@/lib/db/banners';

// GET /api/banners/[id] - Get single banner
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const banner = await getBannerById(id);

    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      banner,
    });
  } catch (error) {
    console.error('Error fetching banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banner' },
      { status: 500 }
    );
  }
}

// PATCH /api/banners/[id] - Update banner
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if banner exists
    const existing = await getBannerById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    // Handle toggle action
    if (body.action === 'toggle') {
      const success = await toggleBannerStatus(id);
      if (success) {
        const updated = await getBannerById(id);
        return NextResponse.json({
          success: true,
          banner: updated,
          message: `Banner ${updated?.isActive ? 'activated' : 'deactivated'}`,
        });
      }
    }

    // Regular update
    const success = await updateBanner(id, body);

    if (success) {
      const updated = await getBannerById(id);
      return NextResponse.json({
        success: true,
        banner: updated,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update banner' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

// DELETE /api/banners/[id] - Delete banner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const success = await deleteBanner(id);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Banner deleted',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Banner not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
