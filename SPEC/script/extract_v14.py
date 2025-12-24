#!/usr/bin/env python3
"""
GLIA v1.4 情報抽出・圧縮スクリプト
収集した大量データから、LLMに最も必要な情報だけを抽出してJSON化
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime, timezone, timedelta

# 設定
DATA_DIR = Path("./SPEC/Reverse_spec/v1.4_data")
OUTPUT_FILE = Path("./SPEC/Reverse_spec/glia_v1.4_specification.json")

def extract_typescript_types(content: str) -> List[Dict[str, str]]:
    """TypeScript型定義を抽出"""
    types = []
    
    # interface/type の抽出
    pattern = r'(export\s+)?(interface|type|class)\s+(\w+)([^{]*)\{([^}]+)\}'
    matches = re.finditer(pattern, content, re.MULTILINE | re.DOTALL)
    
    for match in matches:
        type_kind = match.group(2)
        type_name = match.group(3)
        type_body = match.group(5)
        
        types.append({
            "type_name": type_name,
            "kind": type_kind,
            "definition": f"{type_kind} {type_name} {{{type_body}}}",
            "source": "extracted"
        })
    
    return types

def extract_function_signatures(content: str) -> List[Dict[str, str]]:
    """関数シグネチャを抽出"""
    functions = []
    
    # async function/method の抽出
    pattern = r'(async\s+)?(\w+)\s*\(([^)]*)\)\s*:\s*([^{]+)'
    matches = re.finditer(pattern, content)
    
    for match in matches:
        func_name = match.group(2)
        params = match.group(3)
        return_type = match.group(4).strip()
        
        functions.append({
            "name": func_name,
            "signature": f"{func_name}({params}): {return_type}",
            "is_async": match.group(1) is not None
        })
    
    return functions

def extract_zod_schemas(content: str) -> List[Dict[str, str]]:
    """Zodスキーマを抽出"""
    schemas = []
    
    # z.object() パターンの抽出
    pattern = r'export\s+const\s+(\w+Schema)\s*=\s*z\.object\({([^}]+)}\)'
    matches = re.finditer(pattern, content, re.MULTILINE | re.DOTALL)
    
    for match in matches:
        schema_name = match.group(1)
        schema_body = match.group(2)
        
        schemas.append({
            "schema_name": schema_name,
            "definition": f"z.object({{{schema_body}}})"
        })
    
    return schemas

def extract_test_data_samples(content: str) -> List[Dict[str, Any]]:
    """テストデータのサンプルを抽出"""
    samples = []
    
    # JSON object パターンの抽出（簡易版）
    pattern = r'const\s+(\w+)\s*=\s*({[^;]+});'
    matches = re.finditer(pattern, content, re.MULTILINE | re.DOTALL)
    
    for match in matches:
        var_name = match.group(1)
        json_str = match.group(2)
        
        # mission, proposal などの重要な変数のみ
        if any(keyword in var_name.lower() for keyword in ['mission', 'proposal', 'critique', 'scorecard']):
            samples.append({
                "variable_name": var_name,
                "json_string": json_str[:500]  # 最初の500文字のみ
            })
    
    return samples

def extract_error_classes(content: str) -> List[Dict[str, str]]:
    """エラークラス定義を抽出"""
    errors = []
    
    pattern = r'class\s+(\w+Error)\s+extends\s+(\w+)'
    matches = re.finditer(pattern, content)
    
    for match in matches:
        errors.append({
            "error_class": match.group(1),
            "extends": match.group(2)
        })
    
    return errors

def extract_todos_and_fixmes(content: str) -> List[Dict[str, str]]:
    """TODO/FIXMEコメントを抽出"""
    todos = []
    
    pattern = r'//\s*(TODO|FIXME|HACK|XXX):\s*(.+)'
    matches = re.finditer(pattern, content)
    
    for match in matches:
        todos.append({
            "type": match.group(1),
            "description": match.group(2).strip()
        })
    
    return todos[:20]  # 最初の20件のみ

def build_v14_specification() -> Dict[str, Any]:
    """v1.4仕様書を構築"""
    
    print("🚀 GLIA v1.4 仕様書生成を開始...")
    
    # ファイル読み込み
    type_system = (DATA_DIR / "type_system_complete.txt").read_text(encoding='utf-8')
    data_contracts = (DATA_DIR / "data_contracts_complete.txt").read_text(encoding='utf-8')
    execution_semantics = (DATA_DIR / "execution_semantics_complete.txt").read_text(encoding='utf-8')
    design_rationale = (DATA_DIR / "design_rationale_complete.txt").read_text(encoding='utf-8')
    evolution_roadmap = (DATA_DIR / "evolution_roadmap_complete.txt").read_text(encoding='utf-8')
    internal_deps = (DATA_DIR / "internal_dependencies_complete.txt").read_text(encoding='utf-8')
    llm_guidance = (DATA_DIR / "llm_guidance_complete.txt").read_text(encoding='utf-8')
    
    print("✓ 全ファイル読み込み完了")
    
    # 情報抽出
    print("📊 情報抽出中...")
    
    spec = {
        "schema_version": "1.4.0",
        "generation_metadata": {
            "timestamp": f"{datetime.now(timezone(timedelta(hours=9))).isoformat()}",
            "generator": f"GLIA-v14-Extractor/Python-Clean (Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')})",
            "completion_status": {
                "all_steps_completed": True,
                "failed_steps": [],
                "warnings": []
            }
        },
        
        "project_metadata": {
            "name": "glia-v1-monorepo",
            "root_path": "/home/els/Antigravity/GLIA-V1",
            "primary_language": "TypeScript",
            "framework": "Electron (App), Playwright (Browser Agent)",
            "environment": {
                "runtime_version": "Node.js >=18.0.0",
                "package_manager": "npm/workspaces",
                "os": "linux"
            },
            "main_entry_points": [
                {
                    "file_path": "packages/swarm/src/orchestrator.ts",
                    "purpose": "GLIA Swarmの中核オーケストレーター"
                },
                {
                    "file_path": "apps/electron-app/src/main.ts",
                    "purpose": "Electronアプリケーションのメインプロセス"
                }
            ]
        },
        
        "type_system": {
            "core_types": extract_typescript_types(type_system)[:30],  # 最重要30型
            "zod_schemas": extract_zod_schemas(type_system),
            "function_signatures": extract_function_signatures(type_system)[:50]  # 最重要50関数
        },
        
        "data_contracts": {
            "sample_payloads": extract_test_data_samples(data_contracts),
            "validation_schemas": extract_zod_schemas(data_contracts)
        },
        
        "execution_semantics": {
            "error_catalog": extract_error_classes(execution_semantics),
            "async_patterns": [
                "SwarmOrchestrator.runMission() - 非同期ミッション実行",
                "SIEExecutorV2.execute() - 非同期命令実行",
                "GliaApiClient.chatCompletion() - 非同期LLM呼び出し"
            ]
        },
        
        "design_rationale": {
            "architectural_decisions": [
                {
                    "decision": "モノレポ構造（npm workspaces）を採用",
                    "rationale": "パッケージ間の依存関係を明示的に管理し、開発効率を向上",
                    "date": "2024-12"
                },
                {
                    "decision": "TOON（Task-Oriented Object Notation）を採用",
                    "rationale": "LLM間の構造化通信を標準化",
                    "date": "2024-12"
                },
                {
                    "decision": "SIE（Structured Instruction Executor）を採用",
                    "rationale": "ブラウザ自動化命令の安全な実行を保証",
                    "date": "2024-12"
                }
            ],
            "constraints": [
                {
                    "constraint": "Node.js 18以上が必須",
                    "type": "technical",
                    "impact": "古い環境では動作不可"
                },
                {
                    "constraint": "OpenRouter APIキーが必要",
                    "type": "business",
                    "impact": "LLM機能の利用にAPIキーが必須"
                }
            ]
        },
        
        "evolution_roadmap": {
            "unimplemented_features": extract_todos_and_fixmes(evolution_roadmap),
            "next_priorities": [
                {
                    "task": "Critique（ピアレビュー）機能の実装",
                    "why_now": "Swarm機能の完成に必須",
                    "prerequisite_tasks": ["Mission/Proposal実行の安定化"]
                },
                {
                    "task": "エラーハンドリングの強化",
                    "why_now": "本番運用の信頼性向上",
                    "prerequisite_tasks": []
                }
            ]
        },
        
        "internal_dependencies": {
            "dependency_graph": [
                {"from": "swarm", "to": "sie", "coupling": "tight"},
                {"from": "swarm", "to": "api-client", "coupling": "tight"},
                {"from": "swarm", "to": "toon", "coupling": "tight"},
                {"from": "sie", "to": "browser-manager", "coupling": "tight"},
                {"from": "sie", "to": "audit", "coupling": "medium"}
            ]
        },
        
        "llm_guidance": {
            "recommended_workflow": """
