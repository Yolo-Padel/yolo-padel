import { put } from '@vercel/blob';

export interface UploadResult {
  success: boolean;
  data?: {
    url: string;
    downloadUrl: string;
    pathname: string;
    contentType: string;
    contentDisposition: string;    
  };
  message?: string;
}

export const vercelBlobService = {
  uploadFile: async (file: File, filename?: string): Promise<UploadResult> => {
    try {
      // Generate filename if not provided
      const finalFilename = filename || `${Date.now()}-${file.name}`;
      
      // Upload file to Vercel Blob
      const blob = await put(finalFilename, file, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return {
        success: true,
        data: {
          url: blob.url,
          downloadUrl: blob.downloadUrl,
          pathname: blob.pathname,
          contentType: blob.contentType,
          contentDisposition: blob.contentDisposition,
        },
        message: 'File uploaded successfully',
      };
    } catch (error) {
      console.error('Vercel Blob upload error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload file',
      };
    }
  },

  uploadFromBuffer: async (buffer: Buffer, filename: string, contentType: string): Promise<UploadResult> => {
    try {
      const blob = await put(filename, buffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType,
      });

      return {
        success: true,
        data: {
          url: blob.url,
          downloadUrl: blob.downloadUrl,
          pathname: blob.pathname,
          contentType: blob.contentType,
          contentDisposition: blob.contentDisposition,
        },
        message: 'File uploaded successfully',
      };
    } catch (error) {
      console.error('Vercel Blob upload error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload file',
      };
    }
  },
};
