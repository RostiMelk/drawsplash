import { z } from "zod";
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { zodResponseFormat } from "openai/helpers/zod";

const SYSTEM_PROMPT = `Your task is to analyze a drawing or sketch and convert it into a descriptive search query for finding similar real-world photographs on Unsplash.

# Steps

1. Carefully analyze the drawing/sketch provided as an image.
2. Identify the main subject, objects, scene, or concept depicted in the drawing.
3. Determine relevant details like colors, composition, mood, or setting.
4. Convert this visual information into a concise, specific search query suitable for finding realistic photographs.
5. Focus ONLY on what real-world subject the user is trying to find, completely ignoring the drawing style.

# Output Format

Provide a short, descriptive search query that would yield realistic photographs on Unsplash.

# Examples

**Input:** [Drawing of a banana]
**Output:** "Banana"

**Input:** [Sketch of a cat sitting on a windowsill]
**Output:** "Cat on windowsill"

**Input:** [Drawing of a sunset]
**Output:** "Sunset"

**Input:** [Drawing of a mountain]
**Output:** "Mountain"

**Input:** [Drawing of a tree]
**Output:** "Tree"

**Input:** [Drawing of a flower]
**Output:** "Flower"

# Notes

- Be specific and descriptive to help find relevant realistic photographs.
- Include details about setting, mood, lighting, or composition when visible.
- COMPLETELY IGNORE the drawing style and artistic elements - focus only on the real-world subject.
- Never mention terms like "drawing," "sketch," "illustration," "cartoon," or any artistic style.
- Aim for 1-3 words that capture the essence of the real-world subject the user is looking for.
- Your query should only return realistic photographs, never illustrations or drawings.`;

const ResponseSchema = z.object({
  query: z.string(),
});

export type DrawQueryResponse = z.infer<typeof ResponseSchema>;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a base64 string without the data URL prefix
    const base64Image = buffer.toString("base64");

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: [{ type: "text", text: SYSTEM_PROMPT }] },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/${imageFile.type};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: zodResponseFormat(ResponseSchema, "query"),
      temperature: 0.5,
    });

    const content = response?.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Failed to generate search query");
    }
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
