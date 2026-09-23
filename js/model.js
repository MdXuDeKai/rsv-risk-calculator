/** Five-predictor logistic regression for research demonstration. */
(function (global) {
  const config = global.RSVModelData;
  const FEATURES = config.features;
  const INTERCEPT = config.intercept;

  function sigmoid(z) {
    if (z >= 0) {
      const e = Math.exp(-z);
      return 1 / (1 + e);
    }
    const e = Math.exp(z);
    return e / (1 + e);
  }

  function logit(p) {
    const q = Math.min(1 - 1e-12, Math.max(1e-12, p));
    return Math.log(q / (1 - q));
  }

  function score(input = {}) {
    const parts = [];
    let linear = INTERCEPT;

    FEATURES.forEach((f) => {
      const value = input[f.id];
      const imputed = value === null || value === undefined ||
        (typeof value === "string" && value.trim() === "") ||
        (typeof value === "number" && Number.isNaN(value));
      const raw = imputed ? f.impute : Number(value);
      if (!imputed && !["number", "string"].includes(typeof value)) {
        throw new TypeError(`Invalid numeric input: ${f.id}`);
      }
      if (!Number.isFinite(raw)) {
        throw new TypeError(`Expected a finite number: ${f.id}`);
      }
      if (raw < f.min || raw > f.max || (f.type === "binary" && raw !== 0 && raw !== 1)) {
        throw new RangeError(`Input outside the supported range: ${f.id}`);
      }
      const z = (raw - f.center) / f.scale;
      const contribution = f.coef * z;
      linear += contribution;
      parts.push({
        id: f.id,
        raw,
        imputed,
        standardised: z,
        contribution,
        coef: f.coef,
      });
    });

    const probability = sigmoid(linear);
    parts.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

    return {
      intercept: INTERCEPT,
      linear,
      probability,
      odds: probability / (1 - probability),
      parts,
    };
  }

  global.RSVModel = {
    FEATURES,
    INTERCEPT,
    EXAMPLES: config.examples,
    score,
    sigmoid,
    logit,
  };
})(window);
