---
name: sddd-refinement
description: >-
  Refine and clarify requirements (Feature, Product Backlog Item, User Story, Bug) using a Scrum-focused grilling interview,
  and output structured Markdown files under docs/backlog/.
  Always trigger this skill whenever the user mentions refining, fleshing out, clarifying, grilling, or detailing a backlog item,
  PBI, Feature, or Bug without Azure DevOps, or asks to prepare requirements and acceptance criteria locally.
---

# Local Backlog Item Refinement (`sddd-refinement`)

アイデアや要件、または `docs/backlog/` で管理されている既存のバックログアイテム（Feature, PBI / User Story, Bug）をもとに、スクラム開発における **Definition of Ready (DoR)** を満たすレベルまで要件と受入基準を徹底的につき詰め（Grilling）、合意形成後にリポジトリ内の `docs/backlog/` へ構造化 Markdown として書き出すスキル。

---

## 核心原則: 実装詳細への踏み込み禁止

- **フォーカス（Why & What）**:
  - ビジネス価値、ユーザー課題、ペルソナ、利用シナリオ
  - 受入基準（Given-When-Then、検証チェックリスト）
  - スコープ境界（In Scope / Out of Scope）、エラー時の振る舞い
  - Featureの場合はPBIへの分割案
- **対象外（How - 実装詳細）**:
  - クラス設計、関数・変数名、物理DBスキーマ、特定APIの内部ロジックなど。これらは次工程（`sddd-spec` / 開発タスク化）の領域のため、本スキルでは扱わない。
- **ユーザー承認駆動のファイル書き出し (Human-in-the-Loop)**:
  - 要件や受入基準を精緻化した後、**`docs/backlog/` へファイルを書き出す前に、必ず作成・更新内容のプレビューを提示してユーザーから明示的な承諾（LGTM）を得る**。
  - ユーザーからの明示的な承諾を得るまで、勝手にファイルの作成・更新を行ってはならない。
- 詳細は [scrum-guidelines.md](./references/scrum-guidelines.md) および [backlog-format.md](./references/backlog-format.md) を参照。

---

## ワークフロー手順

> [!NOTE]
> **ポリレポ / マルチルートワークスペース対応**: ワークスペース内に複数リポジトリ（複数ルート、または直下の子ディレクトリに複数の `.git`）が存在する場合は、[polyrepo-guidelines.md](./references/polyrepo-guidelines.md) を読み込み、そのルールを併せて適用すること。

### Step 1: 対象アイテムの特定（新規起票 / 既存ファイル読み込み）

1. ユーザーからの入力形式を確認する（両対応）：
   - **新規起票（口頭アイデア・プロンプト指定）**: 「〇〇機能のPBIをRefinementして」などの要望を受け取る。
   - **既存ファイルの精緻化**: `docs/backlog/` 配下の既存ファイルパスまたはアイテムID（例: `001`）を受け取り、該当ファイルを読み込む。
2. `docs/backlog/` ディレクトリを確認し、既存の採番状況（最大番号）や関連アイテムの有無を把握する（新規起票時の連番決定に使用）。
3. 必要に応じて `docs/spec/` や `CONTEXT.md` を軽く確認し、プロジェクトの前提ドメイン用語を把握する。

---

### Step 2: スクラム特化のGrilling（要件深掘りインタビュー）

`grilling` 手法に基づき、推論ツリー（Design Tree）を展開してフロンティアの質問をラウンド制で投げかける。

#### 質問のフォーマット
各ラウンドでは、未解決の前提条件のない質問（フロンティア）をまとめて提示し、**必ず推奨解（Recommended Answer）を併記**する。

```markdown
🔹 **Q1** - **<質問タイトル>**: <背景および選択肢の説明>
💡 **推奨**: <推奨する方針とその理由>

---

🔹 **Q2** - **<質問タイトル>**: <背景および選択肢の説明>
💡 **推奨**: <推奨する方針とその理由>
```

