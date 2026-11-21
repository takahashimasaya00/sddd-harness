---
name: sddd-spec-ado
description: >-
  Design and flesh out Azure DevOps work items (PBI, Bug) at an architectural and technical specification level using grill-with-docs.
  Takes into account docs/design/ (design concept, design tokens) if present, writes a technical design summary to the parent work item,
  outputs detailed implementation steps as child Task work items in Azure DevOps, and creates docs/adr (or updates docs/design) when needed.
  Always trigger this skill whenever the user mentions designing, architectural refinement, technical specification,
  or creating development tasks/roadmaps for an Azure DevOps work item, PBI, Bug.
---

# Azure DevOps Work Item Design (`sddd-spec-ado`)

Azure DevOpsで管理されているワークアイテム（Product Backlog Item, Bug）を取得し、`grill-with-docs` のアプローチで**実装を考慮した設計レベル（アーキテクチャ・データモデル・機能仕様）**を徹底的につき詰め（Grilling）、合意された全体設計サマリーを**親ワークアイテム**へ追記し、具体的な実装ステップを**子Task**として Azure Boards 上に起票するスキル。
また、重要な技術意思決定がある場合は `docs/adr/` へADRを起票し、リポジトリ内に `docs/design/` フォルダが存在する場合は記載されているデザインコンセプトやデザイントークンも前提として考慮し、UI仕様やステート設計をつき詰める。

---

## 核心原則: クラス単位ではなく「設計レベル」に集中

- **対象（設計レベル - Architecture / Model / Interface）**:
  - システム構成・コンポーネント間の責務境界（Angular, NestJS, Cosmos DB, Azure Blob Storage 等）
  - データモデル定義（Cosmos DB ドキュメント構造、型定義、パーティションキー、整合性制約）
  - API / 通信インターフェース（エンドポイントパス、HTTPメソッド、DTO、ステータスコード）
  - 全体機能マップの更新、UIステート（Loading / Success / Empty / Error）と画面フロー（`docs/design/` がある場合はそのデザインコンセプト・トークンを前提とする）
  - トレードオフを伴う技術決定（ADR起票の3条件に合致するもの）
  - 異常系、セキュリティ、エラーハンドリング、非機能要件
  - 段階的な実装ステップ（ADO 子Taskの起票）
- **対象外（実装詳細 - Micro Coding Details）**:
  - クラス内部の個別メソッド実装コード、ローカル変数名、詳細なCSSプロパティ値など。これらはADO Taskに基づく実装フェーズで決定する。
- **Phantom Spec（幻の仕様）の防止**:
  - この時点では `docs/spec/` などの既存仕様ドキュメントを**直接書き換えない**こと。仕様書への反映は、各Taskの実装完了時に `sddd-implement-ado` が行う（JIT同期）。
- **Azure Boards への役割分担出力**:
  - リポジトリに一時的な草案Markdownファイル（`docs/proposals/` 等）は作成せず、**親ワークアイテム（全体設計の見取り図）** と **子Task（Stepごとの実装指示＋JIT同期対象）** へ役割分担して Azure Boards 上に直接出力する。
- **ユーザー承認駆動の一括反映 (Human-in-the-Loop)**:
  - **Azure DevOpsへの更新・Task起票およびリポジトリファイル出力（ADR等）を行う前に、必ず反映内容のプレビューを提示してユーザーから明示的な承諾（LGTM）を得る**。
  - ユーザーからの明示的な承諾を得るまで、勝手にADOの更新・起票ツール（`wit_work_item_write`）やファイル作成を実行してはならない。
- 詳細は [design-guidelines.md](./references/design-guidelines.md) を参照。

---

## ワークフロー手順

### Step 1: Azure DevOps ワークアイテムの取得 & 前提調査

1. ユーザーから Work Item ID（例: `#123` または `123`）を受け取る。
2. Azure DevOps MCP の `wit_work_item` を実行してアイテム詳細を取得する。
   ```json
   {
     "action": "get",
     "id": <WorkItemId>,
     "expand": "All"
   }
   ```
