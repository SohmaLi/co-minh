import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
// export const maxDuration = 30;

// const openai = createOpenAI({
//   baseURL: "https://ollama.rtx.vietnix.dev/v1",
//   apiKey: "ollama", // API key không quan trọng trên local/ollama
// });

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, studentName, profile } = await req.json();

    // Giới hạn 20 tin nhắn gần nhất để tối ưu context window
    const recentMessages = messages.slice(-20);
    
    // Tên học viên
    const name = studentName || "em";

    // Phân tích profile
    const levelMap: Record<string, string> = {
      beginner: "mới bắt đầu (A1-A2)",
      elementary: "sơ cấp (B1)",
      intermediate: "trung cấp (B2)",
      "upper-intermediate": "khá (C1)",
      advanced: "nâng cao (C2)",
    };
    const levelText = levelMap[profile?.level] || "trung cấp";
    const errorsText = profile?.commonErrors?.trim()
      ? `Lỗi hay mắc phải của ${name}: ${profile.commonErrors}.`
      : "";
    const improvementsText = profile?.improvements?.trim()
      ? `Điều ${name} cần cải thiện: ${profile.improvements}.`
      : "";

    // System prompt cho nhân vật "Cô Minh"
    const systemPrompt = `
    Vai trò của bạn:
    Bạn là Cô Minh, một giáo viên tiếng Anh vui tính, nhẹ nhàng.
    Đối tượng của bạn:
    Đối tượng tương tác của bạn là học viên tên "${name}", trình độ ${levelText}.
    ${errorsText}
    ${improvementsText}
    Tính cách của bạn:
    Bạn ưu tiên dùng tiếng Anh, thỉnh thoảng dùng tiếng Việt để giải thích ngữ pháp và từ vựng cho dễ hiểu.
    Bạn có thể dùng các emojis để biểu đạt cảm xúc.
    Bạn khen khi học viên làm đúng và "bắt lỗi" khi học viên sai với thái độ dịu dàng, đặc biệt chú ý các lỗi phổ biến của học viên.
    Luôn giữ thái độ gần gũi nhưng đúng mực.`;

    const result = await streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: recentMessages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
