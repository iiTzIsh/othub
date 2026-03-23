import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * API Route: Extract attendance data from images using ChatGPT GPT-4o Vision
 * POST /api/extract-text
 * Two-step process:
 * 1. Extract raw text from image
 * 2. Parse into structured attendance records
 */

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Image data is required', text: '' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'OpenAI API key not configured. Please add OPENAI_API_KEY to .env.local. Get a key at https://platform.openai.com/api/keys',
          text: '',
        },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey });

    console.log('🔄 Step 1: Extracting text from attendance sheet image...');

    // Remove data URL prefix if present
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    // Step 1: Extract raw text from image
    const extractionResponse = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Data}`,
              },
            },
            {
              type: 'text',
              text: `Extract ALL attendance data from this sheet. Read every row carefully.
For each employee record, extract:
- Date (day of month: 1-31)
- Time In (arrival time)
- Time Out (departure time)
- Days (1 for full day, 1/2 for half day)

Return raw text with all details exactly as shown.`,
            },
          ],
        },
      ],
    });

    const extractedRawText = extractionResponse.choices[0]?.message?.content || '';

    if (!extractedRawText || !extractedRawText.trim()) {
      return NextResponse.json(
        { error: 'Could not extract text from image', text: '' },
        { status: 400 }
      );
    }

    console.log('✅ Text extracted');
    console.log('🔄 Step 2: Parsing into structured data...');

    // Step 2: Use AI to intelligently parse the extracted text into structured format
    const parseResponse = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are an attendance sheet parser. Parse this attendance data into a clean format.

Raw data:
${extractedRawText}

Return ONLY text output in this exact format (one record per line):
Date: X, In: HH:MM, Out: HH:MM, Days: Y
Date: X, In: HH:MM, Out: HH:MM, Days: Y
...

Rules:
- Date: Day of month (1-31)
- In: Time In (convert to 24-hour format HH:MM)
- Out: Time Out (convert to 24-hour format HH:MM)
- Days: "1" for full day, "1/2" for half day
- Extract EVERY row with complete time data
- Skip headers, totals, and rows without time data

Example output:
Date: 1, In: 09:30, Out: 18:30, Days: 1
Date: 2, In: 09:30, Out: 18:30, Days: 1
Date: 3, In: 14:30, Out: 18:30, Days: 1/2`,
        },
      ],
    });

    const parseContent = parseResponse.choices[0]?.message?.content || '';

    console.log('✅ Parsing completed');
    console.log('📊 Data ready for OT calculation');

    return NextResponse.json({
      success: true,
      text: parseContent,
      error: null,
      model: 'gpt-4o',
      costPerImage: '$0.006 USD',
    });
  } catch (error) {
    console.error('ChatGPT Extraction Error:', error);

    let errorMessage = 'An error occurred during extraction';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      if (
        errorMessage.includes('401') ||
        errorMessage.includes('invalid_api_key') ||
        errorMessage.includes('Unauthorized')
      ) {
        errorMessage =
          '❌ Invalid OpenAI API key. Check your OPENAI_API_KEY in .env.local';
        statusCode = 401;
      } else if (errorMessage.includes('429') || errorMessage.includes('rate_limit')) {
        errorMessage = '⏳ Rate limit: Too many requests. Wait and retry.';
        statusCode = 429;
      } else if (errorMessage.includes('insufficient_quota')) {
        errorMessage = '💳 Account out of credits. Add funds at OpenAI dashboard.';
        statusCode = 402;
      } else if (errorMessage.includes('timeout')) {
        errorMessage = '⏱️ Request timed out. Try again.';
        statusCode = 504;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        text: '',
        success: false,
      },
      { status: statusCode }
    );
  }
}
