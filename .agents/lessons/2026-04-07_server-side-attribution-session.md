问题：前端直接提交 tracking JSON，会把归因字段结构和采集逻辑暴露给浏览器端。
原因：询盘链路把来源识别、访问路径和广告点击 ID 的拼装放在前端完成。
解决方式：改成服务端 attribution session，前端只上报最小 path，表单提交只交业务字段，后端按 httpOnly cookie 取回 tracking 快照后再落库、发邮件和生成 Ads feed。
