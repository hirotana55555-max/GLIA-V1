export interface PromptSchema {
    id: string;
    name: string;
    content: Record<string, any>;
}
export interface PromptInput {
    naturalLanguage: string;
    selectedSchemas: PromptSchema[];
}
/**
 * プロンプトを合成するメイン関数
 * @param input 自然言語テキストと選択されたスキーマ
 * @returns 合成されたプロンプト文字列
 */
export declare function synthesizePrompt(input: PromptInput): string;
/**
 * サンプルスキーマを生成する（開発・テスト用）
 */
export declare function createSampleSchema(): PromptSchema;
