'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { siteConfig } from '@/lib/site-config'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [turnstileReady, setTurnstileReady] = useState(false)
  const turnstileRef = useRef<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // 加载 Turnstile 脚本
  useEffect(() => {
    if (siteConfig.templateMode) {
      setTurnstileReady(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    script.onload = () => {
      if (containerRef.current && window.turnstile) {
        try {
          turnstileRef.current = window.turnstile.render(
            '#turnstile-container',
            {
              sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
              theme: 'light',
              size: 'normal',
              callback: () => {
                console.log('Turnstile 验证成功')
              },
              'error-callback': () => {
                setError('验证失败, 请刷新页面后重试')
                console.error('Turnstile 验证出错')
              },
              'expired-callback': () => {
                console.log('Turnstile 令牌已过期')
                if (turnstileRef.current) {
                  window.turnstile.reset(turnstileRef.current)
                }
              },
            }
          )
          setTurnstileReady(true)
        } catch (err) {
          console.error('加载 Turnstile 失败:', err)
          setError('安全验证加载失败, 请刷新页面')
        }
      }
    }
    document.body.appendChild(script)

    return () => {
      if (turnstileRef.current && window.turnstile) {
        try {
          window.turnstile.remove(turnstileRef.current)
        } catch {
          console.error('清理 Turnstile 失败')
        }
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (siteConfig.templateMode) {
        setError('模板模式下已禁用真实后台登录')
        setLoading(false)
        return
      }

      // 前端验证
      if (!email || !password) {
        setError('邮箱和密码不能为空')
        setLoading(false)
        return
      }

      // 获取 Turnstile 令牌
      if (!turnstileRef.current) {
        setError('验证未就绪, 请稍后重试')
        setLoading(false)
        return
      }

      const turnstileToken = window.turnstile.getResponse(turnstileRef.current)
      if (!turnstileToken) {
        setError('请完成安全验证')
        setLoading(false)
        return
      }

      // 发送登录请求
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          turnstile_token: turnstileToken,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || '登录失败, 请检查邮箱和密码')

        // 重置 Turnstile 以便重试
        if (turnstileRef.current) {
          window.turnstile.reset(turnstileRef.current)
        }
        return
      }

      const data = await response.json()

      // 保存令牌
      localStorage.setItem('adminToken', data.token)

      // 重定向到仪表板
      router.push('/admin/dashboard')
    } catch (err) {
      console.error('登录错误:', err)
      setError('登录过程中出错, 请稍后重试')

      // 重置 Turnstile
      if (turnstileRef.current) {
        window.turnstile.reset(turnstileRef.current)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full space-y-6"
      >
        {/* 标题 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Template Catalog</h1>
          <p className="text-sm text-gray-500">模板后台管理系统</p>
        </div>

        {/* 邮箱输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            邮箱地址
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            placeholder="user@company.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100"
          />
        </div>

        {/* 密码输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100"
          />
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            ❌ {error}
          </div>
        )}

        {/* Turnstile Widget */}
        <div className="flex justify-center">
          {siteConfig.templateMode ? (
            <div className="w-full rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-center text-sm text-stone-500">
              模板模式下不加载真实 Turnstile 配置。
            </div>
          ) : (
            <div ref={containerRef} className="w-full" />
          )}
        </div>

        {/* 登录按钮 */}
        <button
          type="submit"
          disabled={siteConfig.templateMode || loading || !turnstileReady}
          className="w-full py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {siteConfig.templateMode ? '模板模式下已禁用' : loading ? '登录中...' : '登录'}
        </button>

        {/* 链接 */}
        <div className="space-y-2 text-center text-sm">
          <div>
            <span className="text-gray-600">还没账户? </span>
            <Link href="/admin/register" className="text-purple-600 hover:underline">
              立即注册
            </Link>
          </div>
          <div>
            <Link href="/admin/forgot-password" className="text-purple-600 hover:underline">
              忘记密码?
            </Link>
          </div>
        </div>

        {/* Demo 凭证提示 */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
          <p className="font-semibold mb-1">📝 模板凭证示例:</p>
          <p>邮箱: admin@template-site-placeholder.example</p>
          <p>密码: ReplaceBeforeLaunch123!</p>
        </div>
      </form>
    </div>
  )
}
