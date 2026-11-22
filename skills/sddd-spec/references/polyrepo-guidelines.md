# Polyrepo / Multi-Root Workspace Guidelines (`sddd-spec`)

ワークスペース内に複数のリポジトリが存在する **ポリレポ構成** で `sddd-spec` を実行する際の追加ルール。
単一リポジトリ（モノレポ含む）の場合は本ガイドを適用せず、通常の `SKILL.md` の手順どおり進めること。

---

## 1. ポリレポ構成の自動判定と `<docs-repo>` の特定

以下のいずれかに該当する場合、**ポリレポモード**として動作する：

1. **マルチルートワークスペース**: 複数のワークスペースルートが開かれており、それぞれに `.git`（ディレクトリまたはファイル）が存在する。
2. **親フォルダまとめ型**: ワークスペースルート直下に `.git` がなく、直下の子ディレクトリに複数の `.git` が存在する。

**`<docs-repo>`（SSOT）の特定手順**:
1. 各リポジトリ直下の `docs/spec/`（または `docs/backlog/`, `docs/adr/`, `docs/design/`）を確認し、1つのリポジトリに集約されていればそこを `<docs-repo>` とする。
2. 見つからない・複数に分散している場合は、ユーザーにドキュメント配置先リポジトリを確認する。

---

## 2. Step 1〜2 拡張: 横断調査

- 前提ドキュメントは `<docs-repo>/docs/spec/`, `<docs-repo>/docs/adr/`, `<docs-repo>/docs/design/`, `<docs-repo>/docs/backlog/` から読み込む。
- 既存コードや設定ファイルの事実調査は、関連する全リポジトリ（例: フロントエンド・バックエンド・インフラ）を横断して行う。

---

## 3. Step 3〜4 拡張: 子Task 設計・書き出しルール

ポリレポ環境で下流の `sddd-implement`（特に下級モデル）が迷わず実装・検証・JIT同期を実行できるよう、子Taskの粒度と記述を以下のように拡張する。

1. **Task分割の推奨粒度**:
   - 可能な限り **1つの子Task ＝ 1つの実装リポジトリ（＋ `<docs-repo>` へのJIT同期）** となるように分割する（例: Step 1 で `backend-repo` のAPI実装、Step 2 で `frontend-repo` のUI実装）。
   - リポジトリ間のPRマージ順や依存関係がある場合は、「前提・依存Step」に明記する。
2. **Task ファイルの記載拡張**:
   - **📁 変更・新規作成対象ファイル**: 必ず**リポジトリ名プレフィックス付き**で記載する。
     - 例: `backend-repo/src/users/users.controller.ts (変更)`
   - **📝 仕様ドキュメント同期対象 (JIT Sync)**: `<docs-repo>` を含めたパスで記載する。
     - 例: `project-docs/docs/spec/system-architecture.md`
   - **✅ 検証コマンド・完了条件**: **実行ディレクトリ（リポジトリ名）**を明記する。
     - 例: `backend-repo` にて `npm run test`, `npm run lint`

---

## 4. Step 4 拡張: ドキュメント出力と完了報告

- 親アイテム更新、子Task書き出し（`<docs-repo>/docs/backlog/`）、ADR起票（`<docs-repo>/docs/adr/`）、デザイン仕様更新（`<docs-repo>/docs/design/`）はすべて `<docs-repo>` へ出力する。
- コミットメッセージ案を提示する場合は、**`<docs-repo>` 向け**であることを明記する。
