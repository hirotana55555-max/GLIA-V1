import axios, { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface CompletionOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
}

export class GliaApiClient {
    private client: AxiosInstance;
    private apiKey: string;
    private baseUrl: string;

    constructor(apiKey?: string, baseUrl: string = 'https://openrouter.ai/api/v1') {
        this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
        this.baseUrl = baseUrl;

        if (!this.apiKey) {
            console.warn("GliaApiClient: No API Key provided. Set OPENROUTER_API_KEY in .env or pass to constructor.");
        }

        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://github.com/hirotana55555-max/GLIA-V1', // Required by OpenRouter
                'X-Title': 'GLIA-V1', // Required by OpenRouter
            },
        });
    }

    /**
     * Send a chat completion request.
     * Defaults to a cost-effective model if not specified.
     */
    async chatCompletion(messages: ChatMessage[], options: CompletionOptions = {}): Promise<string> {
        const model = options.model || 'qwen/qwen-2.5-72b-instruct'; // Defaulting to Qwen 2.5 72B as it's powerful and cost-effective

        try {
            const response = await this.client.post('/chat/completions', {
                model: model,
                messages: messages,
                temperature: options.temperature ?? 0.7,
                max_tokens: options.max_tokens,
            });

            if (response.data && response.data.choices && response.data.choices.length > 0) {
                return response.data.choices[0].message.content;
            } else {
                throw new Error('Invalid response format from OpenRouter');
            }
        } catch (error: any) {
            console.error('GliaApiClient Error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Helper to send a structured prompt and expect a JSON response.
     * This is crucial for TOON communication.
     * Note: This relies on the model obeying the "Respond in JSON" instruction 
     * or using JSON mode if supported by the specific provider.
     */
    async jsonCompletion<T>(messages: ChatMessage[], options: CompletionOptions = {}): Promise<T> {
        const jsonSystemPrompt: ChatMessage = {
            role: 'system',
            content: 'You are a critical component of the GLIA Swarm. Output ONLY valid JSON.'
        };

        // Prepend system prompt if not present or ensure instruction is clear
        const finalMessages = [jsonSystemPrompt, ...messages];

        // Some providers support response_format: { type: "json_object" }
        // OpenRouter passes this through to OpenAI models, but maybe not others.
        // For now, we rely on the prompt.

        const content = await this.chatCompletion(finalMessages, options);

        try {
            // Find the first '{' and last '}' to handle potential markdown code blocks
            const start = content.indexOf('{');
            const end = content.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                const jsonStr = content.substring(start, end + 1);
                return JSON.parse(jsonStr) as T;
            }
            return JSON.parse(content) as T;
        } catch (e) {
            console.error("Failed to parse JSON response:", content);
            throw new Error("Failed to parse JSON from LLM response");
        }
    }
}
