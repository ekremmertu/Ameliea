/**
 * Supabase Storage Utilities
 * Handles file uploads for images, videos, and audio
 */

import { createSupabaseClient } from './supabase/client';
import { FILE_UPLOAD_LIMITS } from './constants';

export type FileType = 'image' | 'video' | 'audio';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Get storage bucket name for file type
 */
function getBucketName(fileType: FileType): string {
  switch (fileType) {
    case 'image':
      return 'invitation-images';
    case 'video':
      return 'invitation-videos';
    case 'audio':
      return 'invitation-audio';
    default:
      throw new Error(`Invalid file type: ${fileType}`);
  }
}

/**
 * Validate file before upload
 */
export function validateFile(file: File, fileType: FileType): { valid: boolean; error?: string } {
  const limits = FILE_UPLOAD_LIMITS[fileType.toUpperCase() as keyof typeof FILE_UPLOAD_LIMITS];

  if (!limits) {
    return { valid: false, error: 'Invalid file type' };
  }

  // Check file size
  if (file.size > limits.maxSize) {
    const maxSizeMB = limits.maxSize / (1024 * 1024);
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }

  // Check file type
  if (!limits.allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} is not allowed` };
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!limits.allowedExtensions.includes(extension)) {
    return { valid: false, error: `File extension ${extension} is not allowed` };
  }

  return { valid: true };
}

/**
 * Generate unique file path
 */
function generateFilePath(userId: string, invitationId: string, fileName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = fileName.split('.').pop();
  const sanitizedName = fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 50);
  
  return `${userId}/${invitationId}/${timestamp}-${randomString}-${sanitizedName}`;
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  fileType: FileType,
  userId: string,
  invitationId: string
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(file, fileType);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const supabase = createSupabaseClient();
    const bucketName = getBucketName(fileType);
    const filePath = generateFilePath(userId, invitationId, file.name);

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrl,
      path: data.path,
    };

  } catch (error) {
    console.error('Upload exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(
  filePath: string,
  fileType: FileType
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseClient();
    const bucketName = getBucketName(fileType);

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };

  } catch (error) {
    console.error('Delete exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

/**
 * Get signed URL for private files (if needed in future)
 */
export async function getSignedUrl(
  filePath: string,
  fileType: FileType,
  expiresIn: number = 3600
): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = createSupabaseClient();
    const bucketName = getBucketName(fileType);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Signed URL error:', error);
      return { error: error.message };
    }

    return { url: data.signedUrl };

  } catch (error) {
    console.error('Signed URL exception:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to get signed URL',
    };
  }
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  fileType: FileType,
  userId: string,
  invitationId: string
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (const file of files) {
    const result = await uploadFile(file, fileType, userId, invitationId);
    results.push(result);
  }

  return results;
}
