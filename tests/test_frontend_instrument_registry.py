import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")
REGISTRY_JS = (ROOT / "assets" / "js" / "core" / "instrument-registry.js").read_text(encoding="utf-8")
DATA_LAB_JS = (ROOT / "assets" / "js" / "modules" / "data-lab.js").read_text(encoding="utf-8")
UNIVERSE = json.loads((ROOT / "data" / "etf-universe.json").read_text(encoding="utf-8"))
PERFORMANCE = json.loads((ROOT / "data" / "etf-performance.json").read_text(encoding="utf-8"))


class FrontendInstrumentRegistryTests(unittest.TestCase):
    def test_registry_is_loaded_before_data_lab(self):
        registry_script = 'src="assets/js/core/instrument-registry.js"'
        data_lab_script = 'src="assets/js/modules/data-lab.js"'
        self.assertIn(registry_script, INDEX)
        self.assertLess(INDEX.index(registry_script), INDEX.index(data_lab_script))
        self.assertIn("window.GCInstrumentRegistry", REGISTRY_JS)
        self.assertIn("window.GCInstrumentRegistry", DATA_LAB_JS)

    def test_classification_and_benchmark_rules_are_centralized(self):
        for label in (
            "Fixed Income",
            "Core Equities",
            "Sectors",
            "US Satellites",
            "European Themes",
            "China / China+1",
            "Hedge",
            "US Treasury 0-1y Index",
            "Fed Funds",
            "Nasdaq-100",
            "S&P 500",
        ):
            self.assertIn(label, REGISTRY_JS)
        self.assertNotIn("category.includes", DATA_LAB_JS)
        self.assertNotIn("NASDAQ_BENCHMARK_TICKERS", DATA_LAB_JS)

    def test_registry_supports_future_instrument_metadata(self):
        for field in (
            "instrumentId",
            "instrumentType",
            "dataFamily",
            "updateFrequency",
            "maturityDate",
            "capabilities",
            "performance",
            "risk",
            "comparison",
            "maturity",
            "yield",
        ):
            self.assertIn(field, REGISTRY_JS)

    def test_current_instrument_coverage_is_preserved(self):
        universe_tickers = [item["ticker"] for item in UNIVERSE["instruments"]]
        performance_tickers = [item["ticker"] for item in PERFORMANCE["instruments"]]
        self.assertEqual(len(universe_tickers), 120)
        self.assertEqual(len(universe_tickers), len(set(universe_tickers)))
        self.assertEqual(set(universe_tickers), set(performance_tickers))

    def test_us_listed_fixed_income_family_is_registered_in_usd(self):
        instruments = {item["ticker"]: item for item in UNIVERSE["instruments"]}
        us_listed = ("SGOV", "SHY", "IEI", "IEF", "TLT", "STIP", "TIP", "LQD", "HYG", "AGG")
        for ticker in us_listed:
            self.assertEqual(instruments[ticker]["wrapper"], "US-listed ETF")
            self.assertEqual(instruments[ticker]["currency"], "USD")
            self.assertEqual(instruments[ticker]["quoteSymbol"], ticker)
            self.assertEqual(instruments[ticker]["assetClass"], "fixed_income")
        self.assertEqual(sum(item["assetClass"] == "fixed_income" for item in UNIVERSE["instruments"]), 21)

    def test_usd_accumulating_ucits_sector_family_is_registered(self):
        instruments = {item["ticker"]: item for item in UNIVERSE["instruments"]}
        ucits_sector_tickers = ("IUIT", "IUCM", "IUCD", "IUMS", "IUES", "IUFS", "IUIS", "IUCS", "IUHC", "IUUS")
        for ticker in ucits_sector_tickers:
            instrument = instruments[ticker]
            self.assertEqual(instrument["wrapper"], "UCITS ETF")
            self.assertEqual(instrument["currency"], "USD")
            self.assertEqual(instrument["quoteSymbol"], f"{ticker}.L")
            self.assertEqual(instrument["assetClass"], "equity")
            self.assertTrue(instrument["category"].startswith("GICS sector /"))
        self.assertNotIn("IUSI", instruments)

    def test_corrected_listings_and_share_classes_are_registered(self):
        instruments = {item["ticker"]: item for item in UNIVERSE["instruments"]}
        self.assertEqual(instruments["IB7A"]["quoteSymbol"], "IB7A.AS")
        self.assertEqual(instruments["TI5A"]["quoteSymbol"], "TI5A.AS")
        self.assertEqual(instruments["IDTP"]["quoteSymbol"], "IDTP.L")
        self.assertEqual(instruments["EXCH"]["quoteSymbol"], "EXCH.AS")
        self.assertEqual(instruments["TIP5"]["name"], "iShares $ TIPS 0-5 UCITS ETF USD Dist")
        self.assertEqual(instruments["EQQQ"]["currency"], "GBp")
        for retired_ticker in ("IBTM", "ITPS", "ITPE"):
            self.assertNotIn(retired_ticker, instruments)


if __name__ == "__main__":
    unittest.main()
