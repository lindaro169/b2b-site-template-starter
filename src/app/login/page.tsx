'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import Turnstile from 'react-turnstile';
import { siteConfig } from '@/lib/site-config';
import styles from './login.module.css';

export default function LoginPage() {
  const isLocalTemplatePreview = siteConfig.localPreviewMode;
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0); // For resetting Turnstile

  const handleGoogleLogin = async () => {
    if (isLocalTemplatePreview) {
      setError('本地模板预览模式下已禁用真实后台登录，请在发布前接入正式认证配置。');
      return;
    }

    if (!turnstileToken) {
      setError('请先完成人机验证');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/admin/dashboard',
      }, {
        onError: (ctx) => {
          setError(ctx.error.message || '登录失败，请重试');
          setLoading(false);
          setTurnstileKey(prev => prev + 1);
          setTurnstileToken(null);
        },
      });
    } catch (err) {
      setError('登录失败，请重试');
      setLoading(false);
      setTurnstileKey(prev => prev + 1);
      setTurnstileToken(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1>✨ 后台登录</h1>
        <p className={styles.subtitle}>管理系统</p>

        {error && (
          <div
            style={{
              background: '#fee',
              color: '#c33',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              border: '1px solid #fcc',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div className={styles.form}>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            使用您的 Google 账号登录
          </p>

          {/* Turnstile Widget */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            {isLocalTemplatePreview ? (
              <div
                style={{
                  width: '100%',
                  border: '1px dashed #d6d3d1',
                  background: '#f5f5f4',
                  borderRadius: '10px',
                  padding: '0.9rem 1rem',
                  textAlign: 'center',
                  color: '#57534e',
                  fontSize: '0.875rem',
                }}
              >
                本地模板预览模式下不加载真实 Turnstile 或 Google 登录配置。
              </div>
            ) : (
              <Turnstile
                key={turnstileKey}
                sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || ''}
                onVerify={(token) => {
                  setTurnstileToken(token);
                  setError('');
                }}
                onError={() => {
                  setError('人机验证失败，请刷新页面重试');
                  setTurnstileToken(null);
                }}
                onExpire={() => {
                  setTurnstileToken(null);
                }}
                theme="light"
              />
            )}
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLocalTemplatePreview || loading || !turnstileToken}
            className={styles.button}
            style={{
              opacity: (isLocalTemplatePreview || loading || !turnstileToken) ? 0.6 : 1,
              cursor: (isLocalTemplatePreview || loading || !turnstileToken) ? 'not-allowed' : 'pointer',
              background: '#fff',
              color: '#333',
              border: '1px solid #ddd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
              <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853" />
              <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335" />
            </svg>
            {isLocalTemplatePreview ? '本地预览中已禁用' : loading ? '登录中...' : '使用 Google 账号登录'}
          </button>

          <p style={{
            fontSize: '0.75rem',
            color: '#999',
            textAlign: 'center',
            marginTop: '1.5rem',
            lineHeight: '1.5'
          }}>
            仅限授权管理员访问
          </p>
        </div>
      </div>
    </div>
  );
}
