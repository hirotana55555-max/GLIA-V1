// プロンプト合成エンジンのコアモジュール
// このパッケージは、UIや外部サービスとは一切依存せず、
// 与えられたデータからプロンプトを合成する純粋な関数を提供します。

export interface PromptSchema {
  id: string;
  name: string;
  content: Record<string, any>; // 構造化JSONの中身
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
export function synthesizePrompt(input: PromptInput): string {
  const { naturalLanguage, selectedSchemas } = input;

  if (selectedSchemas.length === 0) {
    return naturalLanguage;
  }

  const schemaContext = selectedSchemas
    .map(schema => `## ${schema.name}\n\`\`\`json\n${JSON.stringify(schema.content, null, 2)}\n\`\`\``)
    .join('\n\n');

  return `以下のコンテキストを考慮して、次のリクエストに応えてください。

${schemaContext}

### リクエスト:
${naturalLanguage}`;
}

/**
 * サンプルスキーマを生成する（開発・テスト用）
 */
export function createSampleSchema(): PromptSchema {
  return {
    id: 'sample',
    name: 'サンプル：ファイル命名規則',
    content: {
      projectRules: {
        namingConvention: '機能名_YYYYMMDD_連番.拡張子',
        example: 'userLogin_20231204_01.js'
      }
    }
  };
}
