"""Check shared config and exercise the actual browser scoring code."""
import argparse
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--node", default="node", help="Node.js executable (18 or later)")
args = parser.parse_args()
subprocess.run([sys.executable, "-B", str(ROOT / "scripts/build_model.py"), "--check"], check=True)
subprocess.run([args.node, "--test", str(ROOT / "tests/model.test.js")], check=True)
