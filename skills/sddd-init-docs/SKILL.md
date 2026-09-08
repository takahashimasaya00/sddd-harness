---
name: sddd-init-docs
description: >-
  Reverse-engineer existing codebases to initialize and scaffold the SDDD (Skill & Doc-Driven Development) documentation suite.
  Inspects the project structure, dependencies, data models, APIs, and UI features, confirms business domain context via 1-round grilling,
  and generates docs/spec/ (system-architecture.md, data-models.md, features.md) along with the initial architecture decision record (docs/adr/0001-technology-stack.md).
  Always trigger this skill whenever the user asks to generate docs from an existing project, reverse-engineer specifications from code,
  onboard an existing codebase to SDDD, or mentions 'sddd-init-docs', 'init-docs', or 'reverse-docs'.
---

# SDDD Initial Documentation Generation (`sddd-init-docs`)

既存のプロジェクトコードベースを解析し、**スキル＆ドキュメント駆動開発（Skill & Doc-Driven Development: SDDD）**のドキュメント基盤（`docs/spec/` および初期 `docs/adr/`）を一括初期生成（スキャフォールディング）するスキル。

既存のブラウンフィールド開発プロジェクトにSDDDを新規導入し、以降の設計（`sddd-spec-ado`）、実装（`sddd-implement-ado`）、UI設計（`sddd-design-concept`）、差分同期（`sddd-sync`）へとスムーズにつなげるための起点となる。

---

## 核心原則

1. **仕様・設計レベルの抽象度を維持する**:
   - コード全文をそのままコピー＆ペーストするのではなく、レビューや将来の設計に耐えうる「仕様（Architecture / Model / Interface / UseCase）」として抽象化して記述する。
2. **推測ではなくコードの事実（Fact）に基づく**:
   - 存在する型定義、スキーマ、APIパス、コンポーネント構成、設定ファイルに基づいて正確に記述する。
3. **ドメイン意図（Why）は1ラウンドのGrillingで補完する**:
   - コードから「How / What（どのように動くか、何が実装されているか）」は特定できるが、「Why（誰のためのどんなビジネス目的のシステムか）」はブレやすいため、探索後に1ラウンドだけサクッとユーザーに確認・合意を取る。
4. **大規模コードベース対応（フェーズ分割スキャン）**:
   - 全ファイルを一度に読み込もうとせず、4つのフェーズ（全体俯瞰 → データ層 → アーキテクチャ/API層 → 機能/画面層）に分けて段階的に探索・生成することで、コンテキストのパンクを防ぎ高精度を保つ。
5. **既存資産の保護**:
   - 既に `docs/` や既存の仕様書が存在する場合は無断で上書きせず、必ずユーザーに確認して方針を合意する。

---

## 生成対象ドキュメント

| ファイルパス | 主な記述内容 |
| :--- | :--- |
| **`docs/spec/system-architecture.md`** | システム全体構成、レイヤー責務、APIエンドポイント一覧、外部サービス連携、インフラ・デプロイ環境 |
| **`docs/spec/data-models.md`** | 主要エンティティ、型定義（TypeScript等）、DBスキーマ、リレーション、バリデーション制約 |
| **`docs/spec/features.md`** | 全体機能マップ（Mermaid図）、画面・UI仕様、主要ユースケース、エラーハンドリング・異常系 |
| **`docs/adr/0001-technology-stack.md`** | プロジェクトで採用されている技術スタック（言語、FW、DB、通信方式等）のベースライン記録 |

> [!NOTE]
> `docs/design/`（デザインコンセプトやトークン）は思想や世界観の対話が必要なため、本スキルでは自動生成しません。UIコンセプトを定義したい場合は、ドキュメント生成後に `sddd-design-concept` を実行してください。

---

## ワークフロー手順

### Step 1: 既存 `docs/` の事前チェック & 上書きポリシー確認

