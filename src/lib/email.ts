/**
 * Resend 邮件服务集成
 *
 * 提供邮件发送功能，包括：
 * - 账户验证邮件
 * - 密码重置邮件
 * - 邮件订阅
 * - 联系表单确认
 * - 管理员通知
 *
 * Resend API: https://resend.com/docs
 * 免费额度：3000 封/月
 */

import {
  buildTrackingSummary,
  type RequestGeoInfo,
  type VisitorTrackingSnapshot,
} from '@/lib/visitor-tracking';
import { siteConfig } from '@/lib/site-config';

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || siteConfig.contactEmail;
const ADMIN_EMAIL =
  process.env.SALES_NOTIFICATION_EMAIL ||
  process.env.ADMIN_EMAIL ||
  siteConfig.contactEmail;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMultilineHtml(value: string): string {
  return escapeHtml(value).replace(/\n/g, '<br />');
}

function renderTrackingDetails(
  tracking: VisitorTrackingSnapshot | null | undefined,
  geo?: RequestGeoInfo | null
): { html: string; text: string } {
  const summary = buildTrackingSummary(tracking, geo);
  const items = [
    ['客户位置（IP推断）', summary.location],
    ['访问来源', summary.source],
    ['访客类型', summary.visitor],
    ['着陆页', summary.landingPage],
    ['访问路径', summary.visitPath],
    ['总停留', summary.totalDuration],
    ['会话标识', summary.session],
  ];

  if (summary.adKeyword) {
    items.push(['关键词/后缀', summary.adKeyword]);
  }

  if (summary.referrer) {
    items.push(['Referrer', summary.referrer]);
  }

  if (summary.tags.length > 0) {
    items.push(['追踪参数', summary.tags.join(', ')]);
  }

  const html = `
    <div style="margin-top: 24px; padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h3 style="margin: 0 0 16px; font-size: 18px; color: #111827;">访客追踪摘要</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${items
          .map(
            ([label, value]) => `
              <tr>
                <td style="padding: 6px 0; vertical-align: top; width: 112px; color: #6b7280; font-weight: 600;">${escapeHtml(label)}</td>
                <td style="padding: 6px 0; color: #111827;">${formatMultilineHtml(value)}</td>
              </tr>
            `
          )
          .join('')}
      </table>
    </div>
  `;

  const text = items.map(([label, value]) => `${label}: ${value}`).join('\n');
  return { html, text };
}

/**
 * 发送邮件
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY 未配置，邮件发送已禁用');
    return {
      success: false,
      error: 'Resend API 未配置',
    };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
        cc: options.cc,
        bcc: options.bcc,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      return {
        success: false,
        error: error.message || '邮件发送失败',
      };
    }

    const data = await response.json();
    return {
      success: true,
      id: data.id,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '邮件发送出错',
    };
  }
}

/**
 * 邮箱验证邮件模板
 */
