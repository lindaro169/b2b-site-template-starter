'use client'

import { useState, useRef, useEffect } from 'react'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [turnstileReady, setTurnstileReady] = useState(false)
  const turnstileRef = useRef<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 加载 Turnstile 脚本
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY

    if (!siteKey) {
      console.warn('⚠️ Turnstile site key not configured')
      setTurnstileReady(true) // 允许表单继续工作，但不需要验证
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
            '#turnstile-container-contact',
            {
              sitekey: siteKey,
              theme: 'light',
              size: 'normal',
            }
          )
          setTurnstileReady(true)
          console.log('✅ Turnstile loaded for contact form')
        } catch (err) {
          console.error('❌ 加载 Turnstile 失败:', err)
          setError('安全验证加载失败, 请刷新页面')
        }
      }
    }

    script.onerror = () => {
      console.error('❌ Failed to load Turnstile script')
      setTurnstileReady(true) // 允许继续，但无验证
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      // 前端验证
      if (!formData.name || !formData.email || !formData.message) {
        setError('请填写所有必填字段')
        setLoading(false)
        return
      }

      // 验证邮箱
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('邮箱格式不正确')
        setLoading(false)
        return
      }

      // 获取 Turnstile 令牌
      if (!turnstileRef.current) {
        setError('验证未就绪, 请刷新页面')
        setLoading(false)
        return
      }

      const turnstileToken = window.turnstile.getResponse(turnstileRef.current)
      if (!turnstileToken) {
        setError('请完成安全验证')
        setLoading(false)
        return
      }

      // 提交表单
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          turnstile_token: turnstileToken,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '提交失败')
      }

      setSuccess(true)
      setFormData({ name: '', email: '', phone: '', message: '' })

      // 重置 Turnstile
      if (turnstileRef.current) {
        window.turnstile.reset(turnstileRef.current)
      }

      // 3 秒后隐藏成功提示
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生错误, 请稍后重试')

      // 重置 Turnstile 以便重试
      if (turnstileRef.current) {
        window.turnstile.reset(turnstileRef.current)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 py-8 px-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">联系我们</h1>
        <p className="text-gray-600">
          有任何问题或需要咨询? 请填写下方表单, 我们会尽快回复您
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 姓名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            姓名 <span className="text-red-500">*</span>
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

        {/* 邮箱 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            邮箱 <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            placeholder="your@email.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* 电话 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          电话 (可选)
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          disabled={loading}
          placeholder="+86 138-xxxx-xxxx"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100"
        />
      </div>

      {/* 消息 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          消息 <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          disabled={loading}
          rows={6}
          placeholder="请输入您的消息..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100"
        />
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          ❌ {error}
        </div>
      )}

      {/* 成功提示 */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          ✓ 消息已发送! 我们会尽快联系您。
        </div>
      )}

      {/* Turnstile Widget */}
      <div className="flex justify-center">
        <div id="turnstile-container-contact" ref={containerRef} className="w-full" />
      </div>

      {/* 按钮 */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading || !turnstileReady}
          className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '发送中...' : '发送'}
        </button>
        <button
          type="reset"
          disabled={loading}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={() => {
            setFormData({ name: '', email: '', phone: '', message: '' })
            setError('')
            setSuccess(false)
          }}
        >
          清空
        </button>
      </div>
    </form>
  )
}
