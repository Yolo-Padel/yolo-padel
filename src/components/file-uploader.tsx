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
import { CloudUploadIcon, Trash2Icon, Loader2 } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import * as React from "react";

type FileUploaderProps = {
  folderPath: string; // Mandatory: folder path untuk organize uploads
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxFiles?: number;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  className?: string;
};

export function FileUploader({
  folderPath,
  value,
  onChange,
  maxFiles = 5,
  accept = { "image/*": [".png", ".jpg", ".jpeg"] },
  multiple = false,
  className,
}: FileUploaderProps) {
  const uploadMutation = useFileUpload();
  const [uploadedUrls, setUploadedUrls] = React.useState<string[]>(value ?? []);
  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
  const MAX_SIZE_LABEL = `${(MAX_SIZE_BYTES / (1024 * 1024)) | 0} MB`;
  const allowedExtensions = React.useMemo(() => {
    try {
      const flat = Object.values(accept || {}).flat() as string[];
      if (!flat || flat.length === 0) return "";
      return flat.map((ext) => ext.replace(".", "").toUpperCase()).join(", ");
    } catch {
      return "";
    }
  }, [accept]);

  // Sync with external value changes
  React.useEffect(() => {
    if (value && JSON.stringify(value) !== JSON.stringify(uploadedUrls)) {
      setUploadedUrls(value);
    }
  }, [value]);

  // Notify parent of changes
  React.useEffect(() => {
    if (JSON.stringify(uploadedUrls) !== JSON.stringify(value)) {
      onChange?.(uploadedUrls);
    }
  }, [uploadedUrls]);

  const dropzone = useDropzone({
    onDropFile: async (file: File) => {
      try {
        const result = await uploadMutation.mutateAsync({
          file,
          folderPath,
          filename: `${Date.now()}-${file.name}`,
        });

        if (result.success && result.data) {
          const url = result.data.url;
          setUploadedUrls((prev) => {
            const next = multiple ? [...prev, url] : [url];
            return next;
          });
          return {
            status: "success" as const,
            result: url,
            metadata: {
              originalName: file.name,
              size: result.data.size,
              contentType: result.data.contentType,
              downloadUrl: result.data.downloadUrl,
            },
          };
        } else {
          throw new Error(result.message || "Upload failed");
        }
      } catch (error) {
        return {
          status: "error" as const,
          error: error instanceof Error ? error.message : "Upload failed",
        };
      }
    },
    validation: {
      accept,
      maxSize: MAX_SIZE_BYTES,
      maxFiles: multiple ? maxFiles : 1,
    },
  });

  // Single-file preview: prefer newly uploaded success, fallback to existing value[0]
  const previewUrl = React.useMemo(() => {
    if (multiple) return null;
    const success = dropzone.fileStatuses.find((f) => f.status === "success");
    if (success?.result) return success.result as string;
    return uploadedUrls?.[0] ?? null;
  }, [multiple, dropzone.fileStatuses, uploadedUrls]);

  return (
    <div className={className ?? "not-prose flex flex-col gap-4"}>
      <Dropzone {...dropzone}>
        <div>
          <div className="flex justify-between">
            <DropzoneDescription>
              {multiple
                ? `Please select up to ${maxFiles} files`
                : "Please select 1 file"}
            </DropzoneDescription>
            <DropzoneMessage />
          </div>
          <DropZoneArea>
            <DropzoneTrigger className="relative flex flex-col items-center justify-center bg-transparent p-0 text-center text-sm overflow-hidden">
              {!multiple && previewUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-full aspect-video object-cover"
                  />
                  {/* Loading overlay for single file mode */}
                  {uploadMutation.isPending && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="size-8 animate-spin text-white" />
                      <p className="text-sm text-white font-medium">
                        Uploading...
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 p-10 w-full">
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="size-8 animate-spin text-primary" />
                      <div>
                        <p className="font-semibold">Uploading...</p>
                        <p className="text-sm text-muted-foreground">
                          Please wait
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <CloudUploadIcon className="size-8" />
                      <div>
                        <p className="font-semibold">
                          Upload image{multiple ? "s" : ""}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Click here or drag and drop to upload
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {allowedExtensions ? `${allowedExtensions} • ` : ""}
                          Max {MAX_SIZE_LABEL}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </DropzoneTrigger>
          </DropZoneArea>
        </div>

        <div>
          {multiple && (
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
                        {uploadMutation.isPending
                          ? "Uploading..."
                          : "Processing..."}
                      </div>
                    </div>
                  )}
                  {file.status === "success" && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={file.result as string}
                      alt={`uploaded-${file.fileName}`}
                      className="aspect-video object-cover"
                    />
                  )}
                  {file.status === "error" && (
                    <div className="aspect-video bg-red-50 flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="text-red-500 text-sm font-medium">
                          Upload Failed
                        </div>
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
                        {file.status === "success" &&
                        (file as any).metadata?.size
                          ? `${((file as any).metadata.size / (1024 * 1024)).toFixed(2)} MB`
                          : `${(file.file.size / (1024 * 1024)).toFixed(2)} MB`}
                      </p>
                    </div>
                    <DropzoneRemoveFile />
                  </div>
                </DropzoneFileListItem>
              ))}
            </DropzoneFileList>
          )}

          {/* Render existing URLs that are not part of current dropzone statuses (only for multiple) */}
          {(() => {
            if (!multiple) return null;
            const successUrls = new Set(
              dropzone.fileStatuses
                .filter((f) => f.status === "success")
                .map((f) => f.result as string)
            );
            const existingOnly = uploadedUrls.filter(
              (u) => !successUrls.has(u)
            );
            if (existingOnly.length === 0) return null;
            return (
              <DropzoneFileList className="grid grid-cols-3 gap-3 p-0 mt-3">
                {existingOnly.map((url) => (
                  <DropzoneFileListItem
                    className="overflow-hidden rounded-md bg-secondary p-0 shadow-sm"
                    key={url}
                    // Cast minimal shape to satisfy child rendering expectations
                    file={
                      {
                        id: url,
                        status: "success",
                        result: url,
                        fileName: url.split("/").pop() || "image",
                        file: { size: 0 },
                      } as any
                    }
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt="existing-upload"
                      className="aspect-video object-cover"
                    />
                    <div className="flex items-center p-2">
                      <p className="truncate text-sm">{url.split("/").pop()}</p>
                      <button
                        type="button"
                        onClick={() =>
                          setUploadedUrls((prev) =>
                            prev.filter((x) => x !== url)
                          )
                        }
                        className="inline-flex items-center rounded p-1 hover:bg-black/5 bg-primary text-white"
                        aria-label="Remove image"
                      >
                        <Trash2Icon className="size-4" />
                      </button>
                    </div>
                  </DropzoneFileListItem>
                ))}
              </DropzoneFileList>
            );
          })()}
        </div>
      </Dropzone>
    </div>
  );
}