export function getEmailVerificationTemplate(
  email: string,
  verificationLink: string,
  userName?: string
): EmailTemplate {
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="ltr" lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif; background-color: #f3f3f5; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
          .content { color: #333; line-height: 1.6; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">✨ ${siteConfig.brandName}</div>
          </div>
          <div class="content">
            <p>尊敬的 ${userName || '管理员'}，</p>
            <p>感谢您注册 ${siteConfig.brandName} 模板后台！</p>
            <p>请点击下方按钮验证您的邮箱地址，以激活您的账户：</p>
            <a href="${verificationLink}" class="button">验证邮箱</a>
            <p style="color: #666; font-size: 12px;">或者复制以下链接到浏览器：<br />${verificationLink}</p>
            <p>此链接将在 24 小时后失效。</p>
            <p>如果您没有创建此账户，请忽略此邮件。</p>
          </div>
          <div class="footer">
            <p>${siteConfig.brandName} © 2025</p>
            <p>这是一封自动发送的邮件，请勿直接回复</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
${siteConfig.brandName} 邮箱验证

尊敬的 ${userName || '管理员'}，

感谢您注册 ${siteConfig.brandName} 模板后台！

请访问以下链接验证您的邮箱地址：
${verificationLink}

此链接将在 24 小时后失效。

如果您没有创建此账户，请忽略此邮件。
  `.trim();

  return {
    subject: `${siteConfig.brandName} - 邮箱验证`,
    html: htmlContent,
    text: textContent,
  };
}

/**
 * 密码重置邮件模板
 */
export function getPasswordResetTemplate(
  resetLink: string,
  userName?: string
): EmailTemplate {
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="ltr" lang="en">
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background-color: #f3f3f5; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
          .content { color: #333; line-height: 1.6; }
          .button { display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .alert { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔐 ${siteConfig.brandName}</div>
          </div>
          <div class="content">
            <p>尊敬的 ${userName || '管理员'}，</p>
            <p>我们收到了您的密码重置请求。</p>
            <a href="${resetLink}" class="button">重置密码</a>
            <div class="alert">
              <strong>⚠️ 安全提示：</strong> 此链接将在 1 小时后失效。如果您没有请求重置密码，请立即忽略此邮件。
            </div>
            <p>如有任何问题，请联系我们的支持团队。</p>
          </div>
          <div class="footer">
            <p>${siteConfig.brandName} © 2025</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return {
    subject: `${siteConfig.brandName} - 密码重置`,
    html: htmlContent,
  };
}

/**
 * 联系表单确认邮件（发送给用户）
 */
export function getContactConfirmationTemplate(
  userName: string,
  message: string
): EmailTemplate {
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="ltr" lang="en">
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background-color: #f3f3f5; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
          .content { color: #333; line-height: 1.6; }
          .message-box { background-color: #f3f4f6; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">✨ ${siteConfig.brandName}</div>
          </div>
          <div class="content">
            <p>尊敬的 ${userName},</p>
            <p>感谢您联系 ${siteConfig.brandName}！我们已成功收到您的消息。</p>
            <div class="message-box">
              <strong>您的消息：</strong><br />
              ${message.replace(/\n/g, '<br />')}
            </div>
            <p>我们的团队会在 24 小时内审阅您的消息，并会尽快与您联系。</p>
            <p>如有紧急事项，请直接拨打我们的客服电话。</p>
            <p>感谢您的耐心等待！</p>
          </div>
          <div class="footer">
            <p>${siteConfig.brandName} © 2025</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return {
    subject: `我们已收到您的消息 - ${siteConfig.brandName}`,
    html: htmlContent,
  };
}

/**
 * 管理员通知邮件（发送给管理员）
 */
export function getAdminNotificationTemplate(
  contactName: string,
  contactEmail: string,
  message: string,
  phone?: string
): EmailTemplate {
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="ltr" lang="en">
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background-color: #f3f3f5; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; background-color: #2563eb; color: white; padding: 20px; border-radius: 8px; }
          .content { color: #333; line-height: 1.6; }
          .info-box { background-color: #f3f4f6; padding: 15px; margin: 15px 0; border-radius: 4px; }
          .info-row { margin: 8px 0; }
          .label { font-weight: bold; color: #2563eb; }
          .message-content { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 4px; white-space: pre-wrap; }
          .action-btn { display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📬 新的联系表单提交</h2>
          </div>
          <div class="content">
            <p>您收到了一条来自网站访问者的新消息：</p>
            <div class="info-box">
              <div class="info-row"><span class="label">姓名：</span> ${contactName}</div>
              <div class="info-row"><span class="label">邮箱：</span> <a href="mailto:${contactEmail}">${contactEmail}</a></div>
              ${phone ? `<div class="info-row"><span class="label">电话：</span> ${phone}</div>` : ''}
            </div>
            <div class="message-content">
              <strong>消息内容：</strong><br />
              ${message}
            </div>
            <p>
              <a href="${siteConfig.websiteUrl}/admin/contacts" class="action-btn">查看所有消息</a>
            </p>
            <p style="color: #666; font-size: 12px;">
              这是一条自动生成的通知邮件。请不要直接回复此邮件。<br />
              请直接回复联系者的邮箱地址。
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return {
    subject: `新的联系表单提交 - ${contactName}`,
    html: htmlContent,
  };
}

/**
 * 注册欢迎邮件
 */
export function getWelcomeEmailTemplate(userName: string): EmailTemplate {
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="ltr" lang="en">
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background-color: #f3f3f5; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
          .content { color: #333; line-height: 1.6; }
          .feature-box { background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 15px 0; border-radius: 4px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎉 欢迎加入 ${siteConfig.brandName}</div>
          </div>
          <div class="content">
            <p>尊敬的 ${userName}，</p>
            <p>欢迎加入 ${siteConfig.brandName} 模板后台！🌟</p>
            <p>您的账户已成功创建。以下是一些快速入门提示：</p>
            <div class="feature-box">
              <strong>📦 产品管理</strong><br />
              添加、编辑和管理您的产品目录，上传产品图片和详细信息。
            </div>
            <div class="feature-box">
              <strong>📰 博客管理</strong><br />
              发布行业资讯和产品介绍，使用强大的富文本编辑器。
            </div>
            <div class="feature-box">
              <strong>📊 数据统计</strong><br />
              查看详细的产品和内容统计数据，了解您的业务概况。
            </div>
            <a href="${siteConfig.websiteUrl}/admin/dashboard" class="button">进入后台</a>
            <p>如有任何问题，欢迎联系我们的支持团队。</p>
          </div>
          <div class="footer">
            <p>${siteConfig.brandName} © 2025</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return {
    subject: `欢迎加入 ${siteConfig.brandName}`,
    html: htmlContent,
  };
}

/**
 * 便利函数：发送验证邮件
 */
export async function sendVerificationEmail(
  email: string,
  verificationLink: string,
  userName?: string
): Promise<EmailResult> {
  const template = getEmailVerificationTemplate(email, verificationLink, userName);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * 便利函数：发送联系确认邮件
 */
export async function sendContactConfirmation(
  email: string,
  name: string,
  message: string
): Promise<EmailResult> {
  const template = getContactConfirmationTemplate(name, message);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  });
}

/**
 * 便利函数：发送管理员通知
 */
export async function sendAdminNotification(
  contactName: string,
  contactEmail: string,
  message: string,
  phone?: string
): Promise<EmailResult> {
  const template = getAdminNotificationTemplate(contactName, contactEmail, message, phone);
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: template.subject,
    html: template.html,
  });
}

export interface ContactNotificationPayload {
  name: string;
  email: string;
  message: string;
  phone?: string;
  tracking?: VisitorTrackingSnapshot | null;
  geo?: RequestGeoInfo | null;
}

export interface InquiryNotificationPayload {
  name: string;
  email: string;
  message: string;
  phone?: string;
  company?: string;
  quantity?: string;
  productName?: string;
  productId?: number | string;
  tracking?: VisitorTrackingSnapshot | null;
  geo?: RequestGeoInfo | null;
}

export function getTrackedContactNotificationTemplate(
  payload: ContactNotificationPayload
): EmailTemplate {
  const trackingBlock = renderTrackingDetails(payload.tracking, payload.geo);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background-color: #f5f5f4; padding: 24px; color: #1f2937; }
          .container { max-width: 720px; margin: 0 auto; background-color: white; border-radius: 14px; padding: 32px; border: 1px solid #e7e5e4; }
          .header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e7e5e4; }
          .title { margin: 0; font-size: 26px; color: #1c1917; }
          .sub { margin-top: 8px; color: #78716c; }
          .card { background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 10px; padding: 18px; margin-top: 20px; }
          .label { color: #78716c; font-weight: 600; width: 110px; }
          .message { white-space: pre-wrap; line-height: 1.7; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 6px 0; vertical-align: top; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">新的 Contact Us 询盘</h1>
            <p class="sub">网站联系表单已收到一条新的访客消息。</p>
          </div>
          <div class="card">
            <table>
              <tr><td class="label">姓名</td><td>${escapeHtml(payload.name)}</td></tr>
              <tr><td class="label">邮箱</td><td><a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></td></tr>
              ${payload.phone ? `<tr><td class="label">电话</td><td>${escapeHtml(payload.phone)}</td></tr>` : ''}
            </table>
          </div>
          <div class="card">
            <strong>客户留言</strong>
            <div class="message" style="margin-top: 12px;">${formatMultilineHtml(payload.message)}</div>
          </div>
          ${trackingBlock.html}
        </div>
      </body>
    </html>
  `;

  const textContent = [
    '新的 Contact Us 询盘',
    `姓名: ${payload.name}`,
    `邮箱: ${payload.email}`,
    payload.phone ? `电话: ${payload.phone}` : undefined,
    '',
    '客户留言:',
    payload.message,
    '',
    '访客追踪摘要:',
    trackingBlock.text,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    subject: `新联系表单询盘 - ${payload.name}`,
    html: htmlContent,
    text: textContent,
  };
}

export function getTrackedInquiryNotificationTemplate(
  payload: InquiryNotificationPayload
): EmailTemplate {
  const trackingBlock = renderTrackingDetails(payload.tracking, payload.geo);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background-color: #f5f5f4; padding: 24px; color: #1f2937; }
          .container { max-width: 720px; margin: 0 auto; background-color: white; border-radius: 14px; padding: 32px; border: 1px solid #e7e5e4; }
          .header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e7e5e4; }
          .title { margin: 0; font-size: 26px; color: #1c1917; }
          .sub { margin-top: 8px; color: #78716c; }
          .card { background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 10px; padding: 18px; margin-top: 20px; }
          .message { white-space: pre-wrap; line-height: 1.7; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 6px 0; vertical-align: top; }
          .label { color: #78716c; font-weight: 600; width: 110px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">新的产品询盘</h1>
            <p class="sub">网站快速询盘表单收到一条新的采购意向。</p>
          </div>
          <div class="card">
            <table>
              <tr><td class="label">产品</td><td>${escapeHtml(payload.productName || 'Unknown Product')}</td></tr>
              ${payload.productId ? `<tr><td class="label">Product ID</td><td>${escapeHtml(String(payload.productId))}</td></tr>` : ''}
              ${payload.quantity ? `<tr><td class="label">数量</td><td>${escapeHtml(payload.quantity)}</td></tr>` : ''}
              <tr><td class="label">姓名</td><td>${escapeHtml(payload.name)}</td></tr>
              <tr><td class="label">邮箱</td><td><a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></td></tr>
              ${payload.phone ? `<tr><td class="label">电话</td><td>${escapeHtml(payload.phone)}</td></tr>` : ''}
              ${payload.company ? `<tr><td class="label">公司</td><td>${escapeHtml(payload.company)}</td></tr>` : ''}
            </table>
          </div>
          <div class="card">
            <strong>客户留言</strong>
            <div class="message" style="margin-top: 12px;">${formatMultilineHtml(payload.message)}</div>
          </div>
          ${trackingBlock.html}
        </div>
      </body>
    </html>
  `;

  const textContent = [
    '新的产品询盘',
    `产品: ${payload.productName || 'Unknown Product'}`,
    payload.productId ? `Product ID: ${payload.productId}` : undefined,
    payload.quantity ? `数量: ${payload.quantity}` : undefined,
    `姓名: ${payload.name}`,
    `邮箱: ${payload.email}`,
    payload.phone ? `电话: ${payload.phone}` : undefined,
    payload.company ? `公司: ${payload.company}` : undefined,
    '',
    '客户留言:',
    payload.message,
    '',
    '访客追踪摘要:',
    trackingBlock.text,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    subject: `新产品询盘 - ${payload.productName || payload.name}`,
    html: htmlContent,
    text: textContent,
  };
}

export async function sendTrackedContactNotification(
  payload: ContactNotificationPayload
): Promise<EmailResult> {
  const template = getTrackedContactNotificationTemplate(payload);

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: template.subject,
    html: template.html,
    text: template.text,
    replyTo: payload.email,
  });
}

export async function sendTrackedInquiryNotification(
  payload: InquiryNotificationPayload
): Promise<EmailResult> {
  const template = getTrackedInquiryNotificationTemplate(payload);

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: template.subject,
    html: template.html,
    text: template.text,
    replyTo: payload.email,
  });
}

/**
 * 便利函数：发送欢迎邮件
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<EmailResult> {
  const template = getWelcomeEmailTemplate(name);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  });
}