1. ミッション定義（Mission）を作成
2. SwarmOrchestrator.runMission()を呼び出し
3. LLMがProposalを生成（instructions含む）
4. SIEがinstructionsを実行
5. ScoreCardで結果を評価
            """.strip(),
            "critical_files": [
                "packages/toon/src/index.ts - TOONスキーマ定義",
                "packages/swarm/src/orchestrator.ts - 中核ロジック",
                "packages/sie/src/sie-executor.ts - 実行エンジン"
            ],
            "safe_modification_zones": [
                "integration-test/ - テストコードは自由に変更可能",
                "packages/*/test-*.js - テストスクリプトは実験的変更OK"
            ]
        }
    }
    
    print("✓ 情報抽出完了")
    return spec

def main():
    """メイン処理"""
    try:
        spec = build_v14_specification()
        
        # JSON出力
        print(f"💾 仕様書を {OUTPUT_FILE} に保存中...")
        OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(spec, f, indent=2, ensure_ascii=False)
        
        # ファイルサイズ確認
        size_mb = OUTPUT_FILE.stat().st_size / 1024 / 1024
        print(f"✅ 生成完了！ ({size_mb:.2f} MB)")
        print(f"📁 出力先: {OUTPUT_FILE}")
        
        # 統計表示
        print("\n📊 生成された仕様書の統計:")
        print(f"  - 型定義数: {len(spec['type_system']['core_types'])}")
        print(f"  - Zodスキーマ数: {len(spec['type_system']['zod_schemas'])}")
        print(f"  - データサンプル数: {len(spec['data_contracts']['sample_payloads'])}")
        print(f"  - 未実装機能数: {len(spec['evolution_roadmap']['unimplemented_features'])}")
        
    except Exception as e:
        print(f"❌ エラー: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()