"""Inference for the fixed five-predictor logistic regression; no fitting."""
import json
import math
from pathlib import Path

CONFIG = json.loads(Path(__file__).with_name("model.json").read_text(encoding="utf-8"))


def predict(values=None):
    """Return probability, log-odds and contributions using the exported parameters."""
    values = {} if values is None else values
    linear = CONFIG["intercept"]
    parts = []
    for feature in CONFIG["features"]:
        value = values.get(feature["id"])
        imputed = (
            value is None
            or (isinstance(value, str) and not value.strip())
            or (isinstance(value, float) and math.isnan(value))
        )
        if imputed:
            raw = float(feature["impute"])
        else:
            if isinstance(value, bool) or not isinstance(value, (int, float, str)):
                raise ValueError(f"Expected a numeric input: {feature['id']}")
            try:
                raw = float(value)
            except ValueError as exc:
                raise ValueError(f"Expected a numeric input: {feature['id']}") from exc
        if not math.isfinite(raw):
            raise ValueError(f"Expected a finite number: {feature['id']}")
        if not feature["min"] <= raw <= feature["max"]:
            raise ValueError(f"Input outside the supported range: {feature['id']}")
        if feature["type"] == "binary" and raw not in (0, 1):
            raise ValueError(f"Expected 0 or 1: {feature['id']}")
        standardised = (raw - feature["center"]) / feature["scale"]
        contribution = feature["coef"] * standardised
        linear += contribution
        parts.append({"id": feature["id"], "raw": raw, "imputed": imputed,
                      "standardised": standardised, "contribution": contribution})
    if linear >= 0:
        probability = 1 / (1 + math.exp(-linear))
    else:
        exponential = math.exp(linear)
        probability = exponential / (1 + exponential)
    return {"probability": probability, "linear": linear,
            "intercept": CONFIG["intercept"], "parts": parts}
