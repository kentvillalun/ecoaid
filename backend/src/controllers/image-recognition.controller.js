import { buildClassificationPrompt } from "../utils/coreMaterials.js";
import { prisma } from "../config/db.js";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const classifyRecyclable = async (req, res) => {
  try {
    const { image, mimeType } = req.body ?? {};

    if (!image || !mimeType) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    // the materials the AI can pick stay fixed to the core list, only the unit
    // of each one follows what the barangay set in Settings
    const barangayMaterials = await prisma.material.findMany({
      where: { barangayId: req.user.barangayId },
      select: { name: true, defaultUnit: true },
    });

    const barangayUnits = Object.fromEntries(
      barangayMaterials.map((m) => [m.name, m.defaultUnit]),
    );

    const prompt = buildClassificationPrompt(barangayUnits);

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