1. リポジトリ直下に `docs/spec/` や `docs/adr/` が既に存在するか確認する。
2. 既にドキュメントが存在する場合：
   - ユーザーに状況を報告し、以下の方針を確認する：
     - **A) 全面再構築（バックアップ推奨）**: 既存の `docs/` をバックアップした上で、現在のコードベースから完全に再生成する。
     - **B) 不足ファイルのみ生成**: 存在しない仕様書ファイルのみを新規作成する。
     - **C) キャンセル**: 生成を中止する（直近のコード差分のみを反映したい場合は `sddd-sync` を案内）。
3. 存在しない場合は、自動的に Step 2 へ進む。

---

### Step 2: プロジェクト全体構造の把握（Phase 1: 俯瞰スキャン）

プロジェクトのルートディレクトリおよび主要構成を探索し、技術基盤と全体像を把握する。

1. **設定ファイル・マニフェストの調査**:
   - `package.json`（Node.js/TS/JS）、`pom.xml`/`build.gradle`（Java）、`go.mod`（Go）、`Cargo.toml`（Rust）、`pyproject.toml`/`requirements.txt`（Python）、`*.csproj`（.NET）等を読み込む。
   - 主要フレームワーク（Next.js, NestJS, Hono, React, Angular, FastAPI 等）やライブラリを特定する。
2. **既存ドキュメントの確認**:
   - ルートの `README.md`, `CONTEXT.md` などの既存ドキュメントが存在すれば読み込み、プロジェクトの概要やドメイン知識を把握する。
3. **ディレクトリ構造の走査**:
   - 最上位のディレクトリツリー（`src/`, `app/`, `pages/`, `components/`, `lib/`, `services/`, `api/`, `infra/` など）を確認し、モノレポか単一アプリか、レイヤー構造のパターンを特定する。

---

### Step 3: ドメイン & ビジネス目的の確認（Grilling 1ラウンド）

Step 2 の調査結果をもとに、プロジェクトの「ビジネス目的・ペルソナ・概要」の仮説を組み立て、ユーザーに1ラウンドのみサクッと確認を行う。

#### 確認フォーマット例
```markdown
### 📋 プロジェクト概要とビジネス目的の確認

コードベースの初期調査を行いました！以下の仮説で仕様書（`docs/spec/`）を構築してよいか確認させてください。

- **プロジェクト名/識別**: <プロジェクト名>
- **システムの概要**: <例: Azure上で動作する社内向け健康診断データ分析システム>
- **主要ターゲット/ユーザー**: <例: 社内健康管理室の産業医・保健師、および一般社員>
- **中核となる価値**: <例: 過去の健診データの推移グラフ表示と異常値の自動アラート通知>

💡 **推奨**: 上記の方向性でドキュメント化を進めます。補足や修正したい点があれば教えてください！（問題なければ「OK」とご回答ください）
```

ユーザーから承認（OK）または修正指示を受けたら、Step 4 へ進む。

---

### Step 4: データモデル抽出 & 生成（Phase 2: データ走査）

1. **データ定義ファイルの重点探索**:
   - DBスキーマ: `prisma/schema.prisma`, `migrations/`, TypeORMエンティティ, SQLファイル
   - 型定義: `types/`, `models/`, `interfaces/`, `schemas/` 配下のファイル
   - APIスキーマ: OpenAPI/Swagger（`swagger.json`, `openapi.yaml`）、Zodスキーマ、GraphQLスキーマ
2. **`docs/spec/data-models.md` の作成**:
   - 取得した情報から、主要エンティティ、フィールド定義、型（TypeScript/DB型）、必須/オプショナル、リレーション関係、バリデーション制約を体系的にまとめる。
   - 必要に応じてMermaidのER図を含める。

---

### Step 5: アーキテクチャ & API抽出 & 生成（Phase 3: 構成・API走査）

1. **構成・ルーティングファイルの重点探索**:
   - エントリーポイント: `main.ts`, `index.ts`, `server.ts`, `app/layout.tsx` など
   - ルーティング / API定義: `routes/`, `controllers/`, `api/`, `app/api/`, `functions/` など
   - インフラ / IaC: `infra/`, `*.bicep`, `Dockerfile`, `docker-compose.yml`, GitHub Actions / Azure Pipelines 設定