3. 取得した情報から以下を把握する：
   - `System.WorkItemType`: 種別 (`Product Backlog Item`, `Bug` 等)
   - `System.Title`: タイトル
   - `System.Description`: 要件・概要（および既存の「技術設計サマリー」セクションの有無・フォーマット形式 HTML / Markdown）
   - `Microsoft.VSTS.Common.AcceptanceCriteria`: 受入基準 (PBIの場合)
   - `Microsoft.VSTS.TCM.ReproSteps`: 再現手順・不具合内容 (Bugの場合)
   - 親Feature / 既存の子Task などのリンク関係（既に子Taskが存在する場合はそのID・タイトルも確認しておく）
4. **前提ドキュメントの事前調査**:
   - 既存の `docs/spec/system-architecture.md`, `docs/spec/data-models.md`, `docs/spec/features.md`, `docs/adr/`, `CONTEXT.md` を読み込み、現在のシステム状態と用語を把握する。
   - **デザインコンセプトの確認 (`docs/design/`)**:
     - `docs/design/` ディレクトリが存在するか確認する。
     - 存在する場合、`docs/design/concept.md`（デザイン哲学・ペルソナ・トーン＆マナー・レイアウト/インタラクション原則）および `docs/design/tokens.md`（カラー・タイポグラフィ・スペーシング等のトークン定義）を読み込む。
     - UI/UXや画面仕様の検討において、これらデザインコンセプト・トークンと矛盾しないよう前提知識としてインプットする。

---

### Step 2: 設計レベルの Grilling (`grill-with-docs` 統合)

`grill-with-docs`（`grilling` + `domain-modeling`）を適用し、設計ツリー（Design Tree）を展開してフロンティア（未決の設計判断事項）をラウンド制でインタビューする。

#### インタビューの基本ルール
- **推論ツリー展開**: 前提条件が整っているフロンティアの質問をラウンドごとにまとめて提示する。
- **推奨解（💡 Recommended Answer）の提示**: 単に質問を投げるのではなく、既存アーキテクチャ・ベストプラクティスを踏まえた具体的な推奨解とその理由を必ず併記する。
- **デザインコンセプトに根ざした提案**: `docs/design/` が存在する場合、UIステートや画面フローの設計判断において、定義されているトンマナ（世界観、質感）やカラールールに基づいた推奨解を提示する（例: 「`docs/design/concept.md` で定義された穏やかで信頼感あるトンマナに合わせ、エラー時はモーダルではなくインラインアラート表示＋再試行ボタンを推奨」など）。
- **事実調査はエージェントの責務**: リポジトリの既存コードや設定ファイル、Bicep、既存ドキュメントから確認できる事実（Fact）はエージェント自身で調べ、ユーザーには「決定（Decision）」だけを問う。

#### ラウンド質問のフォーマット例
```markdown
🔹 **Q1** - **<設計判断タイトル>**: <設計上の背景・選択肢の比較>
💡 **推奨**: <推奨する設計方針とその理由>

---

🔹 **Q2** - **<設計判断タイトル>**: <設計上の背景・選択肢の比較>
💡 **推奨**: <推奨する設計方針とその理由>
```

#### 主な深掘り観点
1. **コンポーネント構成 & API**: 新規エンドポイントのパス・メソッド・DTOはどうするか？どのサービスに配置するか？
2. **データモデル**: 新規エンティティ/フィールドは必要か？Cosmos DBのパーティションキー・型定義はどうするか？
3. **UI / 機能仕様**: 画面遷移や状態管理（ローディング、空表示、エラー表示、再試行）の振る舞いはどうするか？`docs/design/` のデザイン原則やトークンと調和しているか？
4. **アーキテクチャトレードオフ**: 代替案（Approach A vs Approach B）はあるか？ADRを起票すべき不可逆な決定か？
5. **ドメイン用語**: 新たに導入された概念や境界は明確か？

全フロンティアが解消し、ユーザーから設計内容の合意（LGTM）を得たら Step 3 へ進む。

---

### Step 3: 反映内容のプレビュー提示 & ユーザー確認・承諾 (LGTM)

Grillingで合意した内容を、**親ワークアイテム追記案**・**子Task一覧**・**リポジトリ出力ファイル案（該当する場合のみ）** として整理し、**反映前に必ずユーザーへ提示して承認（LGTM）を求める**。

