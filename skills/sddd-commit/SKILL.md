---
name: sddd-commit
description: >-
  Generate Japanese Conventional Commit messages from Git diffs based on the `git-commit` skill,
  strictly complying with commitlint rules (including 100-character line limits for header, body, and footer).
  Read-only proposal mode without executing `git add` or `git commit`.
  Always trigger this skill whenever the user asks to think of, draft, or suggest a Conventional Commit message
  in Japanese, asks for a commit message for current changes, or mentions 'sddd-commit'.
---

# Japanese Conventional Commit Message Generator (`sddd-commit`)

`git-commit` スキル（Conventional Commits 1.0.0）をベースに、**日本語でのコミットメッセージ案の生成**および **commitlint 準拠（全行100文字以内）** に特化した薄いラッパースキル。

`sddd-*` 運用の安全原則に従い、Git への書き込み操作（`git add`, `git commit` 等）は行わず、メッセージ案の提案のみを行う。

---

## ベーススキルと上書き方針

本スキルは依存スキル **`git-commit`**（`github/awesome-copilot`）の以下をベースとして踏襲する：

- Conventional Commits 1.0.0 フォーマット（`<type>(<scope>): <subject>` / `<body>` / `<footer>`）
- Type 定義（`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`）および Breaking Changes 表記（`!` / `BREAKING CHANGE:`）
- リポジトリ規約の事前確認（`commitlint.config.*`, `.commitlintrc.*`, `CONTRIBUTING.md`, `git log --oneline -10`）
- 差分の調査と、論理的に独立した変更の分割判断

そのうえで、以下の **4つの上書きルール** を適用する。

---

## 上書きルール

### 1. 日本語でのメッセージ記述

- `type` および `scope` は英語（小文字）で記述する。`scope` は差分から明確な対象がある場合のみ付与する。
- `subject`（件名）および `body`（本文）は自然な日本語で記述する。
- `subject` は変更内容が端的に伝わる名詞句または簡潔な表現とし、末尾に句点（`.` / `。`）や「〜しました」を付けない。
- `body` は変更の動機・背景・影響範囲の補足が必要な場合のみ記述し、ヘッダーとの間に空行を1行入れる。

### 2. commitlint 準拠・文字数制限の厳守

- リポジトリに `commitlint` 設定ファイル（例: `commitlint.config.mjs`, `commitlint.config.js`, `.commitlintrc.json`）が存在する場合は、必ず読み込んでそのルールを最優先で遵守する。
- **`header`（1行目）**: 50〜72文字以内を目安とし、必ず **100文字以内** に収める。
- **`body` / `footer`（本文・フッター）**: **すべての行を100文字以内** に収める（`body-max-line-length` / `footer-max-line-length` 対策）。100文字を超える場合は、文節の区切りで適切に改行するか箇条書きで分割する。

### 3. Git 書き込み操作の禁止（提案専用）

- **`git add`, `git commit`, `git reset`, `git push` などの書き込み・状態変更コマンドは一切実行しない。**
- 実行してよいコマンドは読み取り系（`git status`, `git diff`, `git log`）のみとする。
- `git-commit` スキルの Step 3（ステージング）および Step 5（コミット実行）はスキップし、メッセージ案の提示で完了とする。

### 4. 差分対象とポリレポ対応

- **ステージ済みの変更（`git diff --staged`）がある場合**: ステージ済みの変更のみを対象にメッセージ案を作成する。
- **ステージ済みの変更がない場合**: 未ステージの変更（`git diff`）および未追跡ファイル（`git status --porcelain`）を対象にメッセージ案を作成し、対象が未ステージである旨を一言添える。
- **論理的に独立した変更が混在している場合**: コミット分割案ごとにファイル群とメッセージ案を分けて提示する。
- **ポリレポ環境の場合**: 変更があるリポジトリごとに `git -C <repo>` で差分を確認し、リポジトリ別にメッセージ案を提示する。

---

## ワークフロー手順

### Step 1: リポジトリ規約と差分の確認

以下を確認する（読み取り専用コマンドのみ）：

```powershell
git status --porcelain; git diff --staged --stat; git log --oneline -10
```

- 必要に応じて `git diff --staged`（未ステージのみの場合は `git diff`）で詳細な差分を確認する。
- `commitlint.config.*` や `CONTRIBUTING.md` があれば読み込み、プロジェクト固有のルールを把握する。
- 変更が一切ない場合は、その旨を簡潔に報告して終了する。

### Step 2: コミットメッセージ案の生成と検証

`git-commit` の規約と上記の上書きルールに従い、メッセージ案を作成する。出力前に以下をセルフチェックする：

- [ ] `type` は許可された小文字キーワードか
- [ ] `header` は 72文字以内（最大100文字以内）で、末尾に `.` / `。` がないか
- [ ] `body` / `footer` の **全行が100文字以内** に収まっているか
- [ ] `header` と `body`、`body` と `footer` の間に空行があるか

### Step 3: メッセージ案の提示

コピー＆ペーストしやすい `text` コードブロックで提示する。複数コミットへの分割を提案する場合は、対象ファイルとセットで並べる。

#### 出力例

```text
feat(skills): 日本語Conventional Commit提案スキルsddd-commitを追加

git-commitスキルをベースに、日本語出力とcommitlintの100文字制限に
準拠した薄いラッパースキルを新設。
sddd-*ガードレールに合わせ、Git書き込みを行わない提案専用とした。
```