#### アイテム種別ごとの深掘りフロンティア
- **Feature**:
  - ビジネス価値 & KPI（何を達成すればこのFeatureは成功か？）
  - ターゲットペルソナ & 主要利用フロー
  - MVP（フェーズ1）と将来スコープ（フェーズ2以降）の切り分け
  - 1スプリントで完結可能なPBI群への分割案（タイトルと概要）
- **PBI / User Story**:
  - ユーザーストーリーの明確化（Who / What / Why）
  - 受入基準（Given-When-Then 形式、またはチェックリスト形式）
  - エッジケース・異常系（データ未登録、入力エラー、タイムアウト時などの画面挙動）
  - 今回のスコープ外（Out of Scope）
- **Bug**:
  - 発生環境、アカウント条件、トリガー操作
  - 期待される振る舞い vs 実際の振る舞い
  - 影響度（全ユーザーか特定データ依存か、業務影響の大きさ）
  - 修正検証の受入基準（何をどう確認すればクローズできるか）

ユーザーの回答を受け取り、新たなフロンティアを計算して次のラウンドへ進む。全ての決定事項が合意され、DoRが満たされたらStep 3へ進む。

---

### Step 3: 精緻化仕様の提示 & ユーザー確認・承認 (LGTM)

Grillingで合意した内容を整理し、**`docs/backlog/` へ書き出す前に必ず出力先パスと内容のプレビューを提示してユーザーに承認（LGTM）を求める**。

#### 提示フォーマット例 (PBIの場合)
```markdown
# 📋 [Refined PBI プレビュー] #<ID> <タイトル>
- **出力先**: `docs/backlog/001-<slug>/pbi.md`

### ユーザーストーリー
- **As a**: <ユーザー種別>
- **I want**: <機能・やりたいこと>
- **So that**: <得られる価値・目的>

### 受入基準 (Acceptance Criteria)
- [ ] **シナリオ1 (正常系)**: Given ... When ... Then ...
- [ ] **シナリオ2 (異常系)**: Given ... When ... Then ...
- [ ] **非機能基準**: レスポンスが3秒以内であること

### スコープ外 (Out of Scope)
- 〇〇の機能（次スプリントの別PBIとして対応）
```

※ Featureの場合は、上記に加えて **「分割PBI一覧（出力予定パス・タイトル・概要・受入基準ドラフト）」** を提示する。

#### ユーザー確認の必須ルール
1. プレビューを提示し、確認とフィードバックを求める。
2. **重要制約**: ユーザーから明示的な承諾（「OK」「反映して」「LGTM」など）を得るまで、**絶対にStep 4（ファイル書き出し）には進まないこと**。
3. ユーザーから修正要望や追加指示があった場合は、Grillingに戻るか仕様を調整して再度確認を得る。

---

### Step 4: ユーザー承認後の `docs/backlog/` への書き出し

**Step 3でユーザーから明示的な承認（LGTM）を得た後のみ**、ファイルの作成・更新を実行する。
フォーマットや採番・YAMLフロントマター仕様は [backlog-format.md](./references/backlog-format.md) に従うこと。

#### 1. 対象アイテムの書き出し（新規作成 / 更新）
- `docs/backlog/<###>-<slug>/<type>.md`（`feature.md` / `pbi.md` / `bug.md`）を作成または更新する。
- YAMLフロントマターの `status` は `ready` に設定し、`updated_at` を最新日付にする。

#### 2. 子PBIの一括作成 (Feature分割時)
- Featureで子PBIの分割案が合意された場合、採番ルールに従って連番フォルダ（例: `docs/backlog/002-<pbi-slug>/pbi.md`）を作成し、フロントマターの `parent` に親Featureファイルへの相対パス（例: `../001-<feature-slug>/feature.md`）を設定する。
- 親の `feature.md` 内にも分割された子PBIへのリンク一覧を記載する。

#### 3. 完了報告
- 作成・更新したファイルパスの一覧（および新設された子PBIの一覧）をユーザーに分かりやすく報告する。
- **コミットメッセージ案**: Conventional Commit 形式に則ったコミットメッセージ案（変更ファイルと対象アイテムIDを含めること）を提示する。
