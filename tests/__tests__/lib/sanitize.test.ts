/**
 * Sanitization Utilities Tests
 */

import {
  sanitizeHtml,
  sanitizeText,
  sanitizeUrl,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUserContent,
  sanitizeRsvpData,
  sanitizeLoveNoteData,
  sanitizeTestimonialData,
} from '@/lib/sanitize';

describe('Sanitization Utilities', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const input = '<p>Hello</p><script>alert("xss")</script>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain('<script>');
      expect(output).toContain('<p>Hello</p>');
    });

    it('should remove event handlers', () => {
      const input = '<div onclick="alert(\'xss\')">Click me</div>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain('onclick');
    });

    it('should remove javascript: protocol', () => {
      const input = '<a href="javascript:alert(\'xss\')">Link</a>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain('javascript:');
    });

    it('should remove iframe tags', () => {
      const input = '<iframe src="evil.com"></iframe>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain('<iframe');
    });
  });

  describe('sanitizeText', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("xss")</script>';
      const output = sanitizeText(input);
      expect(output).toContain('&lt;script&gt;');
      expect(output).not.toContain('<script>');
    });

    it('should escape quotes', () => {
      const input = 'Hello "World"';
      const output = sanitizeText(input);
      expect(output).toContain('&quot;');
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow https URLs', () => {
      const input = 'https://example.com';
      const output = sanitizeUrl(input);
      expect(output).toBe('https://example.com');
    });

    it('should block javascript: protocol', () => {
      const input = 'javascript:alert("xss")';
      const output = sanitizeUrl(input);
      expect(output).toBe('');
    });

    it('should block data: protocol', () => {
      const input = 'data:text/html,<script>alert("xss")</script>';
      const output = sanitizeUrl(input);
      expect(output).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    it('should accept valid email', () => {
      const input = 'test@example.com';
      const output = sanitizeEmail(input);
      expect(output).toBe('test@example.com');
    });

    it('should reject invalid email', () => {
      const input = 'not-an-email';
      const output = sanitizeEmail(input);
      expect(output).toBe('');
    });

    it('should remove HTML from email', () => {
      const input = '<script>alert("xss")</script>test@example.com';
      const output = sanitizeEmail(input);
      expect(output).not.toContain('<script>');
    });
  });

  describe('sanitizePhone', () => {
    it('should keep valid phone with +', () => {
      const input = '+905551234567';
      const output = sanitizePhone(input);
      expect(output).toBe('+905551234567');
    });

    it('should remove spaces and dashes', () => {
      const input = '+90 555 123 45 67';
      const output = sanitizePhone(input);
      expect(output).toBe('+905551234567');
    });

    it('should remove non-digit characters', () => {
      const input = '(555) 123-4567';
      const output = sanitizePhone(input);
      expect(output).toBe('5551234567');
    });
  });

  describe('sanitizeUserContent', () => {
    it('should sanitize HTML and limit length', () => {
      const input = '<script>alert("xss")</script>'.repeat(1000);
      const output = sanitizeUserContent(input);
      expect(output).not.toContain('<script>');
      expect(output.length).toBeLessThanOrEqual(10000);
    });
  });

  describe('sanitizeRsvpData', () => {
    it('should sanitize all RSVP fields', () => {
      const input = {
        full_name: '<script>alert("xss")</script>John Doe',
        email: 'JOHN@EXAMPLE.COM',
        phone: '+90 555 123 45 67',
        note: 'Looking forward!<script>alert("xss")</script>',
      };

      const output = sanitizeRsvpData(input);

      expect(output.full_name).not.toContain('<script>');
      expect(output.email).toBe('john@example.com');
      expect(output.phone).toBe('+905551234567');
      expect(output.note).not.toContain('<script>');
    });
  });

  describe('sanitizeLoveNoteData', () => {
    it('should sanitize love note fields', () => {
      const input = {
        guest_name: 'Jane<script>alert("xss")</script>',
        guest_email: 'JANE@EXAMPLE.COM',
        message: 'Beautiful wedding!<iframe src="evil.com"></iframe>',
      };

      const output = sanitizeLoveNoteData(input);

      expect(output.guest_name).not.toContain('<script>');
      expect(output.guest_email).toBe('jane@example.com');
      expect(output.message).not.toContain('<iframe');
    });
  });

  describe('sanitizeTestimonialData', () => {
    it('should sanitize testimonial fields', () => {
      const input = {
        name: 'Bob<script>alert("xss")</script>',
        message: 'Amazing event!<script>alert("xss")</script>',
      };

      const output = sanitizeTestimonialData(input);

      expect(output.name).not.toContain('<script>');
      expect(output.message).not.toContain('<script>');
    });
  });
});
