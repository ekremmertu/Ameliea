/**
 * useFileUpload Hook
 * React hook for file upload functionality
 */

import { useState } from 'react';
import { type FileType } from '@/lib/storage';

interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

interface UseFileUploadReturn {
  uploading: boolean;
  progress: number;
  error: string | null;
  uploadFile: (file: File, fileType: FileType, invitationId: string) => Promise<UploadResult>;
  deleteFile: (filePath: string, fileType: FileType) => Promise<boolean>;
  reset: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (
    file: File,
    fileType: FileType,
    invitationId: string
  ): Promise<UploadResult> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);
      formData.append('invitationId', invitationId);

      // Simulate progress (since we can't track actual upload progress easily)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Upload failed');
      }

      const data = await response.json();
      
      return {
        success: true,
        url: data.url,
        path: data.path,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const deleteFile = async (filePath: string, fileType: FileType): Promise<boolean> => {
    setError(null);

    try {
      const response = await fetch(`/api/upload/${fileType}/${filePath}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Delete failed');
      }

      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      return false;
    }
  };

  const reset = () => {
    setUploading(false);
    setProgress(0);
    setError(null);
  };

  return {
    uploading,
    progress,
    error,
    uploadFile,
    deleteFile,
    reset,
  };
}