#### 提示フォーマット例
```markdown
# 📋 [Technical Design & Tasks プレビュー] #<親ID> <親タイトル>

### 1. 親ワークアイテム追記予定（技術設計サマリー）
- **アーキテクチャ方針**: ...
- **データモデル変更概要**: ...
- **API・インターフェース概要**: ...
- **UI・画面フロー概要**: ...
- **関連ADR**: `docs/adr/XXXX-xxx.md` *(該当する場合のみ)*

### 2. 起票（/更新）予定の ADO 子Task 一覧
1. **Step 1: <概要>** *(新規起票 / 既存 #<TaskID> 更新)*
   - **目的**: <簡単な目的>
   - **対象ファイル**: `path/to/file1`, `path/to/file2`
   - **JIT同期対象**: `docs/spec/data-models.md`（`XxxEntity` の追記）
   - **検証コマンド**: `npm run test`
2. **Step 2: <概要>** *(新規起票)*
   - **目的**: <簡単な目的>
   - **対象ファイル**: ...
   - **JIT同期対象**: `docs/spec/features.md`（API/画面仕様の追記）
   - **検証コマンド**: `npm run lint`, `npm run test`

### 3. リポジトリ出力予定（該当する場合のみ）
- **ADR起票**: `docs/adr/XXXX-xxx.md`
- **デザイン仕様更新**: `docs/design/tokens.md`
```

#### ユーザー確認の必須ルール
1. 上記プレビューを提示し、確認とフィードバックを求める。
2. **再設計・既存子Taskがある場合の扱い**:
   - 親ワークアイテムに既に「技術設計サマリー」セクションがある場合は、既存要件を保持したまま設計サマリー部分のみ差し替える旨を明示する。
   - 既に子Taskが存在する場合は勝手に重複起票せず、各既存Taskを「更新 / 新規追加 / 維持」のいずれにするかをプレビューで明示し、ユーザーの確認を得る。
3. **重要制約**: ユーザーから明示的な承諾（「OK」「反映して」「LGTM」など）を得るまで、**絶対にStep 4（ADO反映およびファイル出力）には進まないこと**。
4. ユーザーから修正要望や追加指示があった場合は、内容を修正して再度確認を得る。

---

### Step 4: ユーザー承認後の一括反映 & 完了報告

**Step 3でユーザーから明示的な承諾（LGTM）を得た後のみ**、以下の反映処理を実行する。

#### 1. 親ワークアイテムへの「技術設計サマリー」追記 (`wit_work_item_write`)
- `wit_work_item_write`（`action: "update"`）を使用し、親ワークアイテムの `System.Description` にコンパクトな見取り図として「技術設計サマリー」を追記し、`System.History` に実施ログを残す。
- **既存内容の保護とフォーマット整合**:
  - 元々書かれているユーザーストーリーや要件は絶対に消さず、末尾に区切り線と専用セクション（`技術設計サマリー`）を追記する。すでに同セクションが存在する場合は、そのセクションのみを最新内容へ差し替える。
  - 既存の `System.Description` の形式（HTML / Markdown）を確認し、表示崩れが起きないよう既存形式に合わせて記述する。
  - 親が `Bug` の場合も、`Microsoft.VSTS.TCM.ReproSteps` には触れず `System.Description` に記載する。
- **親ワークアイテムに記載する項目（コンパクト構成）**:
  - アーキテクチャ方針
  - データモデル変更概要
  - API・インターフェース概要
  - UI・画面フロー概要
  - 関連ADR（起票した場合）
- **更新パラメータ例**:
  ```json
  {
    "action": "update",
    "id": <ParentWorkItemId>,
    "updates": [
      {
        "op": "replace",
        "path": "/fields/System.Description",
        "value": "<既存のDescription>\n<hr/>\n<h2>📐 技術設計サマリー (Technical Design)</h2>\n..."
      },
      {
        "op": "add",
        "path": "/fields/System.History",
        "value": "🤖 **AI Technical Design Complete**<br/>技術設計サマリーを追記し、実装ステップの子Taskを起票しました。"
      }
    ]
  }
  ```

