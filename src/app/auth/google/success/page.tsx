'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Prevent static generation for this page
export const dynamic = 'force-dynamic';

function GoogleAuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');

    if (errorParam) {
      const errorMsg = decodeURIComponent(errorParam);
      setError(errorMsg);
      return;
    }

    router.replace('/admin/dashboard');
  }, [searchParams, router]);

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px',
      }}>
        <div style={{
          padding: '40px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: '500px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px',
          }}>❌</div>
          <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>登录失败</h2>
          <div style={{
            backgroundColor: '#fff3f3',
            border: '1px solid #fcc',
            borderRadius: '6px',
            padding: '15px',
            marginBottom: '20px',
            color: '#c33',
            fontSize: '14px',
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            maxHeight: '200px',
            overflowY: 'auto',
          }}>
            <strong>错误信息：</strong>
            <div style={{ marginTop: '10px' }}>{error}</div>
          </div>
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
          }}>
            <p style={{ margin: '5px 0' }}>请记录以上错误信息，以便诊断问题。</p>
            <p style={{ margin: '5px 0' }}>常见问题：</p>
            <ul style={{ textAlign: 'left', margin: '5px 0', paddingLeft: '20px' }}>
              <li>Google 客户端 ID 配置错误</li>
              <li>Redirect URI 不匹配</li>
              <li>后端无法连接到 Google API</li>
              <li>数据库连接失败</li>
            </ul>
          </div>
          <button
            onClick={() => router.push('/login')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff';
            }}
          >
            返回登录页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h2>✅ 登录成功</h2>
        <p>正在跳转到后台...</p>
        <div style={{
          marginTop: '20px',
          fontSize: '12px',
          color: '#999',
        }}>
          正在重定向...
        </div>
      </div>
    </div>
  );
}

export default function GoogleAuthSuccess() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <h2>Loading...</h2>
        </div>
      </div>
    }>
      <GoogleAuthSuccessContent />
    </Suspense>
  );
}