2. **`docs/spec/system-architecture.md` の作成**:
   - **システム構成**: クライアント、サーバー、DB、外部サービス連携の責務境界。
   - **アーキテクチャ図**: Mermaidを用いたシステム構成図。
   - **APIエンドポイント一覧**: メソッド、パス、概要、入出力形式（DTO対応）。
   - **インフラ・環境**: デプロイ環境（Azure Static Web Apps, Container Apps 等）やCI/CD構成。

---

### Step 6: 機能 & 画面仕様抽出 & 生成（Phase 4: UI・ユースケース走査）

1. **機能・画面コンポーネントの重点探索**:
   - 画面/ページ: `pages/`, `app/**/page.tsx`, `views/`, `components/` など
   - ビジネスロジック: `services/`, `usecases/`, `hooks/`, `utils/` など
2. **`docs/spec/features.md` の作成**:
   - **全体機能マップ**: システムが提供する機能群のMermaidマップ。
   - **機能・画面詳細**:
     - 各画面/機能の目的とユーザー操作フロー。
     - UI状態管理（Loading, Success, Empty, Error, 再試行）。
     - バリデーションルールおよびエラーハンドリング仕様。

---

### Step 7: 初期ADR起票 (`docs/adr/0001-technology-stack.md`)

1. `docs/adr/` ディレクトリを作成する。
2. [initial-adr-template.md](./references/initial-adr-template.md) を参照し、`docs/adr/0001-technology-stack.md` を作成する。
3. コード解析から判明した現状の技術スタック（フロントエンド、バックエンド、DB、インフラ）を明文化し、ステータスを `Accepted` として記録する。

---

### Step 8: 完了報告 & 次のアクション案内

ドキュメント生成が完了したら、成果物サマリーと次の推奨アクションをユーザーに報告する。

#### 報告フォーマット例
```markdown
## 🎉 SDDD ドキュメント初期生成が完了しました！

既存コードベースからSDDD（スキル＆ドキュメント駆動開発）のドキュメント体系を正常に構築しました！

### 📁 生成された成果物
- 📄 [system-architecture.md](file:///docs/spec/system-architecture.md): システム構成、コンポーネント責務、API一覧（計 X エンドポイント）
- 📄 [data-models.md](file:///docs/spec/data-models.md): 主要エンティティ、型定義、リレーション（計 Y モデル）
- 📄 [features.md](file:///docs/spec/features.md): 機能マップ、画面仕様、ユースケース（計 Z 画面/機能）
- 📄 [0001-technology-stack.md](file:///docs/adr/0001-technology-stack.md): 初期技術スタック選定の記録
- 📝 **コミットメッセージ案**: Conventional Commit形式に則ったコミットメッセージ案（生成したファイル群の概要を含めること）

---

### 🚀 次のおすすめアクション
1. **UI/UXコンセプトの策定**:
   - Webアプリのデザイン哲学やデザイントークンを定義したい場合は、`sddd-design-concept` を実行してください。
2. **Azure DevOps での要件定義・設計**:
   - 新規機能追加やPBIの設計を行う場合は、`sddd-refinement-ado` や `sddd-spec-ado` を実行してください。
3. **日常のコード先行開発の同期**:
   - プロトタイプやホットフィックス等のコード変更があった場合は、`sddd-sync` で差分同期を行えます。
```

---

## 重要な注意事項

1. **大文字・小文字およびファイルリンク**:
   - 作成したファイルへのリンクは Markdown 形式（`[basename](file:///absolute/path)`）で正しく記述すること。
2. **日本語での標準化**:
   - プロジェクトの言語設定に合わせて自然な技術日本語で仕様書を出力すること。
3. **Mermaid図の文法**:
   - 特殊文字を含むノードラベルは `id["Label (info)"]` のようにダブルクォートでエスケープし、パースエラーを防ぐこと。
