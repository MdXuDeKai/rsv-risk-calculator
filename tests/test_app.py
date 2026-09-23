from pathlib import Path
import sys
import unittest

from streamlit.testing.v1 import AppTest

APP = Path(__file__).resolve().parents[1] / "web" / "app.py"
sys.path.insert(0, str(APP.parent))


class AppTests(unittest.TestCase):
    def test_default_profile_and_language_switch(self):
        app = AppTest.from_file(str(APP)).run()
        self.assertFalse(app.exception)
        self.assertEqual(app.metric[0].value, "4.6%")
        app.selectbox(key="language").set_value("English").run()
        self.assertFalse(app.exception)
        self.assertEqual(app.metric[0].value, "4.6%")
        self.assertEqual(app.title[0].value, "RSV advanced respiratory support risk")

    def test_example_and_manual_input_update_prediction(self):
        app = AppTest.from_file(str(APP)).run()
        app.selectbox(key="profile").set_value("high").run()
        self.assertFalse(app.exception)
        self.assertEqual(app.metric[0].value, "80.1%")
        self.assertEqual(app.number_input(key="resp_rate_admission").value, 55)
        app.selectbox(key="profile").set_value("event").run()
        self.assertEqual(app.metric[0].value, "28.4%")
        app.number_input(key="resp_rate_admission").set_value(47).run()
        self.assertFalse(app.exception)
        self.assertEqual(app.metric[0].value, "30.5%")
        self.assertEqual(app.selectbox(key="profile").value, "custom")
        app.radio(key="wheezing").set_value(0).run()
        self.assertFalse(app.exception)
        self.assertNotEqual(app.metric[0].value, "30.5%")


if __name__ == "__main__":
    unittest.main()
