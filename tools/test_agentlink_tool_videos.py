"""Verify tool/example clips are actual playable media from passing public tests."""
import json
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / "agentlink-continuity" / "tool-videos"
PAGE = ROOT / "agentlink-continuity" / "tools.html"
EXPECTED = {
    "csv-quality", "srt-subtitles", "retry-guard", "receipt-ledger",
    "rag-trace", "image-model-benchmark", "editorial-depth", "site-surface",
    "url-contract", "user-bus", "video-redaction", "side-effect-guard",
}


class ToolVideoTests(unittest.TestCase):
    def test_complete_tool_video_gallery(self):
        manifest = json.loads((DIR / "tools.json").read_text(encoding="utf-8"))
        page = PAGE.read_text(encoding="utf-8")
        self.assertEqual({entry["slug"] for entry in manifest["tools"]}, EXPECTED)
        self.assertEqual(len(manifest["tools"]), 12)
        self.assertIn("12種類", page)
        self.assertIn("実画面の連続録画ではなく", page)
        self.assertEqual(len(manifest["source_commit"]), 40)
        for item in manifest["tools"]:
            with self.subTest(slug=item["slug"]):
                slug = item["slug"]
                self.assertEqual(item["source_commit"], manifest["source_commit"])
                self.assertIn(item["github_folder"].split("/")[0], ("tools", "examples"))
                self.assertEqual(item["exit_code"], 0)
                self.assertIn(slug, page)
                self.assertIn("passed", item["output_excerpt"].lower()
                              if slug == "side-effect-guard" else
                              "ran" if "Ran " in item["output_excerpt"] else "not_run")
                path = DIR / f"{slug}.mp4"
                poster = DIR / f"{slug}.jpg"
                self.assertTrue(path.is_file())
                self.assertTrue(poster.is_file())
                self.assertGreater(path.stat().st_size, 2000)
                self.assertGreater(poster.stat().st_size, 3000)
                with path.open("rb") as stream:
                    self.assertEqual(stream.read(8)[4:8], b"ftyp")
                result = subprocess.run(
                    ["ffprobe", "-v", "error", "-show_entries", "format=duration",
                     "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
                    capture_output=True, text=True, check=True, timeout=12,
                )
                self.assertGreater(float(result.stdout.strip()), 20)
                self.assertLess(float(result.stdout.strip()), 24)


if __name__ == "__main__":
    unittest.main()
