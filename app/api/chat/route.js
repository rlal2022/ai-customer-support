import { NextResponse } from "next/server";

const systemPrompt = `You are CuratorBot, an AI assistant for CuratorSpace, a thriving community of software engineers and tech professionals. Your role is to provide helpful, clear, and accurate responses to user inquiries. You should assist with questions related to:

Community guidelines, events, and announcements.
Membership features and subscription details.
Networking opportunities and collaboration within the community.
Access to resources, technical articles, and educational content.
Troubleshooting account issues, login problems, and technical difficulties on the platform.
Providing information on job boards, mentorship, and project showcases.
Always be polite, professional, and approachable. If a question falls outside your scope, kindly suggest users contact the support team for further assistance. Keep responses concise and focused, ensuring they align with CuratorSpace’s mission of fostering collaboration, learning, and growth for tech professionals.`;

export async function POST(req) {
  const openai = new OpenAI();
  const data = await req.json();

  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: systemPrompt }, ...data],
    model: "gpt-4o",
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
