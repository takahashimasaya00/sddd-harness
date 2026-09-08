---
name: sddd-spec-ado
description: >-
  Design and flesh out Azure DevOps work items (PBI, Bug) at an architectural and technical specification level using grill-with-docs.
  Takes into account docs/design/ (design concept, design tokens) if present, and generates or updates docs/spec (data-models, features, system-architecture), docs/adr, and outputs implementation steps as child Task work items in Azure DevOps.
  Always trigger this skill whenever the user mentions designing, architectural refinement, technical specification,
  or creating development tasks/roadmaps for an Azure DevOps work item, PBI, Bug.
---

# Azure DevOps Work Item Design (`sddd-spec-ado`)

Azure DevOpsで管理されているワークアイテム（Product Backlog Item, Bug）を取得し、`grill-with-docs` のアプローチで**実装を考慮した設計レベル（アーキテクチャ・データモデル・機能仕様）**を徹底的につき詰め（Grilling）、合意された内容をリポジトリ内の `docs/`（spec, adr、必要に応じてdesign）へ体系的に反映し、具体的な実装ステップをADOの子Taskとして起票するスキル。
リポジトリ内に `docs/design/` フォルダが存在する場合は、記載されているデザインコンセプトやデザイントークンも前提として考慮し、UI仕様やステート設計をつき詰める。

---

## 核心原則: クラス単位ではなく「設計レベル」に集中

- **対象（設計レベル - Architecture / Model / Interface）**:
  - システム構成・コンポーネント間の責務境界（Angular, NestJS, Cosmos DB, Azure Blob Storage 等）
  - データモデル定義（Cosmos DB ドキュメント構造、型定義、パーティションキー、整合性制約）
  - API / 通信インターフェース（エンドポイントパス、HTTPメソッド、DTO、ステータスコード）
  - 全体機能マップの更新、UIステート（Loading / Success / Empty / Error）と画面フロー（`docs/design/` がある場合はそのデザインコンセプト・トークンを前提とする）
  - トレードオフを伴う技術決定（ADR起票の3条件に合致するもの）
  - 異常系、セキュリティ、エラーハンドリング、非機能要件
  - 段階的な実装ステップ（ADO Taskの起票）
- **対象外（実装詳細 - Micro Coding Details）**:
  - クラス内部の個別メソッド実装コード、ローカル変数名、詳細なCSSプロパティ値など。これらはADO Taskに基づく実装フェーズで決定する。
- **ユーザー承認駆動のADO起票 (Human-in-the-Loop)**:
  - 設計草案（Blueprint）を作成した後、**Azure DevOpsへTaskを起票する前に、必ず設計内容および起票予定のTask一覧（タイトル・概要・対応スライス）を提示してユーザーから明示的な承諾（LGTM）を得る**。
  - ユーザーからの明示的な承諾を得るまで、勝手にADOのTask起票ツール（`wit_work_item_write`）を実行してはならない。
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
   - `System.Description`: 要件・概要
   - `Microsoft.VSTS.Common.AcceptanceCriteria`: 受入基準 (PBIの場合)
   - `Microsoft.VSTS.TCM.ReproSteps`: 再現手順・不具合内容 (Bugの場合)
   - 親Feature / 子Task などのリンク関係
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

### Step 3: 設計草案（Blueprint）の作成 (`docs/proposals/`)

**重要**: この時点では `docs/spec/` などの既存仕様ドキュメントを**直接書き換えない**こと。Phantom Spec（幻の仕様）問題を防ぐため、仕様の反映は各Taskの実装完了時に行う（JIT同期）。

合意された設計内容は、PBI単位の設計草案として `docs/proposals/pbi-<ID>.md` という新規ファイルにまとめて出力する。

#### 1. Blueprint の構成
草案（Blueprint）ファイルには以下を含める：
- **PBIの目的と概要**
- **全体設計の差分**: `docs/spec/` (data-models.md, features.md, system-architecture.md) や `CONTEXT.md` に追加・変更すべき内容の**完成形**。
- **Taskへのスライス（分割割り当て）**: 後続の実装エージェントが迷わないよう、「Step 1完了時にはこの部分を `docs/spec/data-models.md` にマージする」「Step 2完了時にはこの部分を `features.md` にマージする」といった具体的な適用パッチ（差分）を、Stepごとにセクションを分けて明確に記載する。

#### 2. ADRの起票 (`docs/adr/`)
- 設計Grillingの中で「不可逆性」「意外性」「明確なトレードオフ」を満たす重要な意思決定があった場合のみ新規起票する。
- （ADRはシステムの現在の状態（Fact）というより歴史的決定の記録であるため、この段階で直接起票・コミットしてよい）
- 詳細は [adr-template.md](./references/adr-template.md) を参照。

