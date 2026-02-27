'use client';

import { useRef, useState } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { type FileType } from '@/lib/storage';
import { FILE_UPLOAD_LIMITS } from '@/lib/constants';

interface FileUploadProps {
  fileType: FileType;
  invitationId: string;
  onUploadSuccess: (url: string, path: string) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  description?: string;
  currentFile?: string;
}

export default function FileUpload({
  fileType,
  invitationId,
  onUploadSuccess,
  onUploadError,
  accept,
  maxSizeMB,
  label,
  description,
  currentFile,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, progress, error, uploadFile, reset } = useFileUpload();
  const [preview, setPreview] = useState<string | null>(currentFile || null);

  const limits = FILE_UPLOAD_LIMITS[fileType.toUpperCase() as keyof typeof FILE_UPLOAD_LIMITS];
  const defaultAccept = limits?.allowedTypes.join(',') || '*/*';
  const defaultMaxSize = limits ? limits.maxSize / (1024 * 1024) : 10;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    reset();

    // Create preview for images
    if (fileType === 'image') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Upload file
    const result = await uploadFile(file, fileType, invitationId);

    if (result.success && result.url && result.path) {
      onUploadSuccess(result.url, result.path);
    } else if (result.error) {
      onUploadError?.(result.error);
      setPreview(currentFile || null);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}

      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept || defaultAccept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {preview && fileType === 'image' && (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1">
          <button
            type="button"
            onClick={handleClick}
            disabled={uploading}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : preview ? 'Change File' : 'Choose File'}
          </button>

          {preview && !uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="ml-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Remove
            </button>
          )}

          <p className="text-xs text-gray-500 mt-2">
            Max size: {maxSizeMB || defaultMaxSize}MB
          </p>
        </div>
      </div>

      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-rose-600 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {currentFile && !preview && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-600">Current file: {currentFile}</p>
        </div>
      )}
    </div>
  );
}
