# ローカルバックログ形式ガイド (`docs/backlog/`)

Azure DevOps を使わずにリポジトリ内で要件・設計・タスクを管理するための標準フォーマット仕様。

---

## 1. ディレクトリ & ファイル構成

確定仕様（`docs/spec/`）と混在するのを防ぐため、作業アイテムは `docs/backlog/` 配下にアイテム単位のフォルダを切って管理する。

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

### 採番と命名規則
- **フォルダ名**: `###-<kebab-case-slug>`（3桁ゼロ埋め連番。既存の `docs/backlog/` 内の最大番号 + 1、初回は `001`）
- **親ファイル名**: 種別に応じて `feature.md` / `pbi.md` / `bug.md` のいずれかを使用
- **子Taskファイル名**: 同フォルダ内に `task-XX-<kebab-case-slug>.md`（2桁ゼロ埋め連番：`task-01-...`, `task-02-...`）

---

## 2. YAML フロントマター仕様

すべてのアイテムファイル先頭に YAML フロントマターを配置し、ステータスと親子関係を管理する。

### 親アイテム (`feature.md` / `pbi.md` / `bug.md`)
```yaml
---
id: "002"
type: pbi # feature | pbi | bug
title: "<タイトル>"
status: ready # draft | ready | in_progress | done
parent: "../001-user-auth-feature/feature.md" # 親Feature等がある場合のみ記載
created_at: "YYYY-MM-DD"
updated_at: "YYYY-MM-DD"
---
```

### 子Task (`task-XX-<slug>.md`)
```yaml
---
id: "002-01"
type: task
title: "Step 1: <概要>"
status: todo # todo | in_progress | done
parent: "./pbi.md" # 親ファイルへの相対パス（"./pbi.md" または "./bug.md"）
created_at: "YYYY-MM-DD"
updated_at: "YYYY-MM-DD"
---
```

### ステータスのライフサイクル
- `sddd-refinement` 完了時: 親アイテムを `status: ready` に設定
- `sddd-spec` 完了時: 作成された子Taskを `status: todo` に設定
- `sddd-implement` 完了時: 該当Taskを `status: done` に更新（全Taskが `done` になった場合は親アイテムも `status: done` へ更新）
- ファイルは完了後も削除・自動移動せずその場に残し、`updated_at` を更新する。

---

## 3. 親アイテムのセクション構成

### PBI (`pbi.md`)
```markdown
# <タイトル>

## ユーザーストーリー
- **As a**: ...
- **I want**: ...
- **So that**: ...

## 受入基準 (Acceptance Criteria)
- [ ] ...

## スコープ外 (Out of Scope)
- ...
```

### Bug (`bug.md`)
```markdown
# <タイトル>

## 発生環境・前提条件
- ...

## 再現手順 (Repro Steps)
1. ...

## 期待される動作 vs 実際の動作
- **期待**: ...
- **実際**: ...

## 受入基準 (Acceptance Criteria)
- [ ] ...
```

### Feature (`feature.md`)
```markdown
# <タイトル>

## ビジネス価値 & KPI
- ...

## ターゲットペルソナ & 主要フロー
- ...

## スコープ境界 (MVP / 将来)
- ...

## 分割された PBI 一覧
- [002: <PBIタイトル>](../002-xxx/pbi.md)
```
