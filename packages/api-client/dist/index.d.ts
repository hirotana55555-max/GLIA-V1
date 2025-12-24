export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface CompletionOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
}
export declare class GliaApiClient {
    private client;
    private apiKey;
    private baseUrl;
    constructor(apiKey?: string, baseUrl?: string);
    /**
     * Send a chat completion request.
     * Defaults to a cost-effective model if not specified.
     */
    chatCompletion(messages: ChatMessage[], options?: CompletionOptions): Promise<string>;
    /**
     * Helper to send a structured prompt and expect a JSON response.
     * This is crucial for TOON communication.
     * Note: This relies on the model obeying the "Respond in JSON" instruction
     * or using JSON mode if supported by the specific provider.
     */
    jsonCompletion<T>(messages: ChatMessage[], options?: CompletionOptions): Promise<T>;
}
