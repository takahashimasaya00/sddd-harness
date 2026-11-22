# ドキュメント参照・コンテキスト優先ルール

調査・デバッグ・実装・質問回答を行う際は、コードベース全体を無差別に検索する前に、必ず以下のドキュメントを最優先で確認してアーキテクチャ・データ構造・設計意図をインプットすること。

- `docs/spec/`: システム構成、データモデル、機能仕様（Single Source of Truth）
- `docs/adr/`: アーキテクチャ上の決定背景・トレードオフ
- `docs/design/`: UI/UX思想、デザイントークン

# Git操作に関するガードレール
- 以下のSkillを使用してタスクを実行している最中は、いかなるファイルに対してもGitへの書き込み操作（`git add`, `commit`, `push` 等）を行わないこと。
  - `sddd-*` (sdddから始まる全てのSkill)

# 対になるSkillsの同期ルール
以下のスキルは「ローカルファイル書き出し版」と「Azure DevOps連携版」で対になる関係にあるため、共通原則（Grilling手法、設計観点、JIT同期ルール、参照ガイドライン等）を更新・追加した際は、もう片方のスキルにも反映が必要か必ず確認・提案すること（I/Oやツール固有の差分を除き整合性を保つ）。

- `sddd-refinement` ⇔ `sddd-refinement-ado`
- `sddd-spec` ⇔ `sddd-spec-ado`
- `sddd-implement` ⇔ `sddd-implement-ado`
