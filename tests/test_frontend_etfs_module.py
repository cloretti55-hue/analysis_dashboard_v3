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

    def test_fixed_income_pairs_us_listed_and_verified_usd_ucits_vehicles(self):
        expected_pairs = [
            ("Treasury liquidity", "SGOV", "IB01"),
            ("Treasury 1–3 years", "SHY", "IBTA"),
            ("Treasury 3–7 years", "IEI", "CBU7"),
            ("Treasury 7–10 years", "IEF", "IB7A"),
            ("Treasury 20+ years", "TLT", "DTLA"),
            ("TIPS 0–5 years", "STIP", "TI5A"),
            ("Broad TIPS", "TIP", "IDTP"),
            ("Investment-grade credit", "LQD", "LQDA"),
            ("High-yield credit", "HYG", "IHYA"),
            ("Aggregate bonds", "AGG", "AGGU"),
        ]
        for title, us_listed, ucits in expected_pairs:
            self.assertIn(f'fn: "{title}"', ETFS_JS)
            self.assertIn(f'tickers: ["{us_listed}", "{ucits}"]', ETFS_JS)
        self.assertNotIn('tickers: ["TIP5", "ITPS", "ITPE"]', ETFS_JS)

    def test_core_equities_can_highlight_us_listed_or_ucits_vehicles(self):
        self.assertIn('"aria-label": "Filter ETFs by listing type"', ETFS_JS)
        self.assertIn('setCoreVehicleView("us") }, "US-listed"', ETFS_JS)
        self.assertIn('setCoreVehicleView("ucits") }, "UCITS"', ETFS_JS)
        self.assertIn('vehicleView === "us" && !UCITS_TICKERS.has(ticker)', ETFS_JS)
        self.assertIn('vehicleView !== "all" && !tickerMatchesVehicleView(ticker, vehicleView)', ETFS_JS)
        self.assertNotIn('classes.push(tickerMatchesVehicleView', ETFS_JS)

    def test_fixed_income_uses_the_same_listing_filter(self):
        self.assertIn('legendMode: "fixed", showVehicleToggle: true', ETFS_JS)
        self.assertIn('className: "core-legend-row"', ETFS_JS)

    def test_fixed_income_legend_and_cards_share_four_category_colours(self):
        expected_groups = (
            ("Nominal Treasuries", "etf-treasury", "--fixed-treasury-accent: #4f8ff7;"),
            ("Inflation-linked", "etf-inflation", "--fixed-inflation-accent: #35b5a4;"),
            ("Corporate credit", "etf-credit", "--fixed-credit-accent: #d7a84c;"),
            ("Aggregate bonds", "etf-aggregate", "--fixed-aggregate-accent: #8d7cf6;"),
        )
        for label, class_name, colour in expected_groups:
            self.assertIn(f'className: "etf-token {class_name}"', ETFS_JS)
            self.assertIn(f'"{label}"', ETFS_JS)
            self.assertIn(colour, ETFS_CSS)
            self.assertIn(f'.core-function:has(.{class_name})', ETFS_CSS)

    def test_core_and_sector_selection_reuse_their_legend_colours(self):
        self.assertIn("--selection-accent: var(--token-accent);", ETFS_CSS)
        self.assertIn("--group-accent: var(--zone);", ETFS_CSS)
        self.assertIn("--selection-accent: var(--zone);", ETFS_CSS)

    def test_sectors_pair_us_listed_and_ucits_vehicles_under_one_filter(self):
        expected_pairs = (
            ("XLK", "IUIT"),
            ("XLC", "IUCM"),
            ("XLY", "IUCD"),
            ("XLB", "IUMS"),
            ("XLE", "IUES"),
            ("XLF", "IUFS"),
            ("XLI", "IUIS"),
            ("XLP", "IUCS"),
            ("XLV", "IUHC"),
            ("XLU", "IUUS"),
        )
        for us_listed, ucits in expected_pairs:
            self.assertIn(f'tickers: ["{us_listed}", "{ucits}"]', ETFS_JS)
        self.assertIn('tickers: ["XLRE"]', ETFS_JS)
        self.assertIn('"aria-label": "Filter sector ETFs by listing type"', ETFS_JS)
        self.assertIn('setSectorVehicleView("us") }, "US-listed"', ETFS_JS)
        self.assertIn('setSectorVehicleView("ucits") }, "UCITS"', ETFS_JS)
        self.assertIn('disabled: !tickerMatchesVehicleView(ticker, vehicleView)', ETFS_JS)
        self.assertIn('item.tickers.forEach((ticker) => registerEtfDestination(ticker, "sectors", ticker))', ETFS_JS)

    def test_sector_detail_and_data_lab_link_use_the_selected_ticker(self):
        self.assertIn('React.createElement("h2", null, selectedSector)', ETFS_JS)
        self.assertIn(
            'React.createElement(DataLabTickerLink, { ticker: selectedSector, availableTickers: dataLabTickers })',
            ETFS_JS,
        )
        self.assertNotIn("activeMeta.ticker", ETFS_JS)

    def test_fixed_income_selection_reuses_each_category_colour(self):
        fixed_income_rule = ETFS_CSS.split(".etf-token.etf-treasury,", 1)[1].split("}", 1)[0]
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
