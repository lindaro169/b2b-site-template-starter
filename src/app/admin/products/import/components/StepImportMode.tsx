'use client';

import { useState, useRef } from 'react';

interface StepImportModeProps {
  token: string;
}

type ImportStep = 'upload-excel' | 'validate' | 'upload-images' | 'complete';

interface ValidationResult {
  valid: boolean;
  totalRows: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  warnings: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

export default function StepImportMode({ token }: StepImportModeProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload-excel');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validationError, setValidationError] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  // ===== Step 1: Upload Excel =====
  const handleExcelSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      setValidationError('只支持 Excel 文件（.xlsx）');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setValidationError('文件大小不能超过 50MB');
      return;
    }

    setExcelFile(file);
    setValidationError('');
    setValidationResult(null);
  };

  const handleExcelDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.background = 'transparent';

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      setValidationError('只支持 Excel 文件（.xlsx）');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setValidationError('文件大小不能超过 50MB');
      return;
    }

    setExcelFile(file);
    setValidationError('');
    setValidationResult(null);
  };

  const handleValidateExcel = async () => {
    if (!excelFile) {
      setValidationError('请选择 Excel 文件');
      return;
    }

    setIsValidating(true);
    setValidationError('');
    setValidationResult(null);

    try {
      const formData = new FormData();
      formData.append('file', excelFile);

      const response = await fetch('/api/products/batch/validate-excel', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '验证失败');
      }

      const result = await response.json();
      setValidationResult(result);

      if (result.valid) {
        setCurrentStep('upload-images');
      }
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : '验证失败');
    } finally {
      setIsValidating(false);
    }
  };

  // ===== Step 2: Upload Images =====
  const handleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    const newFiles = Array.from(files).filter((file) => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      return validTypes.includes(file.type);
    });

    if (newFiles.length !== files.length) {
      setUploadError('仅支持 JPG, PNG, WebP 格式的图片');
    }

    setImageFiles((prev) => [...prev, ...newFiles]);
    setUploadError('');
  };

  const handleImagesDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.background = 'transparent';

    const files = e.dataTransfer.files;
    if (!files) return;

    const newFiles = Array.from(files).filter((file) => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      return validTypes.includes(file.type);
    });

    if (newFiles.length !== files.length) {
      setUploadError('仅支持 JPG, PNG, WebP 格式的图片');
    }

    setImageFiles((prev) => [...prev, ...newFiles]);
    setUploadError('');
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadImages = async () => {
    if (!excelFile || !validationResult?.valid) {
      setUploadError('请先完成 Excel 验证');
      return;
    }

    setIsUploadingImages(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('excelFile', excelFile);
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch('/api/products/batch/import-step', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '导入失败');
      }

      setUploadSuccess(true);
      setCurrentStep('complete');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '导入失败');
    } finally {
      setIsUploadingImages(false);
    }
  };

  return (
    <div>
      {/* Step 1: Upload Excel */}
      {currentStep === 'upload-excel' && (
        <div>
          <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e0e6ed' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#667eea',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  marginRight: '12px',
                }}
              >
                1
              </div>
              <h3 style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#1a202c' }}>
                上传 Excel 文件
              </h3>
            </div>

            {/* Upload Zone */}
            <div
              style={{
                border: '2px dashed #cbd5e0',
                borderRadius: '8px',
                padding: '32px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: '#f7fafc',
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.background = '#eef2ff';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e0';
                e.currentTarget.style.background = '#f7fafc';
              }}
              onDrop={handleExcelDrop}
              onClick={() => excelInputRef.current?.click()}
            >
              <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx"
                onChange={handleExcelSelect}
                style={{ display: 'none' }}
              />
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
              <p style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#1a202c' }}>
                {excelFile ? '已选择: ' + excelFile.name : '选择或拖拽 Excel 文件'}
              </p>
              <p style={{ margin: '0', fontSize: '13px', color: '#718096' }}>
                支持 .xlsx 格式，最大 50MB
              </p>
            </div>

            {/* File Info */}
            {excelFile && (
              <div style={{ marginTop: '12px', padding: '12px 16px', background: '#f0f4ff', borderRadius: '6px' }}>
                <p style={{ margin: '0', fontSize: '13px', color: '#4a5568' }}>
                  📋 {excelFile.name} ({(excelFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}

            {/* Validation Errors */}
            {validationError && (
              <div style={{ marginTop: '12px', padding: '12px 16px', background: '#fed7d7', border: '1px solid #fc8181', borderRadius: '6px', color: '#c53030', fontSize: '13px' }}>
                ❌ {validationError}
              </div>
            )}

            {/* Validation Results */}
            {validationResult && (
              <div style={{ marginTop: '12px' }}>
                {validationResult.valid ? (
                  <div style={{ padding: '12px 16px', background: '#c6f6d5', border: '1px solid #9ae6b4', borderRadius: '6px', color: '#22863a', fontSize: '13px' }}>
                    ✅ 验证通过！检测到 {validationResult.totalRows} 行产品数据
                  </div>
                ) : (
                  <div style={{ padding: '12px 16px', background: '#fed7d7', border: '1px solid #fc8181', borderRadius: '6px', color: '#c53030', fontSize: '13px' }}>
                    ❌ 验证失败，发现 {validationResult.errors.length} 个错误
                    <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                      {validationResult.errors.slice(0, 3).map((error, idx) => (
                        <li key={idx} style={{ fontSize: '12px' }}>
                          第 {error.row} 行 {error.field}: {error.message}
                        </li>
                      ))}
                      {validationResult.errors.length > 3 && (
                        <li style={{ fontSize: '12px' }}>... 还有 {validationResult.errors.length - 3} 个错误</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Buttons */}
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button
                onClick={handleValidateExcel}
                disabled={!excelFile || isValidating}
                style={{
                  padding: '12px 24px',
                  background: excelFile && !isValidating ? '#667eea' : '#cbd5e0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: excelFile && !isValidating ? 'pointer' : 'not-allowed',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  opacity: excelFile && !isValidating ? 1 : 0.6,
                }}
              >
                {isValidating ? '验证中...' : '验证 Excel'}
              </button>

              <button
                onClick={() => {
                  setExcelFile(null);
                  if (excelInputRef.current) excelInputRef.current.value = '';
                  setValidationError('');
                  setValidationResult(null);
                }}
                disabled={isValidating}
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  color: '#667eea',
                  border: '1px solid #e0e6ed',
                  borderRadius: '8px',
                  cursor: isValidating ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  opacity: isValidating ? 0.6 : 1,
                }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Upload Images */}
      {(currentStep === 'upload-images' || currentStep === 'complete') && (
        <div>
          <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e0e6ed' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: currentStep === 'complete' ? '#22863a' : '#667eea',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  marginRight: '12px',
                }}
              >
                {currentStep === 'complete' ? '✓' : '2'}
              </div>
              <h3 style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#1a202c' }}>
                上传产品图片（可选）
              </h3>
            </div>

            {currentStep === 'upload-images' && (
              <>
                {/* Upload Zone */}
                <div
                  style={{
                    border: '2px dashed #cbd5e0',
                    borderRadius: '8px',
                    padding: '32px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: '#f7fafc',
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.background = '#eef2ff';
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e0';
                    e.currentTarget.style.background = '#f7fafc';
                  }}
                  onDrop={handleImagesDrop}
                  onClick={() => imagesInputRef.current?.click()}
                >
                  <input
                    ref={imagesInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImagesSelect}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🖼️</div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#1a202c' }}>
                    选择或拖拽图片文件
                  </p>
                  <p style={{ margin: '0', fontSize: '13px', color: '#718096' }}>
                    支持 JPG, PNG, WebP 格式，单个最大 5MB
                  </p>
                </div>

                {/* Error */}
                {uploadError && (
                  <div style={{ marginTop: '12px', padding: '12px 16px', background: '#fed7d7', border: '1px solid #fc8181', borderRadius: '6px', color: '#c53030', fontSize: '13px' }}>
                    ❌ {uploadError}
                  </div>
                )}

                {/* Image List */}
                {imageFiles.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600', color: '#1a202c' }}>
                      已选择 {imageFiles.length} 张图片
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                      {imageFiles.map((file, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: 'relative',
                            background: '#f7fafc',
                            borderRadius: '6px',
                            padding: '8px',
                            fontSize: '11px',
                            color: '#4a5568',
                            wordBreak: 'break-all',
                          }}
                        >
                          <div style={{ marginBottom: '4px' }}>📷 {file.name}</div>
                          <button
                            onClick={() => removeImage(idx)}
                            style={{
                              background: '#fc8181',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              width: '100%',
                            }}
                          >
                            删除
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleUploadImages}
                    disabled={isUploadingImages}
                    style={{
                      padding: '12px 24px',
                      background: !isUploadingImages ? '#667eea' : '#cbd5e0',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: !isUploadingImages ? 'pointer' : 'not-allowed',
                      fontWeight: '600',
                      fontSize: '14px',
                      opacity: !isUploadingImages ? 1 : 0.6,
                    }}
                  >
                    {isUploadingImages ? '导入中...' : '完成导入'}
                  </button>

                  <button
                    onClick={() => setCurrentStep('upload-excel')}
                    disabled={isUploadingImages}
                    style={{
                      padding: '12px 24px',
                      background: 'white',
                      color: '#667eea',
                      border: '1px solid #e0e6ed',
                      borderRadius: '8px',
                      cursor: isUploadingImages ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      opacity: isUploadingImages ? 0.6 : 1,
                    }}
                  >
                    返回
                  </button>
                </div>
              </>
            )}

            {currentStep === 'complete' && uploadSuccess && (
              <div style={{ padding: '16px', background: '#c6f6d5', border: '1px solid #9ae6b4', borderRadius: '6px', color: '#22863a', textAlign: 'center' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '18px' }}>✅</p>
                <p style={{ margin: '0', fontSize: '14px', fontWeight: '600' }}>导入完成！</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Info */}
      {currentStep === 'upload-excel' && (
        <div style={{ padding: '16px', background: '#f7fafc', borderRadius: '8px', borderLeft: '4px solid #667eea' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600', color: '#1a202c' }}>
            📝 分步导入说明
          </p>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '13px', color: '#4a5568' }}>
            <li style={{ marginBottom: '4px' }}>
              第一步：上传并验证 Excel 文件，确保数据格式正确
            </li>
            <li style={{ marginBottom: '4px' }}>
              第二步：上传产品图片（可选），文件名应与 Excel 中的图片列值对应
            </li>
            <li>
              这种方式更安全，数据错误会在导入前被检测出来
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
