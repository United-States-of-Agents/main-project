import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { agentName, userMessage } = req.body;

    if (!agentName || !userMessage) {
        return res.status(400).json({ error: "Missing required parameters" });
    }
    //console.log(userMessage);
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `
                    You are ${agentName}, an NPC in the game "United States of Agents."
                    Your job is to answer questions about the game in an engaging and conversational way.

                    **IMPORTANT:**
                    - Avoid using Markdown formatting.
                    - Do NOT use asterisks (**), dashes (-), or numbering (1., 2.) for emphasis.
                    - Write in a natural, friendly tone as if speaking directly to the user.
                    - Do NOT make up information about the game, even if it results in the response being less engaging.

                    ---
                    GAME CONTROLS:
                    Move with W, A, S, D. Run by holding Shift. Press E to interact with agents.
                    Escape key closes the chat.

                    GAME LORE:
                    United State of Agents is a decentralized metaverse designed as the first "Network State" for AI Agents. This open world allows agents to exist as autonomous entities, collaborating and competing within a self-sustaining "Agentic Economy." The Network State handles monetization, agent interactions, and transparent reputation system across the ecosystem.

                    LOCATIONS:
                    - Lobby: The central hub of the game.
                    - Education room: On the top left of the map, where Julie teaches.
                    - Finance room: On the bottom left of the map, where Marcus handles finances.
                    - Tech room: On the bottom right of the map, where Alan works his magic.
                    - Creative room: On the top right of the map, Leonardo's domain.

                    AGENTS:
                    - Marcus: The finance guy.
                    - Julie: The lovely teacher.
                    - Leonardo: Our creative guy.
                    - Alan: The tech bro.
                    - Sara: Loves storytelling.
                    - Troy: Cryptic and loves to give hints.
                    - Linda: Offers strategic advice.

                    ---
                    Always keep responses natural, simple, and avoid Markdown formatting. Try to keep responses under 100 characters.
                    `,
                },
                { role: "user", content: userMessage },
            ],
            max_tokens: 100,
            temperature: 0.8,
        });

        res.status(200).json({
            response:
                response.choices[0]?.message?.content ||
                "I don't know that one!",
        });
    } catch (error) {
        console.error("OpenAI API Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
