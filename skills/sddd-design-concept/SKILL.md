---
name: sddd-design-concept
description: >-
  Define and sharpen Web application design concepts, visual themes, UI/UX philosophy, and design tokens using grilling.
  Researches existing docs/design before interviewing, conducts a relentless round-based design tree grilling with recommended answers,
  and outputs structured concept and token specifications to docs/design/ (concept.md, tokens.md).
  Always trigger this skill whenever the user mentions designing or refining a web application design concept, visual theme,
  tone & manner, UI/UX concept, design system, design tokens, or asks to define guidelines in docs/design.
---

# Web Application Design Concept (`sddd-design-concept`)

Webアプリケーションの**デザインコンセプト、UI/UX思想、トーン＆マナー、デザイントークン**を、`grilling` のアプローチで徹底的に深掘り・合意形成し、リポジトリの `docs/design/` ディレクトリ配下に体系的なドキュメント（`concept.md`, `tokens.md` 等）として出力・更新するスキル。

---

## 核心原則: 単なる「見た目」ではなく「体験と体系（システム）」に集中

- **フォーカス（Design Concept & System Level）**:
  - プロダクトの存在意義・ターゲットペルソナ・ユーザー体験のゴール（UX Philosophy）
  - ビジュアルテーマ、トーン＆マナー、世界観（キーワード、感情、質感）
  - カラーパレット設計（Brand / Neutral / Semantic / Surface / コントラスト基準）
  - タイポグラフィ階層（フォントファミリー、スケール、ウェイト、行間）
  - スペーシング＆レイアウトシステム（4/8pxグリッド、ブレークポイント、情報密度）
  - 主要コンポーネントの造形原則（角丸、Elevation/シャドウ、ボーダー）
  - インタラクション＆アニメーション原則（マイクロインタラクション、トランジションの心地よさ）
  - プロジェクトの技術スタック（Tailwind CSS, SCSS, Vanilla CSS等）に即した実装用トークン定義
- **対象外（個別画面の実装コード）**:
  - 特定の画面の個別HTML/テンプレートタグの全書き出しなどは、ADO Taskに基づく実装フェーズ（`sddd-implement-ado` 等）で担当する。

---

## ワークフロー手順

### Step 1: 前提コンテキスト & 既存ドキュメントの事前調査

事実調査はエージェントの責務。ユーザーに質問する前に、以下の調査を自律的に行う：

1. **既存の `docs/design` フォルダの確認**:
   - `docs/design/` が存在するか確認する。
   - すでに `concept.md`, `tokens.md` などのファイルが存在する場合は、全て読み込む。
   - **既存内容の把握**: 既に決定しているデザイン方針、カラーパレット、トーン＆マナー、現在どこまで定義されているかを特定する。
2. **プロジェクトの全体仕様・コンテキストの把握**:
   - `docs/spec/`（機能一覧 `features.md`, システム構成 `system-architecture.md` 等）や `CONTEXT.md`、`README.md` を確認。
   - このアプリが「誰のための、どんな課題を解決するサービスか」を把握する。
3. **フロントエンド技術スタックの判別**:
   - `package.json` や設定ファイル（`tailwind.config.*`, `angular.json`, `vite.config.*`, CSS/SCSSファイル等）を確認。
   - スタイリング手法（Tailwind CSS, Vanilla CSS, SCSS, UIコンポーネントライブラリ等）を特定する。

---

### Step 2: デザイン特化 Grilling（推論ツリー展開）

`grilling` 手法に基づき、推論ツリー（Design Tree）を展開してフロンティア（未決事項）をラウンド制でインタビューする。

#### インタビューの基本ルール
- **推論ツリー展開**: 前提条件が整っているフロンティアの質問をラウンドごとにまとめて提示する。
- **既存ドキュメントを踏まえた質問**: 既に `docs/design/` にファイルがある場合は、「既存の○○という方針を踏まえ、今回は〜〜」のように、過去の決定を尊重しつつ差分や未決事項に焦点を当てる。
- **推奨解（💡 推奨）の提示**: 単に質問を投げるのではなく、プロダクトの特性・ターゲット層・UI/UXベストプラクティスに基づいた具体的な推奨解とその理由を必ず併記する。
- **事実調査はエージェントの責務**: コードベースから分かる技術仕様や既存ルールはエージェント自身で調べ、ユーザーには「デザインの意思決定（Decision）」のみを問う。

