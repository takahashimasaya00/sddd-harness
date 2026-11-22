---
name: sddd-spec
description: >-
  Design and flesh out local backlog items (PBI, Bug under docs/backlog/) at an architectural and technical specification level using grill-with-docs.
  Takes into account docs/design/ (design concept, design tokens) if present, appends a technical design summary to the parent item file,
  outputs detailed implementation steps as child Task Markdown files (task-XX-*.md) in the same folder, and creates docs/adr (or updates docs/design) when needed.
  Always trigger this skill whenever the user mentions designing, architectural refinement, technical specification,
  or creating development tasks/roadmaps for a local backlog item without Azure DevOps.
---

# Local Backlog Item Design (`sddd-spec`)

`docs/backlog/` で管理されているバックログアイテム（PBI, Bug）またはユーザーからの指定を受け、`grill-with-docs` のアプローチで**実装を考慮した設計レベル（アーキテクチャ・データモデル・機能仕様）**を徹底的につき詰め（Grilling）、合意された全体設計サマリーを**親アイテムファイル**へ追記し、具体的な実装ステップを**子Taskファイル（`task-XX-*.md`）**として同フォルダ内に書き出すスキル。
また、重要な技術意思決定がある場合は `docs/adr/` へADRを起票し、リポジトリ内に `docs/design/` フォルダが存在する場合は記載されているデザインコンセプトやデザイントークンも前提として考慮し、UI仕様やステート設計をつき詰める。

---

## 核心原則: クラス単位ではなく「設計レベル」に集中

- **対象（設計レベル - Architecture / Model / Interface）**:
  - システム構成・コンポーネント間の責務境界（フロントエンド、バックエンド、DB、ストレージ等）
  - データモデル定義（エンティティ構造、型定義、キー設計、整合性制約）
  - API / 通信インターフェース（エンドポイントパス、HTTPメソッド、DTO、ステータスコード）
  - 全体機能マップの更新、UIステート（Loading / Success / Empty / Error）と画面フロー（`docs/design/` がある場合はそのデザインコンセプト・トークンを前提とする）
  - トレードオフを伴う技術決定（ADR起票の3条件に合致するもの）
  - 異常系、セキュリティ、エラーハンドリング、非機能要件
  - 段階的な実装ステップ（`docs/backlog/<###>-<slug>/task-XX-*.md` の作成）
- **対象外（実装詳細 - Micro Coding Details）**:
  - クラス内部の個別メソッド実装コード、ローカル変数名、詳細なCSSプロパティ値など。これらは `sddd-implement` による実装フェーズで決定する。
- **Phantom Spec（幻の仕様）の防止**:
  - この時点では確定仕様である `docs/spec/` を**直接書き換えない**こと。仕様書への反映は、各Taskの実装完了時に `sddd-implement` が行う（JIT同期）。
  - 設計サマリーと作業計画は `docs/spec/` と分離された **`docs/backlog/`** に役割分担して出力する。
- **ユーザー承認駆動の一括反映 (Human-in-the-Loop)**:
  - **ファイル作成・更新（親アイテム追記・子Task書き出し・ADR等）を行う前に、必ず反映内容のプレビューを提示してユーザーから明示的な承諾（LGTM）を得る**。
  - ユーザーからの明示的な承諾を得るまで、勝手にファイルの作成・更新を実行してはならない。
- 詳細は [design-guidelines.md](./references/design-guidelines.md) および [backlog-format.md](./references/backlog-format.md) を参照。

---

## ワークフロー手順

> [!NOTE]
> **ポリレポ / マルチルートワークスペース対応**: ワークスペース内に複数リポジトリ（複数ルート、または直下の子ディレクトリに複数の `.git`）が存在する場合は、[polyrepo-guidelines.md](./references/polyrepo-guidelines.md) を読み込み、そのルールを併せて適用すること。

### Step 1: バックログアイテムの取得 & 前提調査

