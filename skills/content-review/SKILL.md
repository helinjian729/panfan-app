---
name: content-review
description: Review articles (Markdown) for logical and structural integrity using Claude, and factual accuracy and style consistency using Gemini CLI. Use when user says "review this article", "check this post", "proofread", "审查文章", "文章审查", "润色审查", or asks to verify article quality, fact-check content, or check writing consistency.
---

# Content Review Skill

A skill that performs comprehensive article review using a dual-model approach: Claude for logic/structure analysis and Gemini for factual/style verification.

## When to Use This Skill

Use this skill when the user:
- Asks to "review this article" or "审查文章"
- Requests proofreading or content verification
- Wants fact-checking on an article
- Asks to check writing consistency or style
- Submits a blog post, documentation, or any Markdown article for quality review

## Input

The user provides a Markdown article. The article can be:
- Pasted directly into the conversation
- Provided as a file path to read
- Given as raw Markdown text

## Review Process

### Step 1: Logical and Structural Review (Claude)

Analyze the article for:

**Logical Dimensions:**
- Clarity and strength of main arguments/thesis
- Logical flow and coherence of ideas
- Quality and sufficiency of evidence and examples
- Presence of logical fallacies or gaps in reasoning
- Effectiveness of counterargument handling

**Structural Dimensions:**
- Overall organization and hierarchy
- Paragraph coherence and topic unity
- Transitions between paragraphs and sections
- Introduction effectiveness (hooks, context setting)
- Conclusion strength and summary quality
- Appropriate use of headings and formatting

### Step 2: Factual and Style Review (Gemini via CLI)

Use the `gemini` CLI to perform fact-checking and style analysis:

```bash
gemini "Fact-check this article for accuracy, data verification, and source reliability. Also check for writing style consistency, tone uniformity, and adherence to standard writing conventions: [ARTICLE_CONTENT]"
```

Replace `[ARTICLE_CONTENT]` with the full article text (or relevant excerpt if very long).

### Step 3: Combined Report

Merge findings from both Claude and Gemini reviews into a unified report.

## Output Format

Always use this exact structure for the review report:

```
# Content Review Report

## Overall Assessment
[One-paragraph summary of the article's quality and main issues]

## Logical Review (Claude)
### Strengths
- [Bullet points of what works well logically]

### Issues Found
- [Specific logical issues with page/section references]

### Recommendations
- [Actionable suggestions for improving logical flow]

## Structural Review (Claude)
### Strengths
- [What works well in structure/organization]

### Issues Found
- [Specific structural problems]

### Recommendations
- [Suggestions for better organization]

## Factual & Style Review (Gemini)
### Factual Accuracy
- [Verified facts, disputed claims, unsupported assertions]

### Style Consistency
- [Tone consistency, terminology uniformity, formatting issues]

### Recommendations
- [Suggestions for factual corrections and style improvements]

## Priority Action Items
1. [Most important issue to address]
2. [Second priority]
3. [Third priority]
```

## Tips

- If the article is very long (>10,000 words), ask the user if they want a full review or prefer to focus on specific sections
- If Gemini CLI is not available, skip that step and note it in the report, completing the Claude review only
- For fact-checking, focus on specific claims, statistics, dates, and verifiable statements
- When citing issues, reference the specific section or paragraph for easy lookup