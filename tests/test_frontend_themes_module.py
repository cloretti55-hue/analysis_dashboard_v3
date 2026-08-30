from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
APP_JS = (ROOT / "assets" / "js" / "app.js").read_text(encoding="utf-8")
THEMES_JS = (ROOT / "assets" / "js" / "modules" / "themes.js").read_text(encoding="utf-8")


class FrontendThemesModuleTests(unittest.TestCase):
    def test_module_uses_an_explicit_namespace(self):
        self.assertIn("window.GCThemes = {", THEMES_JS)
        self.assertIn("} = window.GCThemes;", APP_JS)

    def test_theme_components_live_outside_app(self):
        for component in ("TechCycleModule", "ThemesModule"):
            self.assertIn(f"function {component}", THEMES_JS)
            self.assertNotIn(f"function {component}", APP_JS)
        self.assertNotIn("THEME_BRIEFINGS", APP_JS)

    def test_all_theme_pages_are_preserved(self):
        for key in (
            "gold-commodities",
            "ai-stress",
            "global-public-debt",
            "ai-ecosystem",
            "corporate-revenue",
            "tech-cycles",
        ):
            self.assertIn(f'key: "{key}"', THEMES_JS)
        self.assertEqual(THEMES_JS.count('src: "assets/themes/'), 19)

    def test_image_lightbox_zoom_and_history_are_preserved(self):
        self.assertIn("const imageZoomLevels = [0.5, 0.6, 0.8, 1, 1.2", THEMES_JS)
        self.assertIn('"Image zoom controls"', THEMES_JS)
        self.assertIn('}, "100%")', THEMES_JS)
        self.assertIn('}, "Close")', THEMES_JS)
        self.assertIn('root.style.overflow = "hidden"', THEMES_JS)
        self.assertIn('window.history.pushState({ module: "tech", theme: activeTheme.key, image: index }', THEMES_JS)
        self.assertIn("const hashParts = () =>", THEMES_JS)


if __name__ == "__main__":
    unittest.main()
