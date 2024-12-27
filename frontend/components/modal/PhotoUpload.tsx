import React, { useState } from "react";
import { Button, Image } from "@nextui-org/react";

interface PhotoUploadProps {
  photoUrl: string;
  setPhotoUrl: (url: string) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ photoUrl, setPhotoUrl }) => {
  const [preview, setPreview] = useState<string>(photoUrl || "");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === "string") {
          setPreview(e.target.result);
          setPhotoUrl(e.target.result);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-start gap-4">
      <input
        type="file"
        accept="image/*"
        id="photo-upload"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
      <div className="flex flex-row items-center gap-4">
        <Button as="label" htmlFor="photo-upload" color="primary" size="md">
          Upload Photo
        </Button>
        {preview && (
          <Button
            color="danger"
            size="md"
            onClick={() => {
              setPreview("");
              setPhotoUrl("");
            }}
          >
            Delete Photo
          </Button>
        )}
      </div>
      {preview && (
        <Image
          isZoomed
          src={preview}
          alt="Uploaded preview"
          style={{ objectFit: "cover" }}
          width="auto"
          height={200}
          className="rounded-md"
        />
      )}
    </div>
  );
};

export default PhotoUpload;
