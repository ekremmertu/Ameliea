/**
 * File Delete API Route
 * DELETE /api/upload/[fileType]/[...path] - Delete file from Supabase Storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { type FileType } from '@/lib/storage';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fileType: string; path: string[] }> }
) {
  try {
    const { fileType, path } = await params;
    const filePath = path.join('/');

    if (!fileType || !['image', 'video', 'audio'].includes(fileType)) {
      return NextResponse.json(
        { error: 'INVALID_FILE_TYPE', message: 'Invalid file type' },
        { status: 400 }
      );
    }

    if (!filePath) {
      return NextResponse.json(
        { error: 'NO_FILE_PATH', message: 'File path is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify file ownership (file path starts with user ID)
    if (!filePath.startsWith(user.id + '/')) {
      return NextResponse.json(
        { error: 'FORBIDDEN', message: 'You can only delete your own files' },
        { status: 403 }
      );
    }

    // Determine bucket name
    const bucketName = 
      fileType === 'image' ? 'invitation-images' :
      fileType === 'video' ? 'invitation-videos' :
      'invitation-audio';

    // Delete from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json(
        { error: 'DELETE_FAILED', message: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });

  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
