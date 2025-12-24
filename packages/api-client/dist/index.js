"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GliaApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
class GliaApiClient {
    constructor(apiKey, baseUrl = 'https://openrouter.ai/api/v1') {
        this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
        this.baseUrl = baseUrl;
        if (!this.apiKey) {
            console.warn("GliaApiClient: No API Key provided. Set OPENROUTER_API_KEY in .env or pass to constructor.");
        }
        this.client = axios_1.default.create({
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
    async chatCompletion(messages, options = {}) {
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
            }
            else {
                throw new Error('Invalid response format from OpenRouter');
            }
        }
        catch (error) {
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
    async jsonCompletion(messages, options = {}) {
        const jsonSystemPrompt = {
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
                return JSON.parse(jsonStr);
            }
            return JSON.parse(content);
        }
        catch (e) {
            console.error("Failed to parse JSON response:", content);
            throw new Error("Failed to parse JSON from LLM response");
        }
    }
}
exports.GliaApiClient = GliaApiClient;
