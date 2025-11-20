"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFileUpload } from "@/hooks/use-file-upload";
import { Loader2, Camera } from "lucide-react";
import {
  Dropzone,
  DropzoneDescription,
  DropzoneMessage,
  useDropzone,
} from "@/components/ui/dropzone";
import { cn } from "@/lib/utils";

type AvatarUploaderProps = {
  value?: string | null;
  initials: string;
  name?: string;
  folderPath: string;
  disabled?: boolean;
  onChange?: (url: string) => void;
};

export function AvatarUploader({
  value,
  initials,
  name = "User avatar",
  folderPath,
  disabled,
  onChange,
}: AvatarUploaderProps) {
  const uploadMutation = useFileUpload();
  const [preview, setPreview] = useState(value ?? "");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const safeFolderPath = useMemo(
    () => folderPath.replace(/(\r\n|\n|\r)/g, "").trim(),
    [folderPath]
  );

  useEffect(() => {
    setPreview(value ?? "");
  }, [value]);

  const dropzone = useDropzone<string, string>({
    onDropFile: async (file) => {
      try {
        const result = await uploadMutation.mutateAsync({
          file,
          folderPath: safeFolderPath,
          filename: `${Date.now()}-${file.name}`,
        });

        if (!result.success || !result.data?.url) {
          throw new Error(result.message || "Upload failed");
        }

        return {
          status: "success" as const,
          result: result.data.url,
        };
      } catch (error) {
        return {
          status: "error" as const,
          error: error instanceof Error ? error.message : "Upload failed",
        };
      }
    },
    onFileUploaded: (url) => {
      setPreview(url);
      onChange?.(url);
      setErrorMessage(undefined);
    },
    onFileUploadError: (message) => {
      setErrorMessage(message);
    },
    onRootError: (message) => {
      setErrorMessage(message);
    },
    validation: {
      accept: {
        "image/*": [".png", ".jpg", ".jpeg", ".webp"],
      },
      maxSize: 5 * 1024 * 1024,
      maxFiles: 1,
    },
  });

  const isUploading = useMemo(() => {
    return (
      uploadMutation.isPending ||
      dropzone.fileStatuses.some((status) => status.status === "pending")
    );
  }, [dropzone.fileStatuses, uploadMutation.isPending]);

  return (
    <Dropzone {...dropzone}>
      <DropzoneDescription className="sr-only">
        Upload avatar
      </DropzoneDescription>
      {errorMessage && (
        <DropzoneMessage className="text-xs text-destructive">
          {errorMessage}
        </DropzoneMessage>
      )}
      <div className="relative w-fit">
        <Avatar className="size-[72px] border border-black/8">
          <AvatarImage src={preview || undefined} alt={name} />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>

        <input
          {...dropzone.getInputProps({
            className: "sr-only",
            ref: (node: HTMLInputElement | null) => {
              inputRef.current = node;
            },
          })}
        />
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            inputRef.current?.click();
          }}
          aria-label="Upload avatar"
          className={cn(
            "absolute left-[54px] top-[47px] z-10 flex size-8 items-center justify-center rounded-md border border-[#c3d223] bg-white text-[#c3d223] transition-colors",
            "hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>
      </div>
    </Dropzone>
  );
}