#### ラウンド質問のフォーマット例
```markdown
🔹 **Q1** - **<観点タイトル>**: <背景、検討の選択肢>
💡 **推奨**: <推奨する方針とその理由>

---

🔹 **Q2** - **<観点タイトル>**: <背景、検討の選択肢>
💡 **推奨**: <推奨する方針とその理由>
```

#### 主な深掘り観点（デザインツリーのフロンティア）
1. **UX Philosophy & ペルソナ**:
   - ユーザーがアプリを使ったときに感じるべき「第一印象」と「体験のコア価値」は何か？
   - 信頼感（医療・金融系）、スピード感（業務ツール系）、親しみやすさ・楽しさ（コミュニティ・B2C系）などの軸。
2. **ビジュアルテーマ & トーン＆マナー**:
   - デザインを象徴する3〜5つのキーワード（例: `Clean`, `Trustworthy`, `Modern`, `Accessible`）。
   - ダークモード/ライトモードのサポート方針（ライト専用、ダーク対応、OS追従など）。
   - 全体の質感（フラット、ソフトシャドウ、グラスモフィズム、ネオブルータリズム等）。
3. **カラーシステム (Color System)**:
   - Primary（ブランド/主行動）、Secondary、Accent。
   - Neutral（背景、サーフェス、境界線、テキスト階層）。
   - Semantic（Success, Warning, Danger/Error, Info）。
   - WCAG基準（AA以上など）を意識したコントラスト配慮。
4. **タイポグラフィ (Typography)**:
   - フォントファミリー（和文・欧文の選定、可読性重視）。
   - フォントサイズ階層（Display, Heading 1-4, Body, Caption）。
   - 行間（Line-height）と文字間（Letter-spacing）のルール。
5. **スペーシング & レイアウト (Spacing & Spatial System)**:
   - 基本グリッド単位（4px / 8px スケール）。
   - ブレークポイント設計（Mobile, Tablet, Desktop）。
   - 画面の最大コンテンツ幅（Max Container Width）。
6. **コンポーネント造形 & インタラクション (Shapes & Interactions)**:
   - 角丸（Border Radius: なし、シャープ、マイルド、ピル型）。
   - 奥行き表現（Elevation / Drop Shadow の段階）。
   - マイクロインタラクション（ホバー、フォーカス、アクティブ時のアニメーション速度やイージング）。
7. **実装連携方針**:
   - プロジェクトのスタイリング技術（Tailwind, SCSS, CSS変数等）に合わせたトークン出力の合意。

全フロンティアが解消し、ユーザーから設計内容の合意（LGTM）を得たら Step 3 へ進む。

---

### Step 3: デザインコンセプトのドラフト提示 & 承認

合意されたデザインコンセプトとトークン定義の骨子を整理し、ユーザーに最終確認（LGTM）を仰ぐ。

#### 提示フォーマット
- **デザインコンセプト概要**: プロダクトの核となる世界観・トンマナキーワード
- **カラー＆スタイリング方針**: 主要カラー値、タイポグラフィ、コンポーネント造形ルール
- **ファイル反映予定**: 作成・更新するファイルの一覧

---

### Step 4: `docs/design` フォルダへの反映・ドキュメント生成

ユーザーから承認（LGTM）を得たら、リポジトリの `docs/design/` 配下にファイルを生成・更新する。

#### 1. `docs/design/concept.md`
- [concept-template.md](./references/concept-template.md) をベースに作成・更新。
- デザイン哲学、ペルソナ、トーン＆マナー、レイアウト原則、インタラクション原則を明文化。

#### 2. `docs/design/tokens.md`
- [tokens-template.md](./references/tokens-template.md) をベースに作成・更新。
- カラー、タイポグラフィ、スペーシング、Elevation等の仕様テーブルを記述。
- **実装用コードスニペット**:
  - プロジェクトの技術スタック（Step 1で自動判別、またはGrillingで合意）に応じたコードブロックを掲載。
  - 例: Tailwind CSSなら `tailwind.config.js` / `@theme` の定義、SCSSなら `_variables.scss`、Vanilla CSSなら `:root { ... }` のカスタムプロパティ。

#### 3. 完了報告
- 作成・更新したファイルへのリンクをユーザーに報告する。
- **コミットメッセージ案**: 報告の最後に、Conventional Commit形式に則ったコミットメッセージ案（デザインコンセプト・トークンの更新概要を含めること）を提示する。
