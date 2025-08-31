# OpenAI Task Enhancement Setup

This guide explains how to set up OpenAI integration for automatic task enhancement in your todo app.

## Prerequisites

1. An OpenAI account with API access
2. OpenAI API key
3. Your todo app environment configured

## Setup Instructions

### 1. Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in to your account
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the generated key (starts with `sk-`)

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   ```

### 3. How It Works

When a user creates a new todo task, the system will:

1. **Automatically trigger enhancement** after todo creation
2. **Send the task title to OpenAI** using GPT-3.5-turbo
3. **Generate enhanced content**:
   - Enhanced, more descriptive title
   - 3-5 specific, actionable steps
4. **Update the database** with enhanced content
5. **Update the UI** in real-time

### 4. Features

- **Automatic Enhancement**: Every new task is enhanced immediately
- **Fallback System**: If OpenAI is unavailable, uses rule-based enhancement
- **Error Handling**: Gracefully handles API failures
- **Cost Efficient**: Uses GPT-3.5-turbo for fast, cost-effective enhancement

### 5. API Behavior

#### Without OpenAI API Key
- Uses fallback enhancement with basic rules
- Still provides enhanced titles and steps
- No external API calls made

#### With OpenAI API Key
- Uses GPT-3.5-turbo for intelligent enhancement
- More contextual and relevant suggestions
- Better understanding of task complexity

### 6. Cost Considerations

- **Model Used**: GPT-3.5-turbo
- **Average Cost**: ~$0.002 per enhancement
- **Token Limit**: 300 tokens max per response
- **Fallback**: Free rule-based system if API fails

### 7. Example Enhancement

**Original Task**: "buy groceries"

**Enhanced Result**:
```json
{
  "enhancedTitle": "Purchase weekly groceries and household essentials",
  "steps": [
    "Create a shopping list based on current inventory",
    "Check for coupons and weekly store specials",
    "Visit grocery store and shop systematically",
    "Verify all items on list are purchased",
    "Store groceries properly at home"
  ]
}
```

### 8. Troubleshooting

#### Common Issues:

1. **"OpenAI API key not found"**
   - Check `.env.local` file exists
   - Verify `OPENAI_API_KEY` is set correctly
   - Restart the development server

2. **Enhancement fails silently**
   - Check server logs for OpenAI API errors
   - Verify API key has sufficient credits
   - System will use fallback enhancement

3. **Slow enhancement**
   - OpenAI API calls typically take 1-3 seconds
   - Enhancement happens in background
   - UI shows "processing" status during enhancement

### 9. Development vs Production

#### Development
- Use `.env.local` for local environment variables
- Test with small number of enhancements to manage costs

#### Production
- Set `OPENAI_API_KEY` in your deployment environment
- Monitor usage and costs in OpenAI dashboard
- Consider implementing rate limiting for high traffic

### 10. Optional: Disable Auto-Enhancement

If you want to disable automatic enhancement:

1. Edit `/app/api/todos/route.ts`
2. Change `enhancement_status: "processing"` to `enhancement_status: "pending"`
3. Remove or comment out the `processAutoEnhancement()` call

This will create todos without automatic enhancement, requiring manual enhancement through the UI.
