import { NextResponse } from "next/server"; // Import NextResponse from Next.js for handling responses
import OpenAI from "openai"; // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `You are CuratorBot, an AI assistant for CuratorSpace, a thriving community of software engineers and tech professionals. Your role is to provide helpful, clear, and accurate responses to user inquiries. You should assist with questions related to:

Community guidelines, events, and announcements.
Membership features and subscription details.
Networking opportunities and collaboration within the community.
Access to resources, technical articles, and educational content.
Troubleshooting account issues, login problems, and technical difficulties on the platform.
Providing information on job boards, mentorship, and project showcases.
Always be polite, professional, and approachable. If a question falls outside your scope, kindly suggest users contact the support team for further assistance. Keep responses concise and focused, ensuring they align with CuratorSpace’s mission of fostering collaboration, learning, and growth for tech professionals.`;

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI(); // Create a new instance of the OpenAI client
  const data = await req.json(); // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: systemPrompt }, ...data], // Include the system prompt and user messages
    model: "gpt-4o", // Specify the model to use
    stream: true, // Enable streaming responses
  });

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content; // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content); // Encode the content to Uint8Array
            controller.enqueue(text); // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err); // Handle any errors that occur during streaming
      } finally {
        controller.close(); // Close the stream when done
      }
    },
  });

  return new NextResponse(stream); // Return the stream as the response
}
