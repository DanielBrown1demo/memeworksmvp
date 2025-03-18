import OpenAI from 'openai';
import { toast } from 'sonner';
import type { MemeTemplate } from './store';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function fetchMemeTemplates() {
  try {
    const response = await fetch('https://api.imgflip.com/get_memes');
    const data = await response.json();
    
    if (data.success) {
      return data.data.memes;
    }
    throw new Error(data.error_message || 'Failed to fetch templates');
  } catch (error) {
    console.error('Error fetching templates:', error);
    toast.error('Failed to load meme templates. Please refresh the page.');
    return [];
  }
}

export async function findBestTemplate(prompt: string, templates: MemeTemplate[]) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert meme template matcher trained on millions of memes. Your task is to analyze meme contexts and match them with the perfect template, just like meme-llama would.

Key matching criteria:
1. Visual elements and composition that enhance the humor
2. Template popularity and recognizability
3. Text box placement and count optimization
4. Cultural relevance and current meme trends
5. Emotional resonance with the intended audience

Return ONLY the ID of the best matching template.`
        },
        {
          role: "user",
          content: `Prompt: ${prompt}

Available templates:
${JSON.stringify(templates.map(t => ({
  id: t.id,
  name: t.name,
  box_count: t.box_count
})), null, 2)}`
        }
      ],
      temperature: 1.0,
      max_tokens: 100
    });

    const templateId = completion.choices[0].message.content?.trim();
    if (!templateId) {
      throw new Error('No template suggestion received');
    }

    return templateId;
  } catch (error) {
    console.error('Error finding best template:', error);
    throw new Error('Failed to find the best template for your prompt');
  }
}

export async function generateCaptions(prompt: string, templateBoxCount: number, tone: string) {
  try {
    const toneInstructions = {
      funny: "Generate peak internet humor that would go viral on any platform",
      wholesome: "Create heartwarming content that avoids being cringe",
      absurd: "Channel surreal meme energy and deep-fried aesthetics",
      political: "Deliver sharp commentary through top-tier shitposting"
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a meme caption generator trained on millions of memes, similar to meme-llama. Generate ${templateBoxCount} captions for a ${tone} meme: ${toneInstructions[tone as keyof typeof toneInstructions]}

Caption requirements:
1. Match the language of the input prompt
2. Keep each caption under 60 characters
3. Capture authentic internet humor
4. Avoid forced memes or dead formats
5. Use appropriate cultural references
6. Maintain the original prompt's tone and intent

Return exactly ${templateBoxCount} captions, one per line.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 1.0,
      max_tokens: 150,
      frequency_penalty: 0.5,
      presence_penalty: 0.5
    });

    const captions = completion.choices[0].message.content?.split('\n').filter(Boolean) || [];
    return captions
      .map(caption => 
        caption
          .replace(/^[.,!?]+|[.,!?]+$/g, '')
          .trim()
      )
      .filter(caption => caption.length > 0)
      .slice(0, templateBoxCount);
  } catch (error) {
    console.error('Error generating captions:', error);
    throw new Error('Failed to generate captions');
  }
}

export async function generateMeme(templateId: string, texts: string[]) {
  if (!process.env.NEXT_PUBLIC_IMGFLIP_USERNAME || !process.env.NEXT_PUBLIC_IMGFLIP_PASSWORD) {
    toast.error('Missing Imgflip credentials');
    return null;
  }

  const formData = new URLSearchParams();
  formData.append('template_id', templateId);
  formData.append('username', process.env.NEXT_PUBLIC_IMGFLIP_USERNAME);
  formData.append('password', process.env.NEXT_PUBLIC_IMGFLIP_PASSWORD);
  formData.append('no_watermark', '1');
  
  texts.forEach((text, index) => {
    formData.append(`boxes[${index}][text]`, text);
  });

  try {
    const response = await fetch('https://api.imgflip.com/caption_image', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (data.success) {
      return {
        url: data.data.url,
        template_id: templateId
      };
    }
    throw new Error(data.error_message || 'Failed to generate meme');
  } catch (error) {
    console.error('Error generating meme:', error);
    throw error;
  }
}