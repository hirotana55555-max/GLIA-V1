# GLIA Reverse Specification

## 📁 ディレクトリ構造

```
Reverse_spec/
├── v1.4_data/                # 収集された生データ (自作コードのみ)
│   ├── type_system_complete.txt
│   ├── data_contracts_complete.txt
│   ├── execution_semantics_complete.txt
│   ├── design_rationale_complete.txt
│   ├── evolution_roadmap_complete.txt     # ライブラリTODOを除外
│   ├── internal_dependencies_complete.txt
│   └── llm_guidance_complete.txt
│
└── glia_v1.4_specification.json  # 圧縮版仕様書 (25KB) ← Antigravity用
```

## 🎯 glia_v1.4_specification.json の使い方

このファイルは、LLMに「GLIAプロジェクトの全体像」を伝えるための
コンパクトな情報源です。

### 特徴

- ✅ **自作コードのみ**を対象（`node_modules`, `.d.ts` を除外）
- ✅ **ライブラリ由来のTODO**を除外（`evolution_roadmap`の精度向上）
- ✅ **型定義、データ契約、設計根拠**を完備
- ✅ **次の実装優先順位**を明示

### Antigravityでの使用例

```
[glia_v1.4_specification.json を添付]

「このプロジェクトに○○機能を追加したい。
 既存アーキテクチャに沿った実装方法を提案してください。」
```

詳しい使用例: `SPEC/script/antigravity_examples.md`

## 🔄 更新方法

プロジェクトが大きく変更された場合：

```bash
# 1. 最新データを収集（自作コードのみ）
./SPEC/script/collect_v14_complete.sh

# 2. 仕様書を再生成（ライブラリTODOをフィルタ）
python3 SPEC/script/extract_v14.py
```

## 📊 統計情報

- スキーマバージョン: 1.4.0
- 型定義数: ~17
- データサンプル数: ~4
- 未実装機能数: ~10-20（自作コードのTODOのみ）
- フィルタリング: ✅ `.d.ts`, `node_modules`, ライブラリTODO除外

## 🧹 ノイズ除去の仕組み

### Bash収集スクリプト (`collect_v14_complete.sh`)

```bash
# .d.ts, node_modules, dist, buildを除外
find packages \
  \( -name "*.ts" ! -name "*.d.ts" \) \
  -type f \
  ! -path "*/node_modules/*" \
  ! -path "*/dist/*" \
  ! -path "*/build/*"
```

### Python抽出スクリプト (`extract_v14.py`)

```python
# ライブラリ由来のTODOを除外
LIBRARY_TODO_KEYWORDS = [
    'remove in future major',
    'remove once this package',
    'TypeScript',
    '@types/',
    'node_modules'
]
```

## 📝 生成ファイルの信頼性

- ✅ **evolution_roadmap**: 自作コードのTODO/FIXMEのみ
- ✅ **type_system**: ライブラリ型定義を除外
- ✅ **data_contracts**: テストコードのみから抽出
- ✅ **design_rationale**: SPEC文書 + package.json

---

最終更新: 2024-12-24
生成ツール: GLIA-v14-Extractor/Python-Clean