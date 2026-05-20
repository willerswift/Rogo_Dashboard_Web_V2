"use client";

import { Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";

interface LogoAssetUploadProps {
  label: string;
  description: string;
  value?: string | File;
  onChange: (file: File) => void;
  accept?: string;
  icon?: "upload" | "image";
}

export function LogoAssetUpload({ 
  label, 
  description, 
  value, 
  onChange, 
  accept = "image/png, image/svg+xml",
  icon = "upload" 
}: LogoAssetUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(typeof value === "string" ? value : "");

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      const timer = setTimeout(() => {
        setPreviewUrl(url);
      }, 0);
      return () => {
        clearTimeout(timer);
        URL.revokeObjectURL(url);
      };
    } else if (typeof value === "string") {
      const timer = setTimeout(() => {
        setPreviewUrl(value);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [value]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <span className="text-sm font-bold text-foreground">{label}</span>
      <div className="flex items-center gap-6">
        <button
          onClick={handleClick}
          className="group relative flex h-[120px] w-[120px] shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface-muted transition-all hover:border-primary-300 hover:bg-surface"
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
          />
          {icon === "upload" ? (
            <Upload className="mb-2 h-6 w-6 text-neutral-400 group-hover:text-primary-300" />
          ) : (
            <ImageIcon className="mb-2 h-6 w-6 text-neutral-400 group-hover:text-primary-300" />
          )}
          <span className="text-center text-[11px] font-bold leading-tight text-neutral-400 group-hover:text-primary-300 uppercase tracking-wider">
            Upload<br />{accept.includes("svg") ? "SVG or PNG" : "PNG or ICO"}
          </span>
        </button>

        <div className="flex-1 space-y-3">
          <p className="text-[13px] leading-relaxed text-neutral-500 max-w-[400px]">
            {description}
          </p>
          
          {previewUrl && (
            <div className="flex items-center gap-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-surface-muted p-3 w-fit min-w-[140px]">
              <div className="relative h-8 w-8 overflow-hidden rounded-md border border-neutral-100 dark:border-neutral-800 p-1 flex items-center justify-center bg-white">
                <Image 
                  src={previewUrl} 
                  alt="Preview" 
                  width={32} 
                  height={32} 
                  className="object-contain"
                />
              </div>
              <span className="text-[12px] font-medium text-neutral-500 dark:text-neutral-400">
                Current {label}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