#### 3. デザイン仕様の更新 (`docs/design/`) ※該当する場合
- 新たなデザイントークンの追加が必要な場合、これも `docs/proposals/pbi-<ID>.md` のUIタスクパッチとして含めるか、内容に応じて先行して `docs/design/` を更新する。

---

### Step 4: 設計草案 & 起票予定Task案の提示・ユーザー確認 & 承諾 (LGTM)

作成した設計草案（Blueprint）および Azure DevOps に起票予定の Task 一覧をユーザーに提示し、**起票前に必ず承認（LGTM）を求める**。

#### 提示フォーマット例
```markdown
# 📋 [Design Blueprint & Tasks プレビュー] #<親ID> <親タイトル>

### 設計概要
- **草案ファイル**: `docs/proposals/pbi-<ID>.md`
- **アーキテクチャ・データモデル・機能仕様の要約**: ...
- **ADR起票**: `docs/adr/XXXX-xxx.md` (該当する場合)

### 起票予定の ADO Task 一覧
1. **Step 1: <概要>**
   - **目的**: <簡単な目的>
   - **対応スライス**: Blueprint「Step 1」セクション（データモデル・スキーマ定義など）
2. **Step 2: <概要>**
   - **目的**: <簡単な目的>
   - **対応スライス**: Blueprint「Step 2」セクション（APIエンドポイント実装など）
3. **Step 3: <概要>**
   - **目的**: <簡単な目的>
   - **対応スライス**: Blueprint「Step 3」セクション（フロントエンドUI実装など）
```

#### ユーザー確認の必須ルール
1. 設計草案のサマリーと起票予定の Task 一覧を提示し、確認とフィードバックを求める。
2. **重要制約**: ユーザーから明示的な承諾（「OK」「Taskを作成して」「LGTM」など）を得るまで、**絶対にStep 5（ADO Task起票）には進まないこと**。
3. ユーザーから修正要望や追加指示があった場合は、設計草案やTask分割案を修正して再度確認を得る。

---

### Step 5: ユーザー承認後の実装ステップ ADO Task 起票

**Step 4でユーザーから明示的な承諾（LGTM）を得た後のみ**、設計草案（Blueprint）に基づき、対象のワークアイテム（PBIなど）の子アイテムとして、具体的な実装ステップを `Task` ワークアイテムとして ADO 上に作成する。

1. **Taskの切り出し**:
   - フロントエンド、バックエンド、データベース設定など、論理的でアサイン可能な粒度でTaskを定義する。（Step 3のBlueprintのスライスおよびStep 4で合意されたTask案と一致させること）
2. **Task名（Title）の命名規則**:
   - `System.Title` は **`Step <番号>: <概要>`**（例: `Step 1: データモデル定義`, `Step 2: APIエンドポイント実装`）の形式にする。
   - ⚠️ **重要**: 「Task 1」という表記は ADO Task 自身の Work Item ID（例: Task #1234）と混同しやすいため、タイトルには必ず **`Step <番号>`** を使用すること。
3. **`wit_work_item_write` を用いた起票**:
   - 各Taskに対して、`wit_work_item_write` ツールを使用してアイテムを作成する。
   - `action` を `create` とし、`type` を `Task` と設定する。
   - `parentId` に Step 1 で取得した親ワークアイテムの ID を指定する。
   - `title` に上記命名規則に沿ったタイトル（`Step <番号>: <概要>`）を指定する。
4. **Task Description（詳細）の記述ルール**:
   - `System.Description` フィールドには、**長文のプロンプト指示や成果物リストを直接書き込まない**（ADOのUI肥大化防止）。
   - 代わりに、Step 3 で作成した草案ファイルへの参照を記載し、ADOをシンプルに保つ。
   - **記述例**:
     ```html
     <p><strong>目的</strong>: [Taskの簡単な目的]</p>
     <p><strong>詳細および仕様反映パッチ</strong>: <code>docs/proposals/pbi-<ID>.md</code> の「Step X」のセクションを参照し、実装と仕様の同期（JIT同期）を行ってください。</p>
     ```

5. 作成後、起票したすべての Task の ID とタイトル、ならびに作成した `docs/proposals/` ファイルのパスをユーザーに報告する。
6. **コミットメッセージ案**: 報告の最後に、Conventional Commit形式に則ったコミットメッセージ案（追加・更新したファイルと対象のADO PBI/Bug IDを含めること）を提示する。
