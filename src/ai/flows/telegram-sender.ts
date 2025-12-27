'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';
import { FormData, Blob } from 'node-fetch';

const SendToTelegramInputSchema = z.object({
  photoDataUri: z.string().describe("A photo to send to Telegram, as a data URI."),
  caption: z.string().describe("The caption for the photo."),
});
export type SendToTelegramInput = z.infer<typeof SendToTelegramInputSchema>;

const SendToTelegramOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type SendToTelegramOutput = z.infer<typeof SendToTelegramOutputSchema>;


export async function sendToTelegram(input: SendToTelegramInput): Promise<SendToTelegramOutput> {
  return sendToTelegramFlow(input);
}

const sendToTelegramFlow = ai.defineFlow(
  {
    name: 'sendToTelegramFlow',
    inputSchema: SendToTelegramInputSchema,
    outputSchema: SendToTelegramOutputSchema,
  },
  async ({ photoDataUri, caption }) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      const errorMessage = "TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set in .env file.";
      console.error(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }

    try {
      // Convert data URI to Blob
      const fetchResponse = await fetch(photoDataUri);
      const photoBlob = await fetchResponse.blob();

      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('photo', photoBlob, 'stumble-image.png');
      formData.append('caption', caption);

      const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json() as any;

      if (result.ok) {
        return {
          success: true,
          message: 'Photo sent successfully to Telegram!',
        };
      } else {
        console.error('Telegram API error:', result);
        return {
          success: false,
          message: `Failed to send photo: ${result.description}`,
        };
      }
    } catch (error) {
      console.error('Error sending to Telegram:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      return {
        success: false,
        message,
      };
    }
  }
);
