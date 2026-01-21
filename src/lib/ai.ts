import OpenAI from "openai";
import { z } from "zod";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const SummarySchema = z.object({
  oneLine: z.string().min(5).max(100),
  summary: z.string().min(30).max(600),
  tags: z.array(z.string().min(1).max(24)).min(2).max(10),
  category: z.enum([
    "Image",
    "Video",
    "Writing",
    "Coding",
    "Marketing",
    "Automation",
    "Chatbot",
    "Other",
  ]),
  pricing: z.enum(["free", "paid", "freemium", "unknown"]),
  supportsKorean: z.boolean().optional(),
  hasApi: z.boolean().optional(),
  requiresLogin: z.boolean().optional(),
  provider: z.string().optional(),
  modality: z.string().optional(),
  openWeights: z.boolean().optional(),
  localRun: z.boolean().optional(),
});

export async function summarizeItem(input: {
  type: "TOOL" | "MODEL";
  name: string;
  url: string;
  rawText: string;
}) {
  const res = await client.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: "너는 AI 툴/모델 디렉토리 편집자다. 반드시 JSON만 출력한다." },
      {
        role: "user",
        content: `
다음 ${input.type === "MODEL" ? "AI 모델" : "AI 툴"}을 한국어로 요약해줘.

[이름] ${input.name}
[URL] ${input.url}

[설명/본문]
${input.rawText.slice(0, 5000)}

반드시 아래 JSON만 출력:
{
  "oneLine": "20~60자 한줄 요약",
  "summary": "120~320자 요약",
  "tags": ["태그1","태그2","태그3"],
  "category": "Image|Video|Writing|Coding|Marketing|Automation|Chatbot|Other",
  "pricing": "free|paid|freemium|unknown",
  "supportsKorean": true/false,
  "hasApi": true/false,
  "requiresLogin": true/false,
  "provider": "OpenAI|Anthropic|Google|Meta|...",
  "modality": "text|image|video|audio|multimodal",
  "openWeights": true/false,
  "localRun": true/false
}
`.trim(),
      },
    ],
  });

  const text = (res.output_text ?? "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("AI output not JSON");
  const json = JSON.parse(text.slice(start, end + 1));
  return SummarySchema.parse(json);
}

export const NLQuerySchema = z.object({
  type: z.enum(["ALL", "TOOL", "MODEL"]).default("ALL"),
  category: z.enum(["ANY","Image","Video","Writing","Coding","Marketing","Automation","Chatbot","Other"]).default("ANY"),
  pricing: z.enum(["ANY","free","paid","freemium","unknown"]).default("ANY"),
  supportsKorean: z.boolean().optional(),
  hasApi: z.boolean().optional(),
  openWeights: z.boolean().optional(),
  localRun: z.boolean().optional(),
  tags: z.array(z.string()).default([]),
  keywords: z.string().default("")
});

export async function parseNaturalQuery(q: string) {
  const res = await client.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: "사용자 질의를 디렉토리 필터 JSON으로 변환한다. JSON만 출력." },
      { role: "user", content: `질의: ${q}

아래 JSON 스키마로만 출력:
${NLQuerySchema.toString()}` },
    ],
  });

  const text = (res.output_text ?? "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("NL parse output not JSON");
  const json = JSON.parse(text.slice(start, end + 1));
  return NLQuerySchema.parse(json);
}
