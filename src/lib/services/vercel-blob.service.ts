import { put, del } from "@vercel/blob";

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

export interface DeleteResult {
  success: boolean;
  message?: string;
}

export const vercelBlobService = {
  uploadFile: async (
    file: File,
    folderPath: string,
    filename?: string
  ): Promise<UploadResult> => {
    try {
      // Generate filename if not provided
      const finalFilename = filename || `${Date.now()}-${file.name}`;

      // Combine folderPath with filename
      // Ensure folderPath doesn't start with / and ends without /
      const cleanFolderPath = folderPath
        .replace(/(\r\n|\n|\r)/g, "")
        .replace(/^\/+|\/+$/g, "")
        .trim();
      const fullPath = `${cleanFolderPath}/${finalFilename}`;

      // Upload file to Vercel Blob
      const blob = await put(fullPath, file, {
        access: "public",
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
        message: "File uploaded successfully",
      };
    } catch (error) {
      console.error("Vercel Blob upload error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to upload file",
      };
    }
  },

  uploadFromBuffer: async (
    buffer: Buffer,
    folderPath: string,
    filename: string,
    contentType: string
  ): Promise<UploadResult> => {
    try {
      // Combine folderPath with filename
      const cleanFolderPath = folderPath
        .replace(/(\r\n|\n|\r)/g, "")
        .replace(/^\/+|\/+$/g, "")
        .trim();
      const fullPath = `${cleanFolderPath}/${filename}`;

      const blob = await put(fullPath, buffer, {
        access: "public",
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
        message: "File uploaded successfully",
      };
    } catch (error) {
      console.error("Vercel Blob upload error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to upload file",
      };
    }
  },

  /**
   * Delete a file from Vercel Blob storage
   * @param url - Full URL of the file to delete
   */
  deleteFile: async (url: string): Promise<DeleteResult> => {
    try {
      if (!url) {
        return {
          success: false,
          message: "No URL provided",
        };
      }

      // Delete file from Vercel Blob
      await del(url, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return {
        success: true,
        message: "File deleted successfully",
      };
    } catch (error) {
      console.error("Vercel Blob delete error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete file",
      };
    }
  },
};
