'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import styles from './image-upload.module.css';

export interface ImageUploadProps {
  onUpload: (url: string, file: File) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  uploadType: 'product' | 'blog' | 'avatar';
  resourceId?: string;
}

export function ImageUpload({
  onUpload,
  accept = 'image/*',
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  uploadType,
  resourceId,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = useCallback((file: File): boolean => {
    if (file.size > maxSize) {
      setError(`文件大小超过限制 (最大 ${maxSize / 1024 / 1024}MB)`);
      return false;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setError('不支持的文件格式。仅支持: JPEG, PNG, GIF, WebP, SVG');
      return false;
    }

    return true;
  }, [maxSize]);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!validateFile(file)) return;

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      setUploading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', uploadType);
        if (resourceId) {
          formData.append('id', resourceId);
        }

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '上传失败');
        }

        const data = await response.json();
        onUpload(data.url, file);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '上传失败');
        setPreview(null);
      } finally {
        setUploading(false);
      }
    },
    [uploadType, resourceId, onUpload, validateFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className={styles.container}>
      <div
        className={`${styles.dropZone} ${dragActive ? styles.active : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className={styles.input}
          disabled={uploading}
        />

        {preview ? (
          <div className={styles.preview}>
            <div className="relative w-full h-full">
              <Image
                src={preview}
                alt="Preview"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            {uploading && <div className={styles.uploadingOverlay}>上传中...</div>}
          </div>
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.icon}>📁</span>
            <p className={styles.text}>
              {uploading ? '上传中...' : '拖拽图片到此，或点击选择'}
            </p>
            <p className={styles.hint}>
              支持 JPEG, PNG, GIF, WebP, SVG • 最大 {maxSize / 1024 / 1024}MB
            </p>
          </div>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}

export interface ImageGalleryProps {
  images: Array<{ url: string; name: string }>;
  onRemove?: (url: string) => void;
}

export function ImageGallery({ images, onRemove }: ImageGalleryProps) {
  return (
    <div className={styles.gallery}>
      {images.map((image) => (
        <div key={image.url} className={styles.galleryItem}>
          <div className="relative w-full h-full">
            <Image
              src={image.url}
              alt={image.name}
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          {onRemove && (
            <button
              className={styles.removeBtn}
              onClick={() => onRemove(image.url)}
              aria-label="Remove image"
            >
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
