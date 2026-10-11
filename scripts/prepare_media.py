"""Create web video copies without changing source recordings.

Usage: python3 scripts/prepare_media.py --ffmpeg /path/to/ffmpeg
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
JOBS = [("resources/Supplementary Video.mp4", "overview")]
for task in ("usb", "cable"):
    for source_name, public_name in (("vla", "vla"), ("cnn", "dsrl"), ("rlt", "rlt"), ("ours", "erlt")):
        suffix = "(1)" if task == "usb" else ""
        JOBS.append((f"resources/videos/{task}-eval/{task}-eval-{source_name}{suffix}.mov", f"{task}-eval-{public_name}"))
    for source_name, public_name in (("cnn", "dsrl"), ("rlt", "rlt"), ("ours", "erlt")):
        suffix = "(1)" if task == "cable" and source_name != "ours" else ""
        JOBS.append((f"resources/videos/{task}-rl-train/{task}-{source_name}{suffix}.mov", f"{task}-train-{public_name}"))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ffmpeg", default="ffmpeg")
    args = parser.parse_args()
    dest = ROOT / "assets/media"
    dest.mkdir(parents=True, exist_ok=True)
    def encode(job):
        source, name = job
        output = dest / f"{name}.tmp.mp4"
        scale = "scale=640:-2" if "-train-" in name else "scale=1280:-2"
        command = [args.ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(ROOT / source),
                   "-map", "0:v:0", "-vf", scale + ",fps=30", "-c:v", "libx264", "-preset", "fast",
                   "-crf", "25", "-pix_fmt", "yuv420p", "-threads", "3", "-movflags", "+faststart"]
        if name == "overview":
            command += ["-map", "0:a?", "-c:a", "aac", "-b:a", "96k"]
        else:
            command += ["-an"]
        subprocess.run(command + [str(output)], check=True)
        output.replace(dest / f"{name}.mp4")
        size = (dest / f"{name}.mp4").stat().st_size / 1024**2
        print(f"{name}: {size:.1f} MB", flush=True)
    with ThreadPoolExecutor(max_workers=2) as pool:
        list(pool.map(encode, JOBS))

if __name__ == "__main__":
    main()
