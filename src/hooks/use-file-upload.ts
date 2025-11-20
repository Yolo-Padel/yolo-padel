import { useMutation } from '@tanstack/react-query';

interface UploadFileData {
  file: File;
  folderPath: string; // Mandatory folder path for organizing uploads
  filename?: string;
}

interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    downloadUrl: string;
    pathname: string;
    contentType: string;
    contentDisposition: string;
    size: number;
  };
  message?: string;
}

const uploadFileApi = async (data: UploadFileData): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('folderPath', data.folderPath);
  
  if (data.filename) {
    formData.append('filename', data.filename);
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to upload file');
  }

  return response.json();
};

export const useFileUpload = () => {
  return useMutation({
    mutationFn: uploadFileApi,
    onError: (error) => {
      console.error('File upload error:', error);
    },
  });
};
