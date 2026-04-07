'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './import.module.css';
import ImportModeTabs from './components/ImportModeTabs';
import QuickImportMode from './components/QuickImportMode';
import StepImportMode from './components/StepImportMode';

type ImportMode = 'quick' | 'step';

export default function ProductImportPage() {
  const router = useRouter();
  const [importMode, setImportMode] = useState<ImportMode>('quick');

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/products/batch/template', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('下载模板失败');
      }

      // 获取 Blob 并下载
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product-import-template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('下载模板出错:', error);
      alert('下载模板失败，请重试');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>产品批量导入</h1>
        <div className={styles.headerActions}>
          <button
            className={styles.downloadBtn}
            onClick={handleDownloadTemplate}
            title="下载Excel模板进行填写"
          >
            📥 下载导入模板
          </button>
          <button
            className={styles.backBtn}
            onClick={() => router.back()}
            title="返回产品列表"
          >
            ← 返回
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <ImportModeTabs
          currentMode={importMode}
          onModeChange={setImportMode}
        />

        {importMode === 'quick' ? (
          <QuickImportMode />
        ) : (
          <StepImportMode />
        )}
      </div>
    </div>
  );
}
