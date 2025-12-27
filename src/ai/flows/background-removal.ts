// Remove the background from an image.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BackgroundRemovalInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to remove the background from, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type BackgroundRemovalInput = z.infer<typeof BackgroundRemovalInputSchema>;

const BackgroundRemovalOutputSchema = z.object({
  processedPhotoDataUri: z
    .string()
    .describe("The photo with the background removed, as a data URI."),
});
export type BackgroundRemovalOutput = z.infer<typeof BackgroundRemovalOutputSchema>;

export async function removeBackground(input: BackgroundRemovalInput): Promise<BackgroundRemovalOutput> {
  return removeBackgroundFlow(input);
}

const removeBackgroundPrompt = ai.definePrompt({
  name: 'removeBackgroundPrompt',
  input: {schema: BackgroundRemovalInputSchema},
  output: {schema: BackgroundRemovalOutputSchema},
  prompt: `Remove the background from this image: {{media url=photoDataUri}} and return the image as a data URI with a transparent background.`,
});

const removeBackgroundFlow = ai.defineFlow(
  {
    name: 'removeBackgroundFlow',
    inputSchema: BackgroundRemovalInputSchema,
    outputSchema: BackgroundRemovalOutputSchema,
  },
  async input => {
    const {output} = await removeBackgroundPrompt(input);
    return output!;
  }
);
