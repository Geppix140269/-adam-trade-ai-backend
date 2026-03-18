# ADAM Knowledge Base - Content Addition Guide

This guide will help you add your ADAM Global Trade Academy content to the AI system.

## Overview

The AI now uses YOUR course content to answer student questions! When a student asks about Incoterms, the AI searches your knowledge base, finds relevant ADAM content, and uses it to generate answers.

## File Location

**File:** `knowledge-base.json`
**Location:** `C:\Development\adam-trade-ai-backend\knowledge-base.json`

## How It Works

1. Student asks: "What are Incoterms?"
2. System searches `knowledge-base.json` for "Incoterms"
3. Finds Module 2 (Incoterms & Contracts) content
4. Sends that content to OpenAI as context
5. OpenAI generates answer based on YOUR content
6. Student gets ADAM-specific response!

## Content Structure

The knowledge base has these sections:

### 1. Methodology
Your teaching approach and principles

### 2. Modules (10 modules)
Each module contains:
- `title`: Module name
- `description`: Brief overview
- `keyTopics`: List of topics covered
- `content`: **Main course content** (this is what the AI uses!)
- `examples`: Real-world examples
- `faqs`: Common questions and ADAM's answers

### 3. Glossary
Definitions of key terms

### 4. General FAQs
Course-wide questions (enrollment, certificates, etc.)

## How to Add Your Content

### Step 1: Open the File

1. Go to: `C:\Development\adam-trade-ai-backend\`
2. Open `knowledge-base.json` in any text editor (Notepad, VS Code, etc.)

### Step 2: Replace PLACEHOLDER Text

Look for text that says:
```
"PLACEHOLDER: Add your..."
```

Replace it with your actual content.

### Step 3: Add Content for Each Module

For each module, fill in:

**Example for Module 1:**
```json
{
  "id": 1,
  "title": "Introduction to Global Trade",
  "content": "Your full lesson content here. Include:
  - Key concepts and definitions
  - Explanations
  - Important points students should remember

  The more detail you add, the better the AI will answer questions!"
}
```

**Module 2 is already done as an example** - see how it's formatted.

### Step 4: Add Examples

```json
"examples": [
  {
    "title": "Example: Trade Route Analysis",
    "content": "Specific example from your course with details"
  }
]
```

### Step 5: Add FAQs

```json
"faqs": [
  {
    "question": "Why is global trade important?",
    "answer": "Your answer here - this is what students will see"
  }
]
```

### Step 6: Update Glossary

```json
"glossary": [
  {
    "term": "Your Term",
    "definition": "ADAM's definition"
  }
]
```

## Tips for Best Results

### ✅ DO:
- **Be detailed** - More content = better AI answers
- **Use your actual course language** - AI will match your style
- **Include examples** - Helps AI explain concepts
- **Add FAQs** - AI prioritizes these for common questions
- **Use bullet points** - Easier for AI to parse

### ❌ DON'T:
- Don't use special characters like quotes without escaping: `\"`
- Don't leave PLACEHOLDER text - AI will mention it to students
- Don't add very long paragraphs - break into sections

## JSON Format Rules

**Important:** JSON is picky about syntax!

### Escaping Quotes
If your content has quotes, escape them:
```json
"content": "The term \"FOB\" means Free On Board"
```

### Multiple Lines
For long content, use `\n` for line breaks:
```json
"content": "First paragraph.\n\nSecond paragraph after blank line."
```

### Commas
- Put comma AFTER each item
- NO comma after the LAST item in a list

**Example:**
```json
"faqs": [
  {"question": "Q1", "answer": "A1"},  ← comma here
  {"question": "Q2", "answer": "A2"}   ← NO comma (last item)
]
```

## Testing Your Content

### Step 1: Save the File
Save `knowledge-base.json`

### Step 2: Push to GitHub
```bash
cd C:\Development\adam-trade-ai-backend
git add knowledge-base.json
git commit -m "Added ADAM course content for [module name]"
git push
```

### Step 3: Railway Redeploys Automatically
Wait 1-2 minutes for Railway to deploy

### Step 4: Test It!
1. Go to your app: https://adamftd-trade-academy.netlify.app/
2. Click AI Tutor
3. Ask a question about content you added
4. AI should use YOUR content in the answer!

## Example: Adding Module 3 Content

Here's a complete example:

```json
{
  "id": 3,
  "title": "Customs & Compliance",
  "description": "Regulations and documentation",
  "keyTopics": [
    "Import/export documentation",
    "Customs procedures",
    "Compliance requirements",
    "HS codes and tariffs"
  ],
  "content": "Customs compliance is critical in international trade. Every shipment must clear customs with proper documentation including:\n\n1. Commercial Invoice - Details of the transaction\n2. Packing List - Contents of each package\n3. Bill of Lading - Transport document\n4. Certificate of Origin - Where goods were manufactured\n\nThe Harmonized System (HS) is used worldwide to classify products with 6-digit codes. Tariffs are applied based on HS codes. Proper classification is essential to avoid delays and penalties.",
  "examples": [
    {
      "title": "Example: HS Code Classification",
      "content": "A leather wallet would be classified under HS code 4202.31 - meaning Chapter 42 (leather goods), Heading 4202 (travel goods), Subheading .31 (with outer surface of leather). This determines the tariff rate when importing."
    }
  ],
  "faqs": [
    {
      "question": "What is an HS code?",
      "answer": "An HS (Harmonized System) code is a 6-digit number used worldwide to classify traded products. It's used to determine tariffs, regulations, and statistics for international trade."
    },
    {
      "question": "What documents do I need for customs?",
      "answer": "Essential customs documents include: Commercial Invoice, Packing List, Bill of Lading/Airway Bill, and Certificate of Origin. Additional documents may be required depending on the product and destination country."
    }
  ]
}
```

## Quick Start Workflow

1. **Start with modules you teach most** - Add content for your most popular topics first
2. **Use your existing materials** - Copy from your course documents
3. **Add one module at a time** - Test after each addition
4. **Expand gradually** - Add more detail over time

## Need Help?

**Syntax Error?**
- Use a JSON validator: https://jsonlint.com/
- Copy your JSON, paste it there, click "Validate"
- It will show you exactly where the error is

**Not Sure What to Add?**
- Look at Module 2 (Incoterms) - it's a complete example
- Follow that format for other modules

**AI Not Using Your Content?**
- Make sure content is in the "content" field
- Check that you saved the file
- Verify Railway redeployed (check Railway dashboard)
- Try asking questions that match your "keyTopics"

## Summary

**Remember:**
1. Edit `knowledge-base.json`
2. Replace PLACEHOLDER with your content
3. Save file
4. Push to GitHub: `git add . && git commit -m "Added content" && git push`
5. Wait for Railway to deploy (1-2 min)
6. Test in your app!

The more content you add, the smarter your AI tutor becomes! 🎓

---

**Ready to start? Open `knowledge-base.json` and begin adding your ADAM content!**
