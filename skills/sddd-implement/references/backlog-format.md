# ローカルバックログ形式ガイド (`docs/backlog/`)

Azure DevOps を使わずにリポジトリ内で要件・設計・タスクを管理するための標準フォーマット仕様。

---

## 1. ディレクトリ & ファイル構成

```text
docs/backlog/
├── 001-user-auth-feature/
│   └── feature.md
├── 002-login-screen/
│   ├── pbi.md              # 要件・受入基準 + 技術設計サマリー
│   ├── task-01-api.md      # 実装ステップ1
│   └── task-02-ui.md       # 実装ステップ2
└── 003-fix-session-timeout/
    ├── bug.md              # 再現手順・受入基準 + 技術設計サマリー
    └── task-01-fix.md
```

---

## 2. YAML フロントマターとステータス更新ルール

### 子Task (`task-XX-<slug>.md`)
```yaml
---
id: "002-01"
type: task
title: "Step 1: <概要>"
status: todo # todo | in_progress | done
parent: "./pbi.md" # 親ファイルへの相対パス
created_at: "YYYY-MM-DD"
updated_at: "YYYY-MM-DD"
---
```

### 実装完了時の更新
1. 対象 Task ファイルの `status` を `done`、`updated_at` を実施日（`YYYY-MM-DD`）へ更新する。
2. 同フォルダ内の全 `task-*.md` の `status` を確認し、**すべて `done`** になっていれば親アイテム（`pbi.md` / `bug.md`）の `status` も `done` に更新する（残Taskがある場合は `in_progress` にする）。
3. ファイルは完了後も削除・自動移動せずその場に残す。
