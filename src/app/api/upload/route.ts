import { NextRequest, NextResponse } from "next/server";
import { vercelBlobService } from "@/lib/services/vercel-blob.service";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const filename = formData.get("filename") as string | null;
    const folderPath = formData.get("folderPath") as string | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file provided",
        },
        { status: 400 }
      );
    }

    if (!folderPath) {
      return NextResponse.json(
        {
          success: false,
          message: "No folder path provided",
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "File size too large. Maximum size is 10MB",
        },
        { status: 400 }
      );
    }

    // Validate file type (images only)
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file type. Only images are allowed",
        },
        { status: 400 }
      );
    }

    // Upload file to Vercel Blob with folder path
    const result = await vercelBlobService.uploadFile(
      file,
      folderPath,
      filename || undefined
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Failed to upload file",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: "File uploaded successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
