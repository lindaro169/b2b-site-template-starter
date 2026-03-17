# 组件清单

## 全局布局组件

| 组件 | 路径 | 说明 |
|---|---|---|
| `LayoutWrapper` | `src/components/LayoutWrapper.tsx` | 包裹页头、页脚与主体内容 |
| `HeaderJewelry` | `src/components/HeaderJewelry.jsx` | 前台页头 |
| `FooterJewelry` | `src/components/FooterJewelry.jsx` | 前台页脚 |
| `AdminLayout` | `src/components/AdminLayout.tsx` | 后台侧边栏与内容布局 |

## 首页相关组件

| 组件 | 路径 | 说明 |
|---|---|---|
| `HeroJewelry` | `src/components/jewelry/HeroJewelry.jsx` | 首页首屏与模板提示 |
| `FeaturedProducts` | `src/components/jewelry/FeaturedProducts.jsx` | 首页精选产品 |
| `ProductCategories` | `src/components/jewelry/ProductCategories.jsx` | 首页分类卡片 |
| `WhyChooseUs` | `src/components/jewelry/WhyChooseUs.jsx` | 首页统计与评价 |
| `HomepageFAQ` | `src/components/jewelry/HomepageFAQ.jsx` | 首页问答 |
| `CTABanner` | `src/components/jewelry/CTABanner.jsx` | 首页底部引导区 |

## 目录与详情组件

| 组件 | 路径 | 说明 |
|---|---|---|
| `CategoryCard` | `src/components/CategoryCard.jsx` | 分类卡片 |
| `ProductCardB2B` | `src/components/ProductCardB2B.jsx` | 产品卡片 |
| `ProductImageGallery` | `src/app/product/[slug]/ProductImageGallery.jsx` | 产品图片画廊 |
| `ProductDetailClient` | `src/app/product/[slug]/ProductDetailClient.jsx` | 产品详情主体 |
| `QuickInquiryModal` | `src/components/QuickInquiryModal.jsx` | 快速询盘弹层 |

## 内容与表单组件

| 组件 | 路径 | 说明 |
|---|---|---|
| `FAQAccordion` | `src/components/FAQAccordion.jsx` | 折叠问答 |
| `ServiceCard` | `src/components/ServiceCard.jsx` | 服务卡片 |
| `TestimonialCard` | `src/components/TestimonialCard.jsx` | 评价卡片 |
| `TurnstileWidget` | `src/components/TurnstileWidget.tsx` | 人机验证组件 |
| `TemplateCopyBadge` | `src/components/TemplateCopyBadge.jsx` | 模板占位文案提示 |

## 后台组件

| 组件 | 路径 | 说明 |
|---|---|---|
| `LoginForm` | `src/components/admin/LoginForm.tsx` | 后台登录表单 |
| `RegisterForm` | `src/components/admin/RegisterForm.tsx` | 后台注册表单 |
| `ImageUpload` | `src/components/ImageUpload.tsx` | 图片上传 |
| `RichEditor` | `src/components/RichEditor.tsx` | 富文本编辑器 |

## 占位资源相关约束

- 对用户可见的主要页面应继续显示模板占位提示
- 新增展示组件时，默认优先使用占位图片与占位文案
- 若引入真实品牌资源，应在发布前统一替换而不是混用
