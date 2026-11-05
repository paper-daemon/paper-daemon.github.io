#!/usr/bin/env python3
"""Render short MP4 demonstrations from real, pinned public AgentLink CLI runs.

Only allowlisted public examples are executed. The video visualizes their
captured subprocess logs, not a desktop screen recording or production runtime.
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import tempfile
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1280, 720
FPS = 12
BG = "#080e1c"
CYAN = "#5bdfed"
WHITE = "#edf4ff"
MUTED = "#9eafc7"
GREEN = "#7ae5b4"

DEMOS = [
    {
        "slug": "agent-evaluation",
        "title": "エージェント評価・回帰テスト",
        "subtitle": "期待結果と実行記録を比較して、安全上の後退を見つける",
        "folder": "agent-eval-regression-kit",
        "args": ["evaluate.py", "cases.json", "sample_runs.json"],
        "command": "python3 evaluate.py cases.json sample_runs.json",
        "result": "期待する状態・証拠・重複実行を検査",
    },
    {
        "slug": "idempotency-key",
        "title": "同じ依頼を二重実行しない",
        "subtitle": "同じ処理キーの再試行は、元のレシートを返す",
        "folder": "idempotency-key-simulator",
        "args": ["simulator.py"],
        "command": "python3 simulator.py",
        "result": "EXECUTE 1回、REPLAY 2回の模擬動作",
    },
    {
        "slug": "receipt-recovery",
        "title": "結果が不明なら、安全に止める",
        "subtitle": "完了・未開始・結果不明を区別し、無条件の再送を防ぐ",
        "folder": "receipt-replay-simulator",
        "args": ["demo.py"],
        "command": "python3 demo.py",
        "result": "結果不明は照合待ち、安易に再試行しない",
    },
    {
        "slug": "worker-handoff",
        "title": "ワーカーが落ちても引き継ぐ",
        "subtitle": "期限切れの所有権を検知して別ワーカーが再取得",
        "folder": "worker-lease-recovery",
        "args": ["simulator.py"],
        "command": "python3 simulator.py",
        "result": "同時所有を避け、期限切れ後に復旧",
    },
    {
        "slug": "api-job-orchestrator",
        "title": "APIジョブの二重投入を防ぐ",
        "subtitle": "ジョブID・Lease・完了レシートをテストで検証",
        "folder": "reliable-api-job-orchestrator",
        "args": ["-m", "unittest", "-v", "test_orchestrator.py"],
        "command": "python3 -m unittest -v test_orchestrator.py",
        "result": "公開ジョブ制御の回帰テストを実行",
    },
    {
        "slug": "reorder-drift",
        "title": "発注サイクルの変化を検出",
        "subtitle": "架空の注文履歴から、再注文の遅れを判定",
        "folder": "reorder-drift-detector",
        "args": ["-m", "pytest", "-q", "test_reorder_drift.py"],
        "command": "python3 -m pytest -q test_reorder_drift.py",
        "result": "中央値と遅延率の判定を回帰テスト",
    },
]


def get_font(size: int, mono: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/opentype/noto/NotoSansCJKjp-Regular.otf",
        "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf" if mono
        else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    raise RuntimeError("No supported font installed (need fonts-noto-cjk)")


def safe_lines(output: str, max_lines: int = 14) -> list[str]:
    lines = []
    for raw in output.replace("\r", "").splitlines():
        clean = "".join(ch for ch in raw if ch == "\t" or ord(ch) >= 32)
        lines.extend(textwrap.wrap(clean, width=91, subsequent_indent="  ") or [""])
    if len(lines) > max_lines:
        lines = lines[:5] + ["... middle of captured output omitted ..."] + lines[-(max_lines - 6):]
    return lines


def rounded(draw: ImageDraw.ImageDraw, box, fill, outline=None, radius=21):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=2)


def render(spec: dict, stage: int, output_lines: list[str], source_sha: str) -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    display = get_font(24)
    medium = get_font(29)
    title = get_font(47)
    small = get_font(19)
    terminal = get_font(25, mono=True)
    d.ellipse((-210, -240, 560, 460), fill="#122a40")
    d.ellipse((1100, 200, 1540, 710), fill="#13243a")
    d.text((66, 44), "AGENTLINK  /  PUBLIC DEMO VIDEO", font=small, fill=CYAN)
    d.text((67, 92), spec["title"], font=title, fill=WHITE)
    d.text((70, 166), spec["subtitle"], font=display, fill=MUTED)
    for n in range(4):
        rounded(d, (70 + n * 58, 224, 115 + n * 58, 233),
                CYAN if n <= stage else "#35475e", radius=4)
    labels = ["INTRO", "RUN", "OUTPUT", "RESULT"]
    d.text((340, 217), labels[stage], font=small, fill=CYAN)
    rounded(d, (67, 273, 1213, 616), "#101a2c", outline="#31465f")
    d.ellipse((94, 297, 108, 311), fill="#f47c8d")
    d.ellipse((117, 297, 131, 311), fill="#ffcc74")
    d.ellipse((140, 297, 154, 311), fill=GREEN)
    d.text((179, 288), "PUBLIC DEMO  /  REAL SUBPROCESS OUTPUT", font=small, fill=MUTED)
    d.line((94, 331, 1187, 331), fill="#2b3d52", width=2)

    if stage == 0:
        d.text((101, 371), "01  PUBLIC SOURCE", font=medium, fill=CYAN)
        d.text((103, 433), "公開済みのPythonコードを実行", font=get_font(37), fill=WHITE)
        d.text((104, 508), "実サービス接続なし / 個人データなし", font=display, fill=MUTED)
    elif stage == 1:
        d.text((101, 368), "$  " + spec["command"][:77], font=terminal, fill=GREEN)
        d.text((101, 433), "隔離されたCI環境で、実際のコマンドを実行", font=display, fill=WHITE)
        d.text((102, 504), "Source: AgentLink public repo", font=small, fill=MUTED)
        d.text((102, 541), "Pinned commit: " + source_sha[:14], font=small, fill=MUTED)
    elif stage == 2:
        d.text((101, 355), "$  " + spec["command"][:77], font=get_font(19, mono=True), fill=CYAN)
        line_font = get_font(19, mono=True)
        y = 401
        for line in output_lines[:10]:
            d.text((103, y), line[:99], font=line_font, fill=GREEN if "PASS" in line or "OK" == line.strip() else WHITE)
            y += 21
        if not output_lines:
            d.text((103, 422), "(No console output)", font=line_font, fill=MUTED)
    else:
        d.text((101, 372), "PASS  /  EXIT CODE 0", font=get_font(38), fill=GREEN)
        d.text((103, 447), spec["result"], font=medium, fill=WHITE)
        d.text((103, 524), "公開サンプルの実行結果。実運用の保証ではありません。", font=display, fill=MUTED)

    d.line((70, 655, 1210, 655), fill="#31465f", width=2)
    d.text((74, 668), "Captured CLI log  •  auto-edited into video  •  no production systems", font=small, fill=MUTED)
    d.text((1107, 669), f"{stage + 1} / 4", font=small, fill=CYAN)
    return img


def generate_one(spec: dict, source: Path, output: Path, source_sha: str) -> dict:
    folder = source / spec["directory"] if "directory" in spec else source / "demos" / spec["folder"]
    if not folder.is_dir():
        raise RuntimeError(f"Missing expected public demo: {folder}")
    completed = subprocess.run(
        [sys.executable, *spec["args"]],
        cwd=folder, text=True, capture_output=True, timeout=30,
        env={"PATH": "/usr/local/bin:/usr/bin:/bin", "PYTHONDONTWRITEBYTECODE": "1"},
    )
    combined = (completed.stdout + "\n" + completed.stderr).strip()
    if completed.returncode != 0:
        raise RuntimeError(f"{spec['slug']} failed: exit={completed.returncode}\n{combined[:1500]}")
    lines = safe_lines(combined)
    output.mkdir(parents=True, exist_ok=True)
    video_file = output / (spec["slug"] + ".mp4")
    poster = output / (spec["slug"] + ".jpg")
    with tempfile.TemporaryDirectory(prefix="agentlink-video-") as td:
        tmp = Path(td)
        slides = []
        for stage in range(4):
            img = render(spec, stage, lines, source_sha)
            if stage == 0:
                img.save(poster, quality=89, optimize=True)
            file = tmp / f"scene-{stage}.png"
            img.save(file)
            slides.append(file)
        concat = tmp / "frames.txt"
        durations = [3, 5, 9, 5]
        concat.write_text(
            "".join(f"file '{p}'\nduration {seconds}\n" for p, seconds in zip(slides, durations))
            + f"file '{slides[-1]}'\n",
            encoding="utf-8",
        )
        subprocess.run([
            "ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y",
            "-f", "concat", "-safe", "0", "-i", str(concat),
            "-vf", f"fps={FPS},format=yuv420p", "-an",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "25",
            "-movflags", "+faststart", str(video_file),
        ], check=True, timeout=80)
    if video_file.stat().st_size < 2000:
        raise RuntimeError(f"Video unexpectedly small: {video_file}")
    print(f"PASS {spec['slug']}: {video_file.stat().st_size} bytes; {len(lines)} visible log lines")
    return {
        "slug": spec["slug"],
        "title": spec["title"],
        "subtitle": spec["subtitle"],
        "command": spec["command"],
        "github_folder": str(folder.relative_to(source)),
        "video": "videos/" + video_file.name,
        "poster": "videos/" + poster.name,
        "duration_seconds": 22,
        "exit_code": completed.returncode,
        "source_commit": source_sha,
        "representation": "captured CLI output edited into annotated slides",
        "output_excerpt": combined[:900],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--source-sha", required=True)
    args = parser.parse_args()
    if shutil.which("ffmpeg") is None:
        raise RuntimeError("ffmpeg is required")
    results = [generate_one(d, args.source, args.output, args.source_sha) for d in DEMOS]
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / "videos.json").write_text(
        json.dumps({"source_commit": args.source_sha, "demos": results}, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"PASS all {len(results)} fresh public demo videos generated")


if __name__ == "__main__":
    main()
