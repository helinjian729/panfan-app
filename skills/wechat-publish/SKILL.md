---
name: wechat-publish
description: 将 Markdown 定稿文章通过 MCP 调用 Make.com 微信公众号发布 Scenario，自动完成发布。当用户说"发布到公众号"、"推送到微信"、"发布文章"、"发布公众号"时触发。
---

# WeChat Publish Skill

通过 Make.com MCP 完成微信公众号文章自动发布。

## 触发场景

- 用户说"发布到公众号"、"推送到微信"
- 用户说"发布文章"、"发布公众号"
- 用户完成文章写作并要求发布

## 输入

- 一篇 Markdown 格式的定稿文章（完整内容，非片段）
- 文章标题（如未提供，从内容中提取或使用"无标题文章"）

## 发布流程

### Step 1: 文章预处理

1. 验证 Markdown 内容非空
2. 提取标题（如 content 中包含 `#` 开头的标题行）
3. 清理可能影响发布的格式问题（检查图片 alt 文本、超链接有效性）
4. 生成纯文本摘要（如需要）

### Step 2: 调用 Make MCP Scenario

使用 `mcp__make__run_scenario` 工具，传入以下参数：

```
scenario_id: <微信公众号发布 Scenario ID>
input:
  - article_title: <文章标题>
  - article_content: <完整 Markdown 内容>
  - publish_mode: "immediate" | "draft"
```

### Step 3: 确认发布结果

1. 检查 MCP 返回结果中的 `run_id` 和状态
2. 告知用户发布状态（成功/失败/已存为草稿）
3. 如失败，提供错误信息和建议

## 输出格式

发布成功后返回：

```
✅ 文章已成功发布至微信公众号

📌 标题：<文章标题>
⏰ 发布时间：<时间>
🔗 Run ID：<Make Run ID>
```

## 错误处理

| 错误类型 | 处理方式 |
|---------|---------|
| 内容为空 | 要求用户提供文章内容 |
| MCP 不可用 | 提示用户检查 Make MCP 配置 |
| 发布失败 | 显示错误信息，建议手动发布或联系管理员 |

## 注意事项

- 仅发布定稿文章，不发布草稿或未完成内容
- 敏感信息（API Key、Token）在 Scenario 中管理，不在提示词中传递
- 发布前建议用户确认文章内容无误