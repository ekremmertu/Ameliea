/**
 * File Upload API Route
 * POST /api/upload - Upload files to Supabase Storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { validateFile, type FileType } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const fileType = formData.get('fileType') as FileType | null;
    const invitationId = formData.get('invitationId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'NO_FILE', message: 'No file provided' },
        { status: 400 }
      );
    }

    if (!fileType || !['image', 'video', 'audio'].includes(fileType)) {
      return NextResponse.json(
        { error: 'INVALID_FILE_TYPE', message: 'Invalid file type. Must be image, video, or audio' },
        { status: 400 }
      );
    }

    if (!invitationId) {
      return NextResponse.json(
        { error: 'NO_INVITATION_ID', message: 'Invitation ID is required' },
        { status: 400 }
      );
    }

    // Verify invitation ownership
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('id, owner_id')
      .eq('id', invitationId)
      .maybeSingle();

    if (invError || !invitation) {
      return NextResponse.json(
        { error: 'INVITATION_NOT_FOUND', message: 'Invitation not found' },
        { status: 404 }
      );
    }

    if (invitation.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'FORBIDDEN', message: 'You can only upload files to your own invitations' },
        { status: 403 }
      );
    }

    // Validate file
    const validation = validateFile(file, fileType);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: validation.error },
        { status: 400 }
      );
    }

    // Generate file path
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 50);
    
    const filePath = `${user.id}/${invitationId}/${timestamp}-${randomString}-${sanitizedName}`;

    // Determine bucket name
    const bucketName = 
      fileType === 'image' ? 'invitation-images' :
      fileType === 'video' ? 'invitation-videos' :
      'invitation-audio';

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'UPLOAD_FAILED', message: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uploadData.path);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: uploadData.path,
      fileType,
      size: file.size,
      name: file.name,
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
