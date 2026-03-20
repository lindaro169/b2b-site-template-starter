/**
 * Author Management Utilities
 *
 * 独立的作者管理系统
 * - 作者数据与文章解耦
 * - 支持完整的 CRUD 操作
 * - 支持图片上传头像
 */

import { siteConfig } from './site-config';

/**
 * 作者完整数据（带 ID）
 */
export interface AuthorProfile {
  id: number;
  name: string;
  avatar?: string;
  bio?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建/编辑作者的数据
 */
export interface AuthorData {
  name: string;
  avatar?: string;
  bio?: string;
  email?: string;
}

/**
 * Mock 作者数据库
 */
const mockAuthors = new Map<number, AuthorProfile>();

let nextAuthorId = 1;

/**
 * 初始化示例作者
 */
export async function initializeSampleAuthors() {
  if (mockAuthors.size > 0) {
    return;
  }

  const samples: AuthorData[] = [
    {
      name: "模板编辑甲",
      avatar: siteConfig.logoPath,
      bio: "模板作者资料，仅用于演示后台作者管理与文章关联流程。",
      email: "editor-a@template-site-placeholder.example",
    },
    {
      name: "模板编辑乙",
      avatar: siteConfig.logoPath,
      bio: "占位作者信息，请在发布前替换为真实团队成员资料。",
      email: "editor-b@template-site-placeholder.example",
    },
    {
      name: "模板编辑丙",
      avatar: siteConfig.logoPath,
      bio: "演示用作者简介，用来展示头像、签名和文章归属等字段。",
      email: "editor-c@template-site-placeholder.example",
    },
    {
      name: "模板编辑丁",
      avatar: siteConfig.logoPath,
      bio: "后台样例作者，不代表真实团队、品牌或合作方信息。",
      email: "editor-d@template-site-placeholder.example",
    },
    {
      name: "模板编辑戊",
      avatar: siteConfig.logoPath,
      bio: "用于占位展示的作者档案，请按你的内容团队配置自行替换。",
      email: "editor-e@template-site-placeholder.example",
    },
  ];

  for (const sample of samples) {
    const author: AuthorProfile = {
      id: nextAuthorId++,
      ...sample,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockAuthors.set(author.id, author);
  }
}

/**
 * 获取所有作者
 */
export async function getAuthors(): Promise<{
  success: boolean;
  data?: AuthorProfile[];
  error?: string;
}> {
  try {
    const authors = Array.from(mockAuthors.values()).sort(
      (a, b) => a.id - b.id
    );
    return {
      success: true,
      data: authors,
    };
  } catch (error) {
    console.error("Error fetching authors:", error);
    return {
      success: false,
      error: "获取作者列表失败",
    };
  }
}

/**
 * 按 ID 获取作者
 */
export async function getAuthorById(id: number): Promise<{
  success: boolean;
  data?: AuthorProfile;
  error?: string;
}> {
  try {
    const author = mockAuthors.get(id);

    if (!author) {
      return {
        success: false,
        error: "作者不存在",
      };
    }

    return {
      success: true,
      data: author,
    };
  } catch (error) {
    console.error("Error fetching author:", error);
    return {
      success: false,
      error: "获取作者详情失败",
    };
  }
}

/**
 * 创建新作者
 */
export async function createAuthor(data: AuthorData): Promise<{
  success: boolean;
  data?: AuthorProfile;
  error?: string;
}> {
  try {
    // 验证必填字段
    if (!data.name || data.name.trim().length === 0) {
      return {
        success: false,
        error: "作者名字不能为空",
      };
    }

    // 检查邮箱重复
    if (data.email) {
      const exists = Array.from(mockAuthors.values()).some(
        (a) => a.email === data.email
      );
      if (exists) {
        return {
          success: false,
          error: "邮箱已存在",
        };
      }
    }

    const author: AuthorProfile = {
      id: nextAuthorId++,
      name: data.name.trim(),
      avatar: data.avatar,
      bio: data.bio,
      email: data.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockAuthors.set(author.id, author);

    return {
      success: true,
      data: author,
    };
  } catch (error) {
    console.error("Error creating author:", error);
    return {
      success: false,
      error: "创建作者失败",
    };
  }
}

/**
 * 更新作者
 */
export async function updateAuthor(
  id: number,
  data: Partial<AuthorData>
): Promise<{
  success: boolean;
  data?: AuthorProfile;
  error?: string;
}> {
  try {
    const author = mockAuthors.get(id);

    if (!author) {
      return {
        success: false,
        error: "作者不存在",
      };
    }

    // 检查邮箱重复（如果修改了邮箱）
    if (data.email && data.email !== author.email) {
      const exists = Array.from(mockAuthors.values()).some(
        (a) => a.id !== id && a.email === data.email
      );
      if (exists) {
        return {
          success: false,
          error: "邮箱已存在",
        };
      }
    }

    const updated: AuthorProfile = {
      ...author,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    mockAuthors.set(id, updated);

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("Error updating author:", error);
    return {
      success: false,
      error: "更新作者失败",
    };
  }
}

/**
 * 删除作者
 */
export async function deleteAuthor(id: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const author = mockAuthors.get(id);

    if (!author) {
      return {
        success: false,
        error: "作者不存在",
      };
    }

    mockAuthors.delete(id);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting author:", error);
    return {
      success: false,
      error: "删除作者失败",
    };
  }
}