#### 2. 実装ステップの子Task 起票・更新 (`wit_work_item_write`)
- フロントエンド、バックエンド、データベース設定など、論理的でアサイン可能な粒度でTaskを切り出す（Step 3で合意したTask案と一致させること）。
- **Task名（Title）の命名規則**:
  - `System.Title` は **`Step <番号>: <概要>`**（例: `Step 1: データモデル定義`, `Step 2: APIエンドポイント実装`）の形式にする。
  - ⚠️ **重要**: 「Task 1」という表記は ADO Task 自身の Work Item ID（例: Task #1234）と混同しやすいため、タイトルには必ず **`Step <番号>`** を使用すること。
- **新規起票 (`action: "add_child"`)**:
  - `wit_work_item_write` の `add_child` アクションを使用し、`workItemType: "Task"`, `parentId: <親ワークアイテムID>`, `format: "Markdown"` で一括起票する。
  - *(既存Taskの更新がStep 3で合意された場合は、該当Taskに対して `action: "update"` を使用する)*
  ```json
  {
    "action": "add_child",
    "parentId": <ParentWorkItemId>,
    "workItemType": "Task",
    "items": [
      {
        "title": "Step 1: <概要>",
        "description": "<以下の標準テンプレートに沿ったMarkdown>",
        "format": "Markdown"
      }
    ]
  }
  ```
- **Task Description（詳細）の標準テンプレート（Markdown）**:
  - `sddd-implement-ado`（特に下級モデル）が迷わず実装・検証・JIT同期を実行できるよう、以下の6項目を標準テンプレートとして記載する。
  - **注意**: `docs/spec/` への長大な差分パッチ本文は書かず、「更新対象ドキュメントと反映すべき要点」に留める（実際の文書同期は実装完了時に `sddd-implement-ado` が自律的に行う）。
  ```markdown
  ### 🎯 目的 (Goal)
  - <このStepで達成すること>

  ### 🔗 前提・依存Step *(該当する場合のみ)*
  - Step X の完了が前提

  ### 📁 変更・新規作成対象ファイル
  - `path/to/file1.ts` (新規 / 変更)
  - `path/to/file2.spec.ts` (新規 / 変更)

  ### 🛠️ 設計・実装方針
  - **参照仕様・型・API**: <関連するエンティティ名、エンドポイント、DTO等>
  - **実装ポイント**: <責務境界、エラーハンドリング、UIステート等>
  - **デザイン適用方針** *(UI変更を伴う場合)*: <`docs/design/concept.md`, `tokens.md` に基づく適用ポイント>

  ### 📝 仕様ドキュメント同期対象 (JIT Sync)
  - `docs/spec/<対象ファイル>.md`: <実装完了時に反映すべき要点（型名・エンドポイント・画面仕様等）>

  ### ✅ 検証コマンド・完了条件
  - 実行コマンド: `npm run test`, `npm run lint`, `npm run build` 等
  - 完了条件: <テスト通過、受入基準との整合観点>
  ```

#### 3. 永続ドキュメントの出力（該当する場合のみ）
- **ADRの起票 (`docs/adr/`)**:
  - 設計Grillingの中で「不可逆性」「意外性」「明確なトレードオフ」を満たす重要な意思決定があった場合のみ新規起票する。
  - 詳細は [adr-template.md](./references/adr-template.md) を参照。
- **デザイン仕様の更新 (`docs/design/`)**:
  - 新たなデザイントークンの追加など先行更新が必要な場合のみ更新する。
- **重要**: `docs/spec/` 自体はここでは変更しない（実装完了時のJIT同期に委ねる）。

#### 4. 完了報告
- 以下をユーザーに分かりやすく報告する：
  - 更新した親ワークアイテムの ID・タイトル
  - 起票（および更新）したすべての **子Task の ID とタイトル**
  - リポジトリに出力した永続ドキュメント（`docs/adr/`, `docs/design/`）のパス（該当する場合のみ）
- **コミットメッセージ案**: リポジトリ内のファイル（`docs/adr/`, `docs/design/` 等）を作成・更新した場合のみ、報告の最後に Conventional Commit 形式に則ったコミットメッセージ案（変更ファイルと対象のADO PBI/Bug IDを含めること）を提示する。