1. ユーザーから対象のバックログアイテム（ファイルパス、または `docs/backlog/` 内の ID `001` 等）を受け取る。
   - **未指定時**: `docs/backlog/` 内の `status: ready`（または `draft`）のアイテム一覧を確認し、「どのアイテムを設計しますか？」とユーザーに確認する。
2. 対象ファイル（`pbi.md` / `bug.md`）および同フォルダ内の既存 `task-*.md`（あれば）を読み込み、以下を把握する：
   - フロントマターの `id`, `type`, `title`, `status`, `parent`
   - 要件・ユーザーストーリー・受入基準・再現手順
   - 既存の「技術設計サマリー」セクションの有無
   - 親Featureファイルがある場合はその記載内容
3. **前提ドキュメントの事前調査**:
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
- **デザインコンセプトに根ざした提案**: `docs/design/` が存在する場合、UIステートや画面フローの設計判断において、定義されているトンマナ（世界観、質感）やカラールールに基づいた推奨解を提示する。
- **事実調査はエージェントの責務**: リポジトリの既存コードや設定ファイル、既存ドキュメントから確認できる事実（Fact）はエージェント自身で調べ、ユーザーには「決定（Decision）」だけを問う。

#### ラウンド質問のフォーマット例
```markdown
🔹 **Q1** - **<設計判断タイトル>**: <設計上の背景・選択肢の比較>
💡 **推奨**: <推奨する設計方針とその理由>

---

🔹 **Q2** - **<設計判断タイトル>**: <設計上の背景・選択肢の比較>
💡 **推奨**: <推奨する設計方針とその理由>
```

#### 主な深掘り観点
1. **コンポーネント構成 & API**: 新規エンドポイントのパス・メソッド・DTOはどうするか？どのサービス・モジュールに配置するか？
2. **データモデル**: 新規エンティティ/フィールドは必要か？キー設計・型定義・整合性制約はどうするか？
3. **UI / 機能仕様**: 画面遷移や状態管理（ローディング、空表示、エラー表示、再試行）の振る舞いはどうするか？`docs/design/` のデザイン原則やトークンと調和しているか？
4. **アーキテクチャトレードオフ**: 代替案（Approach A vs Approach B）はあるか？ADRを起票すべき不可逆な決定か？
5. **ドメイン用語**: 新たに導入された概念や境界は明確か？

全フロンティアが解消し、ユーザーから設計内容の合意（LGTM）を得たら Step 3 へ進む。

---

### Step 3: 反映内容のプレビュー提示 & ユーザー確認・承諾 (LGTM)

Grillingで合意した内容を、**親アイテム追記案**・**子Taskファイル一覧**・**永続ドキュメント出力案（該当する場合のみ）** として整理し、**書き出し前に必ずユーザーへ提示して承認（LGTM）を求める**。

#### 提示フォーマット例
```markdown
# 📋 [Technical Design & Tasks プレビュー] #<ID> <親タイトル>

### 1. 親アイテム追記予定 (`docs/backlog/001-<slug>/pbi.md`)
- **アーキテクチャ方針**: ...
- **データモデル変更概要**: ...
- **API・インターフェース概要**: ...
- **UI・画面フロー概要**: ...
- **関連ADR**: `docs/adr/XXXX-xxx.md` *(該当する場合のみ)*

### 2. 作成（/更新）予定の子Taskファイル一覧
1. **`task-01-<slug>.md` — Step 1: <概要>** *(新規作成 / 既存更新)*
   - **目的**: <簡単な目的>
   - **対象ファイル**: `path/to/file1`, `path/to/file2`
   - **JIT同期対象**: `docs/spec/data-models.md`（`XxxEntity` の追記）
   - **検証コマンド**: `npm run test`
2. **`task-02-<slug>.md` — Step 2: <概要>** *(新規作成)*
   - **目的**: <簡単な目的>
   - **対象ファイル**: ...
   - **JIT同期対象**: `docs/spec/features.md`（API/画面仕様の追記）
   - **検証コマンド**: `npm run lint`, `npm run test`

### 3. 永続ドキュメント出力予定（該当する場合のみ）
- **ADR起票**: `docs/adr/XXXX-xxx.md`
- **デザイン仕様更新**: `docs/design/tokens.md`
```

