---
name: sddd-sync
description: Reverse-sync and reflect code changes (e.g., from one-shot implementations, prototypes, hotfixes, or refactoring) back into documentation (docs/spec/, docs/adr/). Use whenever the user asks to sync code to docs, reflect implementation into specifications, reverse-engineer specs from code, update docs/spec or docs/adr after coding, or mentions 'sddd-sync', 'code-to-docs', 'doc-sync', or doc synchronization.
---

# Code-to-Documentation Reverse Sync (`sddd-sync`)

ワンショット実装、プロトタイプ作成、手動リファクタリングなどによって先行して変更されたコードベースから、仕様書 (`docs/spec/`) および設計決定記録 (`docs/adr/`) へ変更内容を逆同期（リバース生成・反映）するためのスキル。

コードとドキュメントの乖離（ドリフト）を防ぎ、ドキュメントを常に「生きた最新の仕様（Single Source of Truth）」に保つことを目的とする。

---

## 更新対象スコープ

- **対象ドキュメント**:
  - `docs/spec/system-architecture.md` (システム構成、APIエンドポイント、コンポーネント構成、インフラ連携)
  - `docs/spec/data-models.md` (共通型、エンティティ、DBスキーマ、DTO、バリデーション)
  - `docs/spec/features.md` (機能一覧、ユースケース、画面仕様、振る舞い)
  - `docs/adr/` (アーキテクチャ上の重要決定がある場合の新規起票)
- **対象外**:
  - `docs/ROADMAP.md` は本スキルの同期対象に**含めない**（開発ロードマップは明示的な計画管理スキルでのみ更新する）。

---

## 運用方針（ハイブリッド同期）

1. **`docs/spec/` の自動同期（ノンブロッキング）**:
   - コード差分から検出された新設・変更要素（モデル、API、画面、ロジック）は、既存のフォーマット・粒度に合わせて自動で自然に追記・マージする。
2. **`docs/adr/` の提案・確認（重大決定時のみ）**:
   - 単なるCRUD追加やフィールド追加ではADRは起票しない。
   - **新規ライブラリ/フレームワークの導入**、**永続化層/キャッシュ戦略の変更**、**セキュリティ/認証方式の刷新**、**状態管理設計の根本変更**など、不可逆または影響範囲の広い設計判断が含まれる場合のみ、ユーザーに起票を提案し、合意を得てから作成する。

---

## ワークフロー手順

### Step 1: 変更コードの特定と調査

1. 同期対象となるコード変更を特定する：
   - ユーザーがファイル名やコミット、PRを指定している場合はその対象を優先調査。
   - 特に指定がない場合は、Gitの変更差分（未コミットの差分、または直近のコミット）を確認する：
     ```powershell
     git status
     git diff --stat HEAD~1
     ```
2. 変更されたコード（TypeScript、HTML、CSS、Bicepなど）を読み込み、以下の観点で差分を分類・整理する：
   - **Data**: 新規型・インターフェース、プロパティ追加、DBエンティティ、スキーマ変更
   - **Architecture / API**: 新規エンドポイント（パス・HTTPメソッド・入出力）、サービス間連携、共通モジュール
   - **Features / UI**: 新規ページ・コンポーネント、ユーザー操作フロー、バリデーションルール
   - **Decisions**: 新たに導入された外部ライブラリ、アーキテクチャパターンの採用

---

### Step 2: 既存ドキュメントの事前調査

更新対象となるドキュメントを読み込み、現在の仕様記述スタイル・用語・採番規則を把握する。

1. `docs/spec/data-models.md`
2. `docs/spec/system-architecture.md`
3. `docs/spec/features.md`
4. `docs/adr/` 配下の既存ファイル一覧（最新のADR連番 `XXXX-xxx.md` を確認）

---

### Step 3: `docs/spec/` への差分同期

特定した変更内容を、既存の各仕様書のセクション構成を崩さずに適切な箇所へ追記・マージする。

#### `docs/spec/data-models.md`
- 新規モデル、修正されたインターフェース、フィールド定義を追記。
- 型（TypeScript）や必須/オプショナル、バリデーション制約、Cosmos DB / RDB のパーティションキー等の設計意図を記載する。

#### `docs/spec/system-architecture.md`
- 新設されたAPIエンドポイント（URL、メソッド、リクエスト/レスポンス形式）を追記。
- 新しいコンポーネント構成やサービス責務、外部連携（Azureサービス等）を追記。

#### `docs/spec/features.md`
- 新規機能、画面仕様、ユーザーインタラクション、エラーハンドリング要件を追記。

> [!NOTE]
> コード全文をコピペするのではなく、**「仕様としての抽象度」**を維持して記述すること（コードレビューに耐えうる仕様書レベルの記述）。

---

### Step 4: ADR (Architecture Decision Record) の起票判定（重大決定時のみ）

変更内容に「重大な技術選定・アーキテクチャ上の決定」が含まれているかを判定する。

- **判定基準**:
  - 新しい外部ライブラリやフレームワークの選定（例: チャートライブラリ、バリデーションライブラリ）
  - データ永続化やキャッシング戦略の決定
  - 認証・認可やセキュリティ方針の決定
  - アプリケーション全体に影響する設計パターンやモジュール構造の変更

#### 重大決定が存在する場合（ユーザー確認）
ユーザーに以下のように確認・提案する：
> 「今回の実装において、以下の重要なアーキテクチャ上の決定（例: ○○の採用）が検出されました。ADR（`docs/adr/XXXX-xxx.md`）として起票しますか？」

ユーザーの合意が得られた場合、最新の連番を採番し、既存ADRと同じフォーマット（Context, Decision, Status）でファイルを作成する。

---

### Step 5: 更新完了とサマリー報告

ドキュメントの更新が完了したら、ユーザーに対して簡潔かつわかりやすく変更サマリーを報告する。

#### 報告フォーマット例
```markdown
### 🔄 ドキュメント同期完了サマリー

コードの変更内容を `docs/` へ正常に反映しました！

- **`docs/spec/data-models.md`**:
  - `CheckupSummary` モデルおよび `trendStatus` フィールドの定義を追記
- **`docs/spec/system-architecture.md`**:
  - `GET /api/v1/metrics/trend` エンドポイント仕様を追加
- **`docs/spec/features.md`**:
  - 体組成トレンド分析画面のUI仕様とエラー再試行フローを追記
- **`docs/adr/`**:
  - （ADR起票を行った場合、または起票不要と判断した理由を記載）
- **コミットメッセージ案**:
  - Conventional Commit形式に則ったコミットメッセージ案（同期した機能・仕様の概要を含めること）
```

---

## 重要な注意事項

1. **既存記述の保護**:
   - 既存の仕様を無秩序に上書き・消去してはならない。変更箇所と既存記述の整合性を保ちながらマージすること。
2. **言語とトーンの統一**:
   - 既存ドキュメントが日本語で記述されている場合は、同様に日本語の自然な技術文書トーンで追記すること。
3. **推測ではなくコード事実に基づく記述**:
   - 実装コードに実際に存在するプロパティ名、型、パス、ロジックに基づいて正確に記述すること。