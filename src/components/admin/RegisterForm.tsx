'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { siteConfig } from '@/lib/site-config'

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [turnstileReady, setTurnstileReady] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
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
            '#turnstile-container-register',
            {
              sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
              theme: 'light',
              size: 'normal',
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

  // 检查密码强度
  const checkPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[!@#$%^&*]/.test(password)) strength++
    setPasswordStrength(strength)
    return strength
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === 'password') {
      checkPasswordStrength(value)
    }
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.passwordConfirm) {
      setError('请填写所有必填字段')
      return false
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('邮箱格式不正确')
      return false
    }

    // 验证密码强度
    if (formData.password.length < 8) {
      setError('密码至少需要 8 个字符')
      return false
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError('密码必须包含至少一个大写字母')
      return false
    }
    if (!/[a-z]/.test(formData.password)) {
      setError('密码必须包含至少一个小写字母')
      return false
    }
    if (!/[0-9]/.test(formData.password)) {
      setError('密码必须包含至少一个数字')
      return false
    }
    if (!/[!@#$%^&*]/.test(formData.password)) {
      setError('密码必须包含至少一个特殊字符 (!@#$%^&*)')
      return false
    }

    // 验证密码匹配
    if (formData.password !== formData.passwordConfirm) {
      setError('两次输入的密码不一致')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      if (siteConfig.templateMode) {
        setError('模板模式下已禁用真实后台注册')
        setLoading(false)
        return
      }

      // 前端验证
      if (!validateForm()) {
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

      // 发送注册请求
      const response = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          passwordConfirm: formData.passwordConfirm,
          name: formData.name,
          turnstile_token: turnstileToken,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || '注册失败, 请稍后重试')

        // 重置 Turnstile 以便重试
        if (turnstileRef.current) {
          window.turnstile.reset(turnstileRef.current)
        }
        return
      }

      setSuccess(true)
      setFormData({
        email: '',
        password: '',
        passwordConfirm: '',
        name: '',
      })

      // 3 秒后重定向到登录页
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err) {
      console.error('注册错误:', err)
      setError('注册过程中出错, 请稍后重试')

      // 重置 Turnstile
      if (turnstileRef.current) {
        window.turnstile.reset(turnstileRef.current)
      }
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return { text: '弱', color: 'text-red-600', bgColor: 'bg-red-200' }
      case 2:
      case 3:
        return { text: '中', color: 'text-yellow-600', bgColor: 'bg-yellow-200' }
      case 4:
      case 5:
        return { text: '强', color: 'text-green-600', bgColor: 'bg-green-200' }
      default:
        return { text: '', color: '', bgColor: '' }
    }
  }

  const strength = getPasswordStrengthText()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full space-y-6"
      >
        {/* 标题 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">注册账户</h1>
          <p className="text-sm text-gray-500">Template Catalog 模板后台管理系统</p>
        </div>

        {/* 邮箱输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            邮箱地址 <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            placeholder="user@company.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100"
          />
        </div>

        {/* 姓名输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            姓名 (可选)
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            placeholder="您的姓名"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100"
          />
        </div>

        {/* 密码输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            密码 <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            placeholder="至少 8 个字符"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100"
          />

          {/* 密码强度指示器 */}
          {formData.password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded ${
                      i < passwordStrength ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              {strength.text && (
                <p className={`text-xs ${strength.color}`}>
                  密码强度: {strength.text}
                </p>
              )}
            </div>
          )}

          {/* 密码要求 */}
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <p>密码必须包含:</p>
            <ul className="list-disc list-inside">
              <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                至少 8 个字符
              </li>
              <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                大写字母 (A-Z)
              </li>
              <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                小写字母 (a-z)
              </li>
              <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                数字 (0-9)
              </li>
              <li className={/[!@#$%^&*]/.test(formData.password) ? 'text-green-600' : ''}>
                特殊字符 (!@#$%^&*)
              </li>
            </ul>
          </div>
        </div>

        {/* 确认密码输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            确认密码 <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            disabled={loading}
            placeholder="再输一遍密码"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100"
          />
          {formData.passwordConfirm && formData.password !== formData.passwordConfirm && (
            <p className="mt-1 text-xs text-red-600">密码不一致</p>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            ❌ {error}
          </div>
        )}

        {/* 成功提示 */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            ✓ 注册成功! 正在重定向到登录页...
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

        {/* 注册按钮 */}
        <button
          type="submit"
          disabled={siteConfig.templateMode || loading || !turnstileReady}
          className="w-full py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {siteConfig.templateMode ? '模板模式下已禁用' : loading ? '注册中...' : '注册'}
        </button>

        {/* 登录链接 */}
        <div className="text-center text-sm text-gray-600">
          已有账户?{' '}
          <Link href="/login" className="text-purple-600 hover:underline">
            立即登录
          </Link>
        </div>
      </form>
    </div>
  )
}
