const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const context = vm.createContext({ window: {} });
for (const file of ["model-data.js", "model.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, "js", file), "utf8"), context);
}
const model = context.window.RSVModel;
const defaults = Object.fromEntries(model.FEATURES.map((f) => [f.id, f.default]));
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-14, `${actual} != ${expected}`);

test("browser config is identical to the exported model", () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, "data/model.json"), "utf8"));
  assert.deepEqual(JSON.parse(JSON.stringify(context.window.RSVModelData)), config);
});

test("synthetic example probabilities match the independently verified formula", () => {
  const expected = { typical: 0.0458373098218993, event: 0.2843580127982338, high: 0.8009872626354643 };
  assert.equal(model.EXAMPLES.length, 3);
  for (const example of model.EXAMPLES) close(model.score(example).probability, expected[example.id]);
});

test("each predictor has the frozen coefficient, centre and scale", () => {
  const frozen = {
    age_months: [-0.6881798873611532, 8, 10],
    resp_rate_admission: [0.8058161775535413, 34, 8],
    spo2_admission_pct: [-0.5599756259208429, 96, 3],
    dyspnea_or_breathing_difficulty: [0.5246088417954119, 0, 1],
    wheezing: [-0.26324414122189255, 1, 1],
  };
  for (const f of model.FEATURES) {
    const [coef, center, scale] = frozen[f.id];
    assert.deepEqual([f.coef, f.center, f.scale], [coef, center, scale]);
    const value = f.id === "wheezing" ? 0 : center + scale;
    close(model.score({ ...defaults, [f.id]: value }).linear,
      -3.0357358072611307 + coef * (value - center) / scale);
  }
});

test("missing values use development medians, including empty strings", () => {
  for (const f of model.FEATURES) {
    for (const value of [null, undefined, NaN, "", "  "]) {
      const result = model.score({ ...defaults, [f.id]: value });
      close(result.probability, 0.0458373098218993);
      assert.equal(result.parts.find((part) => part.id === f.id).imputed, true);
    }
  }
  close(model.score().probability, 0.0458373098218993);
});

test("malformed and out-of-range values are rejected", () => {
  for (const value of [Infinity, -Infinity, "Infinity", "abc", [], {}, true, false]) {
    assert.throws(() => model.score({ ...defaults, spo2_admission_pct: value }), /finite|numeric/);
  }
  for (const [id, value] of [["age_months", 25], ["resp_rate_admission", -1], ["spo2_admission_pct", 101], ["wheezing", 0.5], ["dyspnea_or_breathing_difficulty", 2]]) {
    assert.throws(() => model.score({ ...defaults, [id]: value }), /range/);
  }
});

test("numeric strings, binary zero and supported extremes remain valid", () => {
  const input = { ...defaults, wheezing: 0, dyspnea_or_breathing_difficulty: 1 };
  const strings = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, String(value)]));
  close(model.score(input).probability, model.score(strings).probability);
  assert.equal(model.score(input).parts.find((part) => part.id === "wheezing").imputed, false);
  for (const edge of ["min", "max"]) {
    const result = model.score(Object.fromEntries(model.FEATURES.map((f) => [f.id, f[edge]])));
    assert.ok(Number.isFinite(result.probability) && result.probability > 0 && result.probability < 1);
  }
});
