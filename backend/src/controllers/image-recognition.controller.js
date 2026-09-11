import {
  buildClassificationPrompt,
  CORE_MATERIALS,
} from "../utils/coreMaterials.js";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const classifyRecyclable = async (req, res) => {
  try {
    const { image, mimeType } = req.body ?? {};

    if (!image || !mimeType) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    const prompt = buildClassificationPrompt();

    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: image,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    const result = response.content[0].text;

    const cleanedResult = result.replace(/```json\s*|```\s*/g, "").trim()

    const classification = JSON.parse(cleanedResult);

    return res
      .status(200)
      .json({ message: "Recyclable classified successfully", classification });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { classifyRecyclable }