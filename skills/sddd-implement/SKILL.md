---
name: sddd-implement
description: >-
  Implement features step-by-step based on local Task Markdown files (docs/backlog/*/task-XX-*.md) created by sddd-spec.
  Inspects parent backlog item files (pbi.md, bug.md, feature.md) to understand business context, acceptance criteria, and repro steps.
  Takes into account docs/design/ (design concept, design tokens) if present to establish implementation plans.
  Follows a strict cycle: plan implementation (without modifying project files), obtain user approval, execute implementation,
  perform code review and fix findings, sync docs/spec/ (JIT Sync), run tests/verification commands, and update the Task file frontmatter status to done.
  Always trigger this skill whenever the user asks to implement, build, or develop a specific local Task file under docs/backlog/ without Azure DevOps.
---

# Local Task Implementation (`sddd-implement`)

`sddd-spec` 等によって `docs/backlog/` 配下に作成された Task ファイル（`task-XX-*.md`）、およびその**親アイテムファイル（`pbi.md`, `bug.md`, `feature.md`）**に記載された要件・受入基準・再現手順・技術設計サマリーに基づき、計画・実装・レビュー・JIT同期・テスト・ステータス更新を段階的に進める実装実行スキル。
リポジトリ内に `docs/design/` フォルダが存在する場合は、記載されているデザインコンセプトやデザイントークンも前提として考慮し、世界観・トンマナ・UI原則に調和した実装計画の立案および実装・レビューを行う。

---

## 核心原則

1. **計画段階でのファイル変更の禁止 (Read-Only Planning)**:
   - 実装計画（Step 1）の立案中は、プロジェクト内のソースコードや設定ファイル、バックログファイルに対して一切の作成・変更を行わない。ドキュメントの読み込みと調査のみを行う。
2. **ユーザー承認駆動 (Human-in-the-Loop)**:
   - 立案した実装計画をユーザーに提示し、明示的な承諾（LGTM）を得てから実装（Step 3）に着手する。
3. **親アイテムの要件・受入基準の追従 (Parent Context Alignment)**:
   - Task 単体の作業内容だけでなく、親アイテム（`pbi.md` / `bug.md` / `feature.md`）のビジネス意図、受入基準（Acceptance Criteria）、不具合再現手順（Repro Steps）を必ず確認し、実装ロジックやテストコードが親のゴールを正しく満たしているかを保証する。
4. **デザインコンセプト・トークンの尊重 (Design Consistency)**:
   - UIやスタイリングの変更を伴うステップでは、`docs/design/`（`concept.md`, `tokens.md`）が存在する場合、そこに定義されたデザイン哲学・トーン＆マナー・デザイントークン（CSS変数等）を厳格に尊重する。アドホックなカラーやマージンの直書きを禁止し、トークン体系に沿った実装計画を立てる。
5. **レビューと指摘事項の自己修正 (Review & Fix)**:
   - 実装後はコードレビューを実施し、見つかった指摘事項や改善点を速やかに修正する。（※デザイン整合性や特定観点の縛りは設けず、必要に応じて専門のレビュースキルとも連携可能とする）
6. **テスト・検証コマンドの厳守 (Test & Verify)**:
   - Task ファイルに定義された検証コマンド（`npm run test`, `npm run lint`, `npm run build` 等）を実行し、すべて成功（パス）させる。テストコードが存在する場合は必ずテストを実行する。
7. **ドキュメントのJIT同期とTaskステータス更新 (Sync & Done)**:
   - 実装と検証が完了した直後、Taskの「仕様ドキュメント同期対象（JIT Sync）」と実際の実装内容に基づき、`docs/spec/` 本体（必要に応じて `CONTEXT.md` 等）を自律的に更新（JIT同期）し、対象 Task ファイルの YAML フロントマター `status` を `done`（および `updated_at` を更新）に書き換える。

---

## ワークフロー手順

> [!NOTE]
> **ポリレポ / マルチルートワークスペース対応**: ワークスペース内に複数リポジトリ（複数ルート、または直下の子ディレクトリに複数の `.git`）が存在する場合は、[polyrepo-guidelines.md](./references/polyrepo-guidelines.md) を読み込み、そのルールを併せて適用すること。

### Step 1: Task ファイル & 親アイテムの特定 & 実装計画の立案

1. **対象 Task ファイルの特定**:
   - プロンプトから対象の Task ファイルパスまたは Task ID（例: `002-01` や `docs/backlog/002-login-screen/task-01-api.md`）を特定する。
   - **未指定時の確認**:
     - Task が明示されていない場合は、勝手に推測して進めず、`docs/backlog/` 内の `status: todo` / `in_progress` の Task 一覧を確認した上でユーザーに「どの Task を実装しますか？」と確認する。

2. **Task 情報の取得**:
   - 対象の `task-XX-*.md` を読み込み、YAML フロントマター（`id`, `title`, `status`, `parent`）および以下の項目を確認する：
     - **目的 (Goal)**: Task で達成すべきゴール
     - **前提・依存Step**: 先行して完了しているべきステップの有無（依存Taskの `status` が `done` であるかも確認）
     - **変更・新規作成対象ファイル**: 想定されるファイル一覧
     - **設計・実装方針**: 参照すべき型・API・責務境界・エラー処理・UIステート・デザイン適用方針
     - **仕様ドキュメント同期対象 (JIT Sync)**: 完了時に更新すべき `docs/spec/` ファイルと反映すべき要点
     - **検証コマンド・完了条件**: 実行すべき検証コマンドと確認観点

3. **親アイテム（`pbi.md`, `bug.md`, `feature.md`）の要件・コンテキスト調査**:
   - Task のフロントマター `parent`（または同フォルダ内の `pbi.md` / `bug.md`）を参照して親アイテムを読み込む。
   - 親アイテムにさらに `parent`（上位の `feature.md`）が指定されている場合は、必要に応じてそちらも確認する。
   - 以下の情報を把握し、Task の実装が満たすべき全体要件と設計方針を明確にする：
     - 親の種別（`pbi`, `bug`, `feature`）とタイトル・ゴール
     - ユーザーストーリー・背景・要件、および `sddd-spec` で追記された**技術設計サマリー（アーキテクチャ・データモデル・API・UI方針・関連ADR）**
     - 受入基準（PBIの場合）または再現手順・期待動作（Bugの場合）

4. **参照ドキュメント・コードの調査**:
   - Task の「設計・実装方針」「仕様ドキュメント同期対象 (JIT Sync)」および親アイテムの「技術設計サマリー」に基づき、関連する既存の `docs/spec/` や `docs/adr/`（および必要に応じて `CONTEXT.md`）を読み込み、最新の仕様状態と整合性を確認する。
   - もし他アイテムの割り込み作業等によって現状の `docs/spec/` や既存コードが Task 作成時の前提と乖離している場合は、最新の状態に合わせて実装方針を調整する前提で計画を立てる。
   - **デザインコンセプトの調査 (`docs/design/`)**:
     - `docs/design/` ディレクトリが存在するか確認する。
     - 存在する場合、`docs/design/concept.md` および `docs/design/tokens.md` を読み込み、UI実装時のトークン活用方法やトンマナを整理する。
   - 既存のソースコードを読み込み、現在の実装状態を把握する。

5. **実装計画の策定**:
   - 以下の構成で実装計画をまとめる：
     - **親アイテムの文脈**: 親の種別・ID・タイトル、および今回のTaskが寄与する受入基準や不具合事象の整理
     - **対象ステップの概要とゴール**: 今回のTask単体で達成するスコープ
     - **変更・新規作成するファイル一覧とその役割**
     - **具体的な実装ロジック・型・関数の変更点**
     - **デザインコンセプト・トークン適用方針（UI・スタイリングを伴う場合）**:
       - 適用するデザイントークン（CSS変数・ユーティリティ・テーマ値）
       - トンマナやUIステート（Loading, Empty, Error, Success）の表現方針
       - アドホックなスタイルの排除とデザイン原則への準拠方法
     - **テスト方針**: 親の受入基準や再現手順を担保するために追加・更新するテストコードの内容
     - **実行する検証コマンド**: ビルド、リント、テストコマンド一覧
   - **重要制約**: この時点では、ワークスペース内のコード・設定ファイル・バックログファイルを一切変更・作成しないこと。

---

### Step 2: ユーザー確認 & 承諾 (LGTM)

1. 立案した実装計画をユーザーに提示し、確認とフィードバックを求める。
2. ユーザーから承諾（「OK」「進めて」「LGTM」など）を得るまで、コード実装には進まない。
3. ユーザーから修正要望や追加指示があった場合は、計画を修正して再度確認を得る。

---

### Step 3: 実装の実施

1. ユーザーから承諾を得たら、計画に基づき実装に着手する。
2. 実装計画および Task ファイルの「変更・新規作成対象ファイル」に記載されたファイルを作成・変更する。
3. テストコード（ユニットテスト、統合テスト等）が含まれる、または必要な場合は、親アイテムの受入基準を満たすようテストコードも合わせて実装する。
4. ドキュメント（`docs/spec/`, `docs/adr/`, `docs/design/`）で定義された命名規則・型定義・アーキテクチャ方針、およびデザインコンセプト・デザイントークンを遵守する。
   - UI実装時は、ハードコードされたカラー値やマージン値を避け、`docs/design/tokens.md` に定義されたトークンやCSS変数を活用する。

---

### Step 4: コードレビュー & 指摘事項の修正

1. 実装・変更したすべてのファイルに対してコードレビューを実施する。
   - *(必要に応じて、別途用意されたレビュー用スキルや手順を呼び出して適用することも可能)*
2. レビュー観点：
   - **親要件・受入基準の整合性**: 親アイテムの受入基準（Acceptance Criteria）や再現手順の解消が漏れなく実装・テストで担保されているか。
   - **ロジック・型整合性**: 仕様書・ADRに合致しているか、潜在的なバグやエッジケース漏れがないか。
   - **デザイン整合性**: UIやスタイリングにおいて、`docs/design/concept.md` や `docs/design/tokens.md` の原則・トークンに準拠しているか、スタイル直書きがないか。
3. レビューにより発見された不整合や指摘事項を整理し、即座にコード修正を行って品質を高める。

---

### Step 5: 仕様ドキュメントの JIT 同期 (Sync)

1. **仕様ドキュメントの自律的な更新**:
   - Task ファイルの「仕様ドキュメント同期対象 (JIT Sync)」に指定された対象ファイルおよび反映要点と、Step 3〜4 で実際に実装・変更したコード内容をもとに、リポジトリの `docs/spec/` 本体（および必要に応じて `CONTEXT.md` 等）を更新する。
   - 他の作業によって `docs/spec/` が更新されている場合でも、既存の記載スタイル・構造を尊重しながら最新のコード実態と矛盾しないよう自然にマージする。
   - ※今回のTaskにドキュメント更新対象が存在しない場合（純粋な内部リファクタリングやテスト追加のみ等）は、その旨を完了報告に記載してスキップする。

---

### Step 6: テスト・検証 & Task ファイルのステータス更新

1. **テスト・検証コマンドの実行**:
   - Task ファイルに指定されている「検証コマンド」を実行する。
   - テストコードが実装されている場合は、必ずテストを実行してグリーン（成功）になることを確認する。
   - テストやビルド・Lintでエラーが出た場合は、原因を特定して修正し、すべての検証が成功するまで繰り返す。

2. **Task ファイルのステータス更新**:
   - すべての検証が成功したら、対象 `task-XX-*.md` の YAML フロントマターを更新する（詳細は [backlog-format.md](./references/backlog-format.md) 参照）：
     - `status: done`
     - `updated_at: "<YYYY-MM-DD>"`
   - 同じ親フォルダ内のすべての `task-*.md` が `status: done` になった場合は、親アイテムファイル（`pbi.md` / `bug.md`）のフロントマターも `status: done`（および `updated_at`）に更新する（まだ残Taskがある場合は親を `in_progress` にする）。

3. **完了報告**:
   - 以下の内容をユーザーに報告する：
     - 親アイテムとの整合（受入基準・要件の充足状況）
     - 実装・変更したファイル一覧
     - デザインコンセプト・トークンの適用内容（UIステップの場合）
     - コードレビューで発見・修正した内容
     - 実行したテスト・検証コマンドとその結果
     - 更新した Task ファイル（および全完了時は親アイテムファイル）の `status: done` への更新完了通知
     - **コミットメッセージ案**: Conventional Commit形式に則ったコミットメッセージ案（変更内容と対象のTask/親アイテムのIDを含めること）
     - （次ステップが存在する場合）次の `task-XX-*.md` の概要案内