#### ユーザー確認の必須ルール
1. 上記プレビューを提示し、確認とフィードバックを求める。
2. **再設計・既存子Taskがある場合の扱い**:
   - 親アイテムに既に「技術設計サマリー」セクションがある場合は、既存要件を保持したまま設計サマリー部分のみ差し替える旨を明示する。
   - 既に `task-*.md` が存在する場合は勝手に重複作成せず、各既存Taskを「更新 / 新規追加 / 維持」のいずれにするかをプレビューで明示し、ユーザーの確認を得る。
3. **重要制約**: ユーザーから明示的な承諾（「OK」「反映して」「LGTM」など）を得るまで、**絶対にStep 4（ファイル作成・更新）には進まないこと**。
4. ユーザーから修正要望や追加指示があった場合は、内容を修正して再度確認を得る。

---

### Step 4: ユーザー承認後の一括反映 & 完了報告

**Step 3でユーザーから明示的な承諾（LGTM）を得た後のみ**、以下のファイル反映処理を実行する。

#### 1. 親アイテムファイルへの「技術設計サマリー」追記
- 親ファイル（`pbi.md` または `bug.md`）の元々書かれているユーザーストーリー・要件・受入基準・再現手順は絶対に消さず、末尾に区切り線（`---`）と専用セクション `## 📐 技術設計サマリー (Technical Design)` を追記する（すでに同セクションが存在する場合は、そのセクションのみを最新内容へ差し替える）。
- フロントマターの `updated_at` を更新し、末尾に子Task一覧へのリンクも記載する。
- **記載項目（コンパクト構成）**:
  - アーキテクチャ方針
  - データモデル変更概要
  - API・インターフェース概要
  - UI・画面フロー概要
  - 関連ADR（起票した場合）
  - 子Task一覧（`[Step 1: ...](./task-01-xxx.md)`）

#### 2. 実装ステップの子Taskファイル作成・更新 (`task-XX-<slug>.md`)
- 親アイテムと同じフォルダ内に、論理的で実行可能な粒度で `task-01-<slug>.md`, `task-02-<slug>.md`... を書き出す（Step 3で合意したTask案と一致させること）。
- YAMLフロントマター（`id`, `type: task`, `title: "Step X: <概要>"`, `status: todo`, `parent`, `created_at`, `updated_at`）は [backlog-format.md](./references/backlog-format.md) に従う。
- **Task 本文の標準テンプレート（Markdown）**:
  - `sddd-implement`（特に下級モデル）が迷わず実装・検証・JIT同期を実行できるよう、以下の6項目を標準テンプレートとして記載する。
  - **注意**: `docs/spec/` への長大な差分パッチ本文は書かず、「更新対象ドキュメントと反映すべき要点」に留める（実際の文書同期は実装完了時に `sddd-implement` が自律的に行う）。
  ```markdown
  # Step X: <概要>

  ### 🎯 目的 (Goal)
  - <このStepで達成すること>

  ### 🔗 前提・依存Step *(該当する場合のみ)*
  - [Step 1: ...](./task-01-xxx.md) の完了が前提

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
  - 更新した親アイテムファイルのパス・タイトル
  - 作成（および更新）したすべての **子Taskファイルのパスとタイトル**
  - リポジトリに出力した永続ドキュメント（`docs/adr/`, `docs/design/`）のパス（該当する場合のみ）
- **コミットメッセージ案**: Conventional Commit 形式に則ったコミットメッセージ案（変更ファイルと対象のアイテムIDを含めること）を提示する。
