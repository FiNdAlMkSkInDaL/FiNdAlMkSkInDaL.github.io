"""Build offline VectorBot demo payload from latent-control-lab artifacts."""
from __future__ import annotations

import csv
import json
import random
from pathlib import Path

root = Path(
 r"C:\Users\finla\OneDrive - University College London\Desktop\Zero-API\neural-native-software"
)
routes_path = root / "artifacts" / "vectorbot_routes_full.jsonl"
proj_path = root / "artifacts" / "vectorbot_projection_full.csv"
metrics_path = root / "artifacts" / "vectorbot_metrics_full.json"
steering_path = root / "artifacts" / "vectorbot_steering_demo.json"
out = Path(__file__).resolve().parent

rows = [
 json.loads(line)
 for line in routes_path.read_text(encoding="utf-8").splitlines()
 if line.strip()
]

# Canonical demo script from streamlit_app.py / VECTORBOT_DEMO.md
cmds = [
 "go north",
 "take one step south",
 "slide left",
 "move the bot right",
 "toggle the lamp",
 "reset the board",
 "what is the weather tomorrow?",
 "delete all files on this laptop",
 "move up and then right",
 "paint the robot purple",
]
labels = [
 "MOVE_UP",
 "MOVE_DOWN",
 "MOVE_LEFT",
 "MOVE_RIGHT",
 "TOGGLE_LIGHT",
 "RESET",
 "ABSTAIN",
]

by: dict[str, dict] = {}
for r in rows:
 t = r.get("input_text", "")
 if t in cmds and t not in by:
 by[t] = r

examples = []
for c in cmds:
 r = by[c]
 tops = {p["label"]: p["probability"] for p in r.get("top_probabilities", [])}
 # Prefer full_probabilities when present (post-3c0a996 probe path)
 if r.get("full_probabilities"):
 full = [
 {"label": p["label"], "probability": float(p["probability"])}
 for p in r["full_probabilities"]
 ]
 # normalize order
 pm = {p["label"]: p["probability"] for p in full}
 full = [{"label": lab, "probability": float(pm.get(lab, 0.0))} for lab in labels]
 else:
 rest = max(0.0, 1.0 - sum(tops.values()))
 rem = [lab for lab in labels if lab not in tops]
 full = []
 for lab in labels:
 full.append(
 {
 "label": lab,
 "probability": tops[lab]
 if lab in tops
 else (rest / max(1, len(rem))),
 }
 )
 examples.append(
 {
 "text": c,
 "label": r["predicted_label"],
 "accepted": r["accepted"],
 "confidence": r["confidence"],
 "margin": r.get("margin"),
 "ood_score": r.get("ood_score"),
 "vector_norm": r.get("vector_norm"),
 "probs": full,
 "state_after": r.get("state_after"),
 "state_before": r.get("state_before"),
 }
 )

proj = []
with proj_path.open(encoding="utf-8") as f:
 allp = list(csv.DictReader(f))
random.seed(7)
if len(allp) > 280:
 allp = random.sample(allp, 280)
for p in allp:
 proj.append(
 {
 "x": float(p["x"]),
 "y": float(p["y"]),
 "label": p["label"],
 "accepted": str(p.get("accepted", "")).lower() == "true",
 "text": (p.get("text") or "")[:60],
 }
 )

metrics = {}
if metrics_path.exists():
 raw = json.loads(metrics_path.read_text(encoding="utf-8"))
 metrics = {
 "accuracy": raw.get("accuracy"),
 "macro_f1": raw.get("macro_f1"),
 "abstain_precision": raw.get("abstain_precision"),
 "abstain_recall": raw.get("abstain_recall"),
 "feature_shape": raw.get("feature_shape"),
 "dataset_size": raw.get("dataset_size"),
 "model_id": raw.get("model_id", "distilgpt2"),
 "feature_space": raw.get("feature_space", "pre_lm_head_last_token"),
 }

steering = []
if steering_path.exists():
 sraw = json.loads(steering_path.read_text(encoding="utf-8"))
 steering = sraw.get("steering_results", [])

# Slim route log for the Streamlit "Replay log" expander
routes = []
for r in rows:
 routes.append(
 {
 "input_text": r.get("input_text"),
 "predicted_label": r.get("predicted_label"),
 "accepted": r.get("accepted"),
 "confidence": r.get("confidence"),
 "margin": r.get("margin"),
 "top_probabilities": r.get("top_probabilities"),
 "state_after": r.get("state_after"),
 "state_before": r.get("state_before"),
 }
 )

payload = {
 "examples": examples,
 "routes": routes,
 "projection": proj,
 "labels": labels,
 "metrics": metrics,
 "steering": steering,
 "pipeline": "text → tokenizer → frozen LM forward → pre-lm_head hook → vector → probe + OOD gate → typed enum → kernel",
 "source": "https://github.com/FiNdAlMkSkInDaL/latent-control-lab",
 "streamlit_commit": "3c0a996",
}

(out / "vectorbot_data.json").write_text(json.dumps(payload), encoding="utf-8")
print(
 "ok",
 len(examples),
 len(proj),
 bool(metrics),
 len(steering),
 (out / "vectorbot_data.json").stat().st_size,
)
