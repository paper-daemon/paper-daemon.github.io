"""Fail CI if any purported AgentLink public-demo video is missing or invalid."""
from __future__ import annotations

import json
import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GALLERY = ROOT / "agentlink-continuity" / "gallery.html"
VIDEOS = ROOT / "agentlink-continuity" / "videos"
EXPECTED = {
    "agent-evaluation": '"passed": 4',
    "idempotency-key": "REPLAY",
    "receipt-recovery": "UNCERTAIN",
    "worker-handoff": "PASS",
    "api-job-orchestrator": "Ran 5 tests",
    "reorder-drift": "3 passed",
}


class PublicDemoVideoTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest = json.loads((VIDEOS / "videos.json").read_text(encoding="utf-8"))
        cls.gallery = GALLERY.read_text(encoding="utf-8")

    def test_all_six_independent_video_demos_are_present(self):
        demos = self.manifest["demos"]
        self.assertEqual(len(demos), 6)
        self.assertEqual(set(EXPECTED), {item["slug"] for item in demos})
        self.assertIn("./watch.html", self.gallery)
        self.assertIn("7種類", self.gallery)

    def test_every_video_is_a_real_playable_mp4_with_verified_run(self):
        for item in self.manifest["demos"]:
            slug = item["slug"]
            with self.subTest(demo=slug):
                path = ROOT / "agentlink-continuity" / item["video"]
                poster = ROOT / "agentlink-continuity" / item["poster"]
                self.assertTrue(path.is_file(), f"Missing MP4: {path}")
                self.assertGreater(path.stat().st_size, 2000)
                with path.open("rb") as stream:
                    first = stream.read(32)
                self.assertEqual(first[4:8], b"ftyp")
                self.assertTrue(poster.is_file())
                self.assertGreater(poster.stat().st_size, 3000)
                self.assertEqual(item["exit_code"], 0)
                self.assertIn(EXPECTED[slug], item["output_excerpt"])
                self.assertIn(item["video"], self.gallery)
                self.assertIn(item["poster"], self.gallery)
                probe = subprocess.run([
                    "ffprobe", "-v", "error", "-show_entries", "format=duration",
                    "-of", "default=noprint_wrappers=1:nokey=1", str(path),
                ], text=True, capture_output=True, check=True, timeout=10)
                duration = float(probe.stdout.strip())
                self.assertGreaterEqual(duration, 20)
                self.assertLessEqual(duration, 24)

    def test_reproducible_source_commit_and_scope(self):
        self.assertRegex(self.manifest["source_commit"], r"^[0-9a-f]{40}$")
        for item in self.manifest["demos"]:
            self.assertEqual(item["source_commit"], self.manifest["source_commit"])
            self.assertTrue(item["github_folder"].startswith("demos/"))
            self.assertEqual(item["representation"], "captured CLI output edited into annotated slides")
        self.assertIn("実サービス接続", self.gallery)
        self.assertIn("デスクトップ画面の生録画ではありません", self.gallery)


if __name__ == "__main__":
    unittest.main()
