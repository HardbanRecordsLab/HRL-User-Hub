import { z } from "zod";

// Allowed MIME types for brand assets
export const BRAND_ASSET_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'application/pdf'
] as const;

// Allowed MIME types for music releases
export const MUSIC_AUDIO_ALLOWED_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/flac',
  'audio/x-wav',
  'audio/mp3'
] as const;

export const MUSIC_COVER_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg'
] as const;

// File extension to MIME type mapping for validation
const EXTENSION_MIME_MAP: Record<string, string[]> = {
  'jpg': ['image/jpeg'],
  'jpeg': ['image/jpeg'],
  'png': ['image/png'],
  'gif': ['image/gif'],
  'webp': ['image/webp'],
  'mp4': ['video/mp4'],
  'pdf': ['application/pdf'],
  'mp3': ['audio/mpeg', 'audio/mp3'],
  'wav': ['audio/wav', 'audio/x-wav'],
  'flac': ['audio/flac']
};

// Magic bytes for common file types (first bytes of file)
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
  'video/mp4': [[0x00, 0x00, 0x00], [0x66, 0x74, 0x79, 0x70]], // ftyp at offset 4
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'audio/mpeg': [[0xFF, 0xFB], [0xFF, 0xFA], [0x49, 0x44, 0x33]], // MP3 headers and ID3
  'audio/wav': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
  'audio/flac': [[0x66, 0x4C, 0x61, 0x43]] // fLaC
};

// Max file sizes in bytes
export const MAX_FILE_SIZES = {
  brandAsset: 50 * 1024 * 1024, // 50MB
  musicAudio: 100 * 1024 * 1024, // 100MB
  musicCover: 10 * 1024 * 1024 // 10MB
};

// Sanitize filename - remove potentially dangerous characters
export function sanitizeFilename(filename: string): string {
  // Get extension
  const parts = filename.split('.');
  const ext = parts.length > 1 ? parts.pop()?.toLowerCase() : '';
  const name = parts.join('.');
  
  // Sanitize: keep only alphanumeric, underscore, hyphen
  const sanitizedName = name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 100);
  
  return ext ? `${sanitizedName}.${ext}` : sanitizedName;
}

// Validate file extension matches allowed types
export function validateExtension(filename: string, allowedMimeTypes: readonly string[]): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return false;
  
  const validMimes = EXTENSION_MIME_MAP[ext];
  if (!validMimes) return false;
  
  return validMimes.some(mime => allowedMimeTypes.includes(mime));
}

// Validate MIME type matches file content (magic bytes)
export async function validateMimeType(file: File, declaredMime: string): Promise<boolean> {
  try {
    // Read first 12 bytes of the file
    const buffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Check magic bytes for the declared MIME type
    const magicPatterns = MAGIC_BYTES[declaredMime];
    if (!magicPatterns) {
      // If we don't have magic bytes for this type, allow but log
      if (import.meta.env.DEV) {
        console.warn(`No magic bytes check available for: ${declaredMime}`);
      }
      return true;
    }
    
    // Check if any magic pattern matches
    for (const pattern of magicPatterns) {
      let matches = true;
      for (let i = 0; i < pattern.length; i++) {
        if (bytes[i] !== pattern[i]) {
          matches = false;
          break;
        }
      }
      if (matches) return true;
    }
    
    return false;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error validating file magic bytes:', error);
    }
    return false;
  }
}

// Complete file validation schema
export const fileValidationSchema = z.object({
  name: z.string()
    .min(1, "Nazwa pliku jest wymagana")
    .max(255, "Nazwa pliku jest zbyt długa")
    .refine(name => !name.includes('..'), "Nieprawidłowa nazwa pliku"),
  size: z.number()
    .positive("Rozmiar pliku musi być dodatni"),
  type: z.string()
    .min(1, "Typ pliku jest wymagany")
});

// Validate a file before upload
export async function validateFileForUpload(
  file: File,
  allowedMimeTypes: readonly string[],
  maxSize: number
): Promise<{ valid: boolean; error?: string }> {
  // Basic schema validation
  const basicValidation = fileValidationSchema.safeParse({
    name: file.name,
    size: file.size,
    type: file.type
  });
  
  if (!basicValidation.success) {
    return { valid: false, error: basicValidation.error.errors[0].message };
  }
  
  // Check file size
  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    return { valid: false, error: `Plik jest zbyt duży. Maksymalny rozmiar: ${maxMB}MB` };
  }
  
  // Check file size is not zero
  if (file.size === 0) {
    return { valid: false, error: "Plik jest pusty" };
  }
  
  // Check extension matches allowed types
  if (!validateExtension(file.name, allowedMimeTypes)) {
    return { valid: false, error: "Niedozwolony typ pliku" };
  }
  
  // Check MIME type is in allowed list
  if (!allowedMimeTypes.includes(file.type as any)) {
    return { valid: false, error: "Niedozwolony typ MIME pliku" };
  }
  
  // Validate magic bytes match declared MIME type
  const mimeValid = await validateMimeType(file, file.type);
  if (!mimeValid) {
    return { valid: false, error: "Zawartość pliku nie odpowiada zadeklarowanemu typowi" };
  }
  
  return { valid: true };
}

// Generate a safe filename for storage
export function generateSafeFilename(originalName: string): string {
  const sanitized = sanitizeFilename(originalName);
  const ext = sanitized.split('.').pop() || '';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  return ext ? `${timestamp}_${random}.${ext}` : `${timestamp}_${random}`;
}
