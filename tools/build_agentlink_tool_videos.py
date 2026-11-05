#!/usr/bin/env python3
"""Video gallery for every runnable standalone tool/example in the public repo."""
import argparse
import json
from pathlib import Path
from build_agentlink_demo_videos import generate_one

TOOLS = [
    ("csv-quality", "CSVの不具合を自動で発見",
     "文字コード、区切り文字、重複行を検査する", "tools/csv-doctor",
     "test_csv_doctor.py", "CSV品質チェックを回帰テスト"),
    ("srt-subtitles", "字幕ファイルの品質チェック",
     "SRTの時間や順番、重なりを検証する", "tools",
     "test_srt_doctor.py", "字幕エラーの検出を回帰テスト"),
    ("retry-guard", "再試行してよいか判断する",
     "外部操作が不明な場合は再送しない", "tools",
     "test_retry_guard.py", "安全な再試行判断をテスト"),
    ("receipt-ledger", "実行レシートの矛盾を検出",
     "重複や不正なレシートを発見する", "tools",
     "test_receipt_ledger_check.py", "レシートの検証規則をテスト"),
    ("rag-trace", "RAGの証拠を追跡する",
     "検索元と処理記録の欠落を見つける", "tools",
     "test_rag_trace_check.py", "引用元・実行記録の検証をテスト"),
    ("image-model-benchmark", "画像モデルを公平に比較",
     "一部の得意分野だけで過大評価しない", "tools",
     "test_image_model_benchmark.py", "モデル評価の集計条件をテスト"),
    ("editorial-depth", "文章の深さを自動で検査",
     "読み物としての厚みや構成を確認する", "tools",
     "test_editorial_depth_check.py", "文章品質の判定条件をテスト"),
    ("site-surface", "公開サイトの整合性を検査",
     "欠落や不一致を検出する診断ツール", "tools",
     "test_site_surface_doctor.py", "サイト公開前のチェックをテスト"),
    ("url-contract", "URL変更の取りこぼしを検出",
     "古い参照が残っていないか調べる", "tools",
     "test_url_contract_check_unittest.py", "URL移行の整合性をテスト"),
    ("user-bus", "Linuxセッションの診断",
     "ユーザーBusの状態確認をテストする", "tools",
     "test_user_bus_doctor.py", "架空のBus状態で診断をテスト"),
    ("video-redaction", "動画の伏せ字・ぼかし計画を検証",
     "編集前にマスキング指示を確認する", "tools",
     "test_video_redaction_filter.py", "ffmpegフィルタ構築をテスト"),
    ("side-effect-guard", "副作用の二重実行を防ぐ",
     "処理前の原子的な予約とレシートを検証", "examples/idempotent-side-effect-guard",
     "test_guard.py", "安全な予約・クラッシュ境界をテスト"),
]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--source-sha", required=True)
    args = parser.parse_args()
    results = []
    for slug, title, subtitle, directory, test, result in TOOLS:
        command = ("python3 -m pytest -q " if slug == "side-effect-guard"
                   else "python3 -m unittest -v ") + test
        spec = {
            "slug": slug, "title": title, "subtitle": subtitle,
            "directory": directory, "folder": directory,
            "command": command,
            "args": ["-m", "pytest", "-q", test] if slug == "side-effect-guard"
                    else ["-m", "unittest", "-v", test],
            "result": result,
        }
        item = generate_one(spec, args.source, args.output, args.source_sha)
        item["kind"] = "verified public tool/example test"
        item["test_file"] = test
        results.append(item)
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / "tools.json").write_text(
        json.dumps({"source_commit": args.source_sha, "tools": results}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"PASS all {len(results)} public tool/example clips")


if __name__ == "__main__":
    main()
