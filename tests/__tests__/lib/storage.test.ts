/**
 * Storage Utilities Tests
 */

import { validateFile } from '@/lib/storage';
import { FILE_UPLOAD_LIMITS } from '@/lib/constants';

describe('Storage Utilities', () => {
  describe('validateFile', () => {
    it('should accept valid image file', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

      const result = validateFile(file, 'image');
      expect(result.valid).toBe(true);
    });

    it('should reject oversized image', () => {
      const file = new File(['content'], 'large.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 }); // 10MB

      const result = validateFile(file, 'image');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds');
    });

    it('should reject invalid file type', () => {
      const file = new File(['content'], 'test.exe', { type: 'application/exe' });
      Object.defineProperty(file, 'size', { value: 1024 });

      const result = validateFile(file, 'image');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('should accept valid video file', () => {
      const file = new File(['content'], 'video.mp4', { type: 'video/mp4' });
      Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 }); // 10MB

      const result = validateFile(file, 'video');
      expect(result.valid).toBe(true);
    });

    it('should accept valid audio file', () => {
      const file = new File(['content'], 'music.mp3', { type: 'audio/mpeg' });
      Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 }); // 5MB

      const result = validateFile(file, 'audio');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid extension', () => {
      const file = new File(['content'], 'test.txt', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 });

      const result = validateFile(file, 'image');
      expect(result.valid).toBe(false);
    });
  });

  describe('FILE_UPLOAD_LIMITS', () => {
    it('should have correct image limits', () => {
      expect(FILE_UPLOAD_LIMITS.IMAGE.maxSize).toBe(5 * 1024 * 1024);
      expect(FILE_UPLOAD_LIMITS.IMAGE.allowedTypes).toContain('image/jpeg');
    });

    it('should have correct video limits', () => {
      expect(FILE_UPLOAD_LIMITS.VIDEO.maxSize).toBe(50 * 1024 * 1024);
      expect(FILE_UPLOAD_LIMITS.VIDEO.allowedTypes).toContain('video/mp4');
    });

    it('should have correct audio limits', () => {
      expect(FILE_UPLOAD_LIMITS.AUDIO.maxSize).toBe(10 * 1024 * 1024);
      expect(FILE_UPLOAD_LIMITS.AUDIO.allowedTypes).toContain('audio/mpeg');
    });
  });
});
