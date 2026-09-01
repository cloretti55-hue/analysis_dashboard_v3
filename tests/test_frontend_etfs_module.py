from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
APP_JS = (ROOT / "assets" / "js" / "app.js").read_text(encoding="utf-8")
ETFS_JS = (ROOT / "assets" / "js" / "modules" / "etfs.js").read_text(encoding="utf-8")
ETFS_CSS = (ROOT / "assets" / "css" / "etfs.css").read_text(encoding="utf-8")


class FrontendEtfsModuleTests(unittest.TestCase):
    def test_module_uses_an_explicit_namespace(self):
        self.assertIn("window.GCEtfs = {", ETFS_JS)
        self.assertIn("} = window.GCEtfs;", APP_JS)

    def test_etf_components_live_outside_app(self):
        for component in (
            "SatelliteModule",
            "EuropeModule",
            "ChinaModule",
            "HedgeModule",
            "CoreModule",
            "FixedIncomeModule",
            "SectorGicsModule",
            "EtfsModule",
        ):
            self.assertIn(f"function {component}", ETFS_JS)
            self.assertNotIn(f"function {component}", APP_JS)

    def test_geography_loading_is_owned_by_etfs_module(self):
        self.assertIn('DataClient.load("etf-geography")', ETFS_JS)
        self.assertNotIn('DataClient.load("etf-geography")', APP_JS)

    def test_data_lab_links_are_conditional_on_the_instrument_catalog(self):
        self.assertIn("function DataLabTickerLink", ETFS_JS)
        self.assertIn('DataClient.load("etf-universe")', ETFS_JS)
        self.assertIn("if (!availableTickers?.has(ticker)) return null", ETFS_JS)
        self.assertIn('href: `#dataLab/${encodeURIComponent(ticker)}`', ETFS_JS)

    def test_data_lab_instruments_can_open_direct_or_aggregate_etf_destinations(self):
        self.assertIn("const ETF_DESTINATIONS = new Map()", ETFS_JS)
        self.assertIn("const etfDestinationForTicker", ETFS_JS)
        self.assertIn("const etfHrefForTicker", ETFS_JS)
        self.assertIn("const requestedEtfDestination", ETFS_JS)
        for route_part in (
            '["SMH", "SOXX"], "satellites", "Semiconductors / AI hardware"',
            '["MCHI", "FXI", "KWEB", "ASHR", "KBA"], "china", "Direct China"',
            '["GLD", "IAU", "FXF"], "hedges", "Macro hedge"',
        ):
            self.assertIn(route_part, ETFS_JS)
        self.assertIn('registerEtfDestination("TIP5", "fixed", "TI5A")', ETFS_JS)

    def test_fixed_income_uses_the_verified_usd_acc_listings(self):
        self.assertIn('tickers: ["IB01", "IBTA", "CBU7", "IB7A", "DTLA"]', ETFS_JS)
        self.assertIn('tickers: ["TI5A", "IDTP"]', ETFS_JS)
        self.assertNotIn('tickers: ["TIP5", "ITPS", "ITPE"]', ETFS_JS)

    def test_core_equities_can_highlight_us_listed_or_ucits_vehicles(self):
        self.assertIn('"aria-label": "Highlight ETFs by listing type"', ETFS_JS)
        self.assertIn('setCoreVehicleView("us") }, "US-listed"', ETFS_JS)
        self.assertIn('setCoreVehicleView("ucits") }, "UCITS"', ETFS_JS)
        self.assertIn('vehicleView === "us" && !UCITS_TICKERS.has(ticker)', ETFS_JS)
        self.assertIn('vehicleView !== "all" && !tickerMatchesVehicleView(ticker, vehicleView)', ETFS_JS)
        self.assertNotIn('classes.push(tickerMatchesVehicleView', ETFS_JS)

    def test_core_and_sector_selection_reuse_their_legend_colours(self):
        self.assertIn("--selection-accent: var(--token-accent);", ETFS_CSS)
        self.assertIn("--group-accent: var(--zone);", ETFS_CSS)
        self.assertIn("--selection-accent: var(--zone);", ETFS_CSS)

    def test_fixed_income_selection_reuses_its_teal_token_colour(self):
        fixed_income_rule = ETFS_CSS.split(".etf-token.etf-fixed {", 1)[1].split("}", 1)[0]
        self.assertIn("--token-accent: #3aa6a3;", fixed_income_rule)
        self.assertIn("--selection-accent: var(--token-accent);", fixed_income_rule)

    def test_all_seven_etf_areas_are_preserved(self):
        for label in (
            "Fixed Income",
            "Core Equities",
            "Sectors",
            "US Satellites",
            "European Themes",
            "China / China+1",
            "Hedge",
        ):
            self.assertIn(label, ETFS_JS)


if __name__ == "__main__":
    unittest.main()
