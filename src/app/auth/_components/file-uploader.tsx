"use client";
import {
  Dropzone,
  DropZoneArea,
  DropzoneDescription,
  DropzoneFileList,
  DropzoneFileListItem,
  DropzoneMessage,
  DropzoneRemoveFile,
  DropzoneTrigger,
  useDropzone,
} from "@/components/ui/dropzone";
import { CloudUploadIcon, Trash2Icon } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
 
export function FileUploader() {
  const uploadMutation = useFileUpload();

  const dropzone = useDropzone({
    onDropFile: async (file: File) => {
      try {
        // Upload file to Vercel Blob
        const result = await uploadMutation.mutateAsync({
          file,
          filename: `${Date.now()}-${file.name}`,
        });

        if (result.success && result.data) {
          return {
            status: "success" as const,
            result: result.data.url, // Use the uploaded file URL
            metadata: {
              originalName: file.name,
              size: result.data.size,
              contentType: result.data.contentType,
              downloadUrl: result.data.downloadUrl,
            },
          };
        } else {
          throw new Error(result.message || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        return {
          status: "error" as const,
          error: error instanceof Error ? error.message : 'Upload failed',
        };
      }
    },
    validation: {
      accept: {
        "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      },
      maxSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 1,
    },
  });
 
  return (
    <div className="not-prose flex flex-col gap-4">
      <Dropzone {...dropzone}>
        <div>
          <div className="flex justify-between">
            <DropzoneDescription>
              Please select up to 1 file
            </DropzoneDescription>
            <DropzoneMessage />
          </div>
          <DropZoneArea>
            <DropzoneTrigger className="flex flex-col items-center gap-4 bg-transparent p-10 text-center text-sm">
              <CloudUploadIcon className="size-8" />
              <div>
                <p className="font-semibold">Upload image</p>
                <p className="text-sm text-muted-foreground">
                  Click here or drag and drop to upload
                </p>
              </div>
            </DropzoneTrigger>
          </DropZoneArea>
        </div>
 
        <DropzoneFileList className="grid grid-cols-3 gap-3 p-0">
          {dropzone.fileStatuses.map((file) => (
            <DropzoneFileListItem
              className="overflow-hidden rounded-md bg-secondary p-0 shadow-sm"
              key={file.id}
              file={file}
            >
              {file.status === "pending" && (
                <div className="aspect-video animate-pulse bg-black/20 flex items-center justify-center">
                  <div className="text-sm text-muted-foreground">
                    {uploadMutation.isPending ? "Uploading..." : "Processing..."}
                  </div>
                </div>
              )}
              {file.status === "success" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.result}
                  alt={`uploaded-${file.fileName}`}
                  className="aspect-video object-cover"
                />
              )}
              {file.status === "error" && (
                <div className="aspect-video bg-red-50 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="text-red-500 text-sm font-medium">Upload Failed</div>
                    <div className="text-red-400 text-xs mt-1">
                      {file.error || "Unknown error"}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between p-2 pl-4">
                <div className="min-w-0">
                  <p className="truncate text-sm">{file.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.status === "success" && (file as any).metadata?.size 
                      ? `${((file as any).metadata.size / (1024 * 1024)).toFixed(2)} MB`
                      : `${(file.file.size / (1024 * 1024)).toFixed(2)} MB`
                    }
                  </p>
                </div>
                <DropzoneRemoveFile>
                  <Trash2Icon className="size-4" />
                </DropzoneRemoveFile>
              </div>
            </DropzoneFileListItem>
          ))}
        </DropzoneFileList>
      </Dropzone>
    </div>
  );
}