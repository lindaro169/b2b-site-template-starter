'use client';

import { useState, useRef } from 'react';
import styles from '../import.module.css';

interface QuickImportModeProps {
  token: string;
}

export default function QuickImportMode({ token }: QuickImportModeProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [importStats, setImportStats] = useState<{
    total: number;
    successful: number;
    failed: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.name.endsWith('.zip')) {
      setUploadError('只支持 ZIP 文件上传');
      return;
    }

    // 验证文件大小（限制 100MB）
    if (file.size > 100 * 1024 * 1024) {
      setUploadError('文件大小不能超过 100MB');
      return;
    }

    setSelectedFile(file);
    setUploadError('');
    setUploadSuccess(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.background = '#eef2ff';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.background = 'transparent';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.background = 'transparent';

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      setUploadError('只支持 ZIP 文件上传');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setUploadError('文件大小不能超过 100MB');
      return;
    }

    setSelectedFile(file);
    setUploadError('');
    setUploadSuccess(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('请选择文件');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess(false);
    setUploadProgress(0);
    setImportStats(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // 使用 XMLHttpRequest 来追踪上传进度
      const xhr = new XMLHttpRequest();

      // 监听进度事件
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
        }
      });

      // 创建 Promise 来处理请求完成
      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              setImportStats(response.stats);
              setUploadSuccess(true);
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
              resolve();
            } catch {
              reject(new Error('解析响应失败'));
            }
          } else {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.error || '上传失败'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('网络错误'));
        });

        xhr.open('POST', '/api/products/batch/import-quick');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });

      await uploadPromise;
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '上传失败');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div>
      {/* 文件上传区域 */}
      <div
        className={styles.uploadZone}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <div className={styles.uploadContent}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#1a202c' }}>
            上传 ZIP 文件
          </h3>
          <p style={{ color: '#718096', marginBottom: '4px' }}>
            {selectedFile
              ? `已选择: ${selectedFile.name}`
              : '拖拽文件到此或点击选择'}
          </p>
          <p style={{ fontSize: '12px', color: '#a0aec0', marginBottom: '0' }}>
            ZIP 文件应包含: Excel 数据文件 + 产品图片文件夹
          </p>
        </div>
      </div>

      {/* 文件详情 */}
      {selectedFile && (
        <div style={{ marginTop: '20px', padding: '12px 16px', background: '#f0f4ff', borderRadius: '6px' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#1a202c' }}>
            <strong>文件信息:</strong>
          </p>
          <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#4a5568' }}>
            • 名称: {selectedFile.name}
          </p>
          <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#4a5568' }}>
            • 大小: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <p style={{ margin: '0', fontSize: '13px', color: '#4a5568' }}>
            • 类型: ZIP 压缩包
          </p>
        </div>
      )}

      {/* 错误提示 */}
      {uploadError && (
        <div style={{ marginTop: '20px', padding: '12px 16px', background: '#fed7d7', border: '1px solid #fc8181', borderRadius: '6px', color: '#c53030' }}>
          ❌ {uploadError}
        </div>
      )}

      {/* 成功提示 */}
      {uploadSuccess && importStats && (
        <div style={{ marginTop: '20px', padding: '16px', background: '#c6f6d5', border: '1px solid #9ae6b4', borderRadius: '6px' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#22863a' }}>
            ✅ 导入成功！
          </p>
          <div style={{ fontSize: '13px', color: '#2f855a' }}>
            <p style={{ margin: '0 0 4px 0' }}>• 总计: {importStats.total} 个产品</p>
            <p style={{ margin: '0 0 4px 0' }}>• 成功: {importStats.successful} 个</p>
            <p style={{ margin: '0', color: importStats.failed > 0 ? '#c53030' : '#2f855a' }}>
              • 失败: {importStats.failed} 个
            </p>
          </div>
        </div>
      )}

      {/* 上传进度 */}
      {isUploading && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#1a202c', fontWeight: '600' }}>上传进度</span>
            <span style={{ color: '#718096' }}>{Math.round(uploadProgress)}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                width: `${uploadProgress}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* 上传按钮 */}
      <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          style={{
            padding: '12px 24px',
            background: selectedFile && !isUploading ? '#667eea' : '#cbd5e0',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: selectedFile && !isUploading ? 'pointer' : 'not-allowed',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.3s ease',
            opacity: selectedFile && !isUploading ? 1 : 0.6,
          }}
          onMouseEnter={(e) => {
            if (selectedFile && !isUploading) {
              (e.currentTarget as HTMLButtonElement).style.background = '#5568d3';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedFile && !isUploading) {
              (e.currentTarget as HTMLButtonElement).style.background = '#667eea';
            }
          }}
        >
          {isUploading ? '上传中...' : '开始上传'}
        </button>

        <button
          onClick={() => {
            setSelectedFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            setUploadError('');
            setUploadSuccess(false);
          }}
          disabled={isUploading}
          style={{
            padding: '12px 24px',
            background: 'white',
            color: '#667eea',
            border: '1px solid #e0e6ed',
            borderRadius: '8px',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.3s ease',
            opacity: isUploading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isUploading) {
              (e.currentTarget as HTMLButtonElement).style.background = '#f7fafc';
            }
          }}
          onMouseLeave={(e) => {
            if (!isUploading) {
              (e.currentTarget as HTMLButtonElement).style.background = 'white';
            }
          }}
        >
          取消
        </button>
      </div>

      {/* 帮助信息 */}
      <div style={{ marginTop: '20px', padding: '16px', background: '#f7fafc', borderRadius: '8px', borderLeft: '4px solid #667eea' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600', color: '#1a202c' }}>
          📝 快速导入说明
        </p>
        <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '13px', color: '#4a5568' }}>
          <li style={{ marginBottom: '4px' }}>
            ZIP 文件应包含 Excel 文件（data.xlsx）和图片文件夹（images）
          </li>
          <li style={{ marginBottom: '4px' }}>
            Excel 第一行为列标题，后续行为产品数据
          </li>
          <li style={{ marginBottom: '4px' }}>
            图片文件名应与 Excel 中的图片列值对应
          </li>
          <li>
            支持图片格式: JPG, PNG, WebP（最大 5MB/张）
          </li>
        </ul>
      </div>
    </div>
  );
}
