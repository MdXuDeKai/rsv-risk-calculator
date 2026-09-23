import math
import unittest

from web.model import CONFIG, predict


class ModelTests(unittest.TestCase):
    def setUp(self):
        self.defaults = {feature["id"]: feature["default"] for feature in CONFIG["features"]}

    def test_verified_example_probabilities(self):
        expected = {"typical": 0.0458373098218993, "event": 0.2843580127982338,
                    "high": 0.8009872626354643}
        for example in CONFIG["examples"]:
            with self.subTest(example=example["id"]):
                self.assertAlmostEqual(predict(example)["probability"], expected[example["id"]], places=14)

    def test_each_predictor_uses_frozen_parameters(self):
        frozen = {
            "age_months": (-0.6881798873611532, 8, 10),
            "resp_rate_admission": (0.8058161775535413, 34, 8),
            "spo2_admission_pct": (-0.5599756259208429, 96, 3),
            "dyspnea_or_breathing_difficulty": (0.5246088417954119, 0, 1),
            "wheezing": (-0.26324414122189255, 1, 1),
        }
        for feature in CONFIG["features"]:
            key = feature["id"]
            coefficient, centre, scale = frozen[key]
            self.assertEqual((feature["coef"], feature["center"], feature["scale"]), frozen[key])
            value = 0 if key == "wheezing" else centre + scale
            result = predict({**self.defaults, key: value})
            expected = -3.0357358072611307 + coefficient * (value - centre) / scale
            self.assertAlmostEqual(result["linear"], expected, places=14)

    def test_missing_values_use_development_medians(self):
        for key in self.defaults:
            for value in (None, math.nan, "", "  "):
                with self.subTest(key=key, value=value):
                    result = predict({**self.defaults, key: value})
                    self.assertAlmostEqual(result["probability"], 0.0458373098218993, places=14)
                    self.assertTrue(next(part["imputed"] for part in result["parts"] if part["id"] == key))
        self.assertAlmostEqual(predict()["probability"], 0.0458373098218993, places=14)

    def test_invalid_inputs_are_rejected(self):
        for value in (math.inf, -math.inf, "inf", "NaN", "abc", [], {}, True, False):
            with self.subTest(value=value), self.assertRaises(ValueError):
                predict({**self.defaults, "spo2_admission_pct": value})
        for key, value in (("age_months", 25), ("resp_rate_admission", -1),
                           ("spo2_admission_pct", 101), ("wheezing", 0.5),
                           ("dyspnea_or_breathing_difficulty", 2)):
            with self.subTest(key=key), self.assertRaises(ValueError):
                predict({**self.defaults, key: value})

    def test_numeric_strings_and_binary_zero(self):
        values = {**self.defaults, "wheezing": 0, "dyspnea_or_breathing_difficulty": 1}
        numeric, strings = predict(values), predict({key: str(value) for key, value in values.items()})
        self.assertEqual(numeric["probability"], strings["probability"])
        self.assertFalse(next(part["imputed"] for part in numeric["parts"] if part["id"] == "wheezing"))

    def test_supported_boundary_values(self):
        for edge in ("min", "max"):
            result = predict({feature["id"]: feature[edge] for feature in CONFIG["features"]})
            self.assertTrue(math.isfinite(result["probability"]))
            self.assertGreater(result["probability"], 0)
            self.assertLess(result["probability"], 1)


if __name__ == "__main__":
    unittest.main()
