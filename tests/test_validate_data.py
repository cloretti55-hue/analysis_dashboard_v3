from __future__ import annotations

import copy
import importlib.util
import json
import tempfile
import unittest
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "scripts" / "validate-data.py"
SPEC = importlib.util.spec_from_file_location("validate_data", MODULE_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Could not load {MODULE_PATH}")
VALIDATE_DATA = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(VALIDATE_DATA)


class ValidateDataTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.universe = json.loads((ROOT / "data" / "etf-universe.json").read_text(encoding="utf-8"))
        cls.fixed_income = json.loads(
            (ROOT / "data" / "fixed-income-performance.json").read_text(encoding="utf-8")
        )
        cls.curve = json.loads((ROOT / "data" / "curve-us.json").read_text(encoding="utf-8"))

    def test_current_datasets_have_no_blocking_errors(self) -> None:
        manifest, error_count = VALIDATE_DATA.build_manifest()
        self.assertEqual(error_count, 0)
        self.assertEqual(manifest["summary"]["blockingErrorCount"], 0)

    def test_manifest_generation_is_deterministic(self) -> None:
        first, _ = VALIDATE_DATA.build_manifest()
        second, _ = VALIDATE_DATA.build_manifest()
        self.assertEqual(
            VALIDATE_DATA.serialized_manifest(first),
            VALIDATE_DATA.serialized_manifest(second),
        )

    def test_manifest_comparison_ignores_line_endings(self) -> None:
        manifest, _ = VALIDATE_DATA.build_manifest()
        windows_text = VALIDATE_DATA.serialized_manifest(manifest).replace("\n", "\r\n")
        with tempfile.TemporaryDirectory() as temporary_directory:
            path = Path(temporary_directory) / "manifest.json"
            path.write_bytes(windows_text.encode("utf-8"))
            self.assertTrue(VALIDATE_DATA.manifest_matches(path, manifest))

    def test_dataset_hash_ignores_json_formatting_and_line_endings(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            windows_path = directory / "windows.json"
            linux_path = directory / "linux.json"
            windows_path.write_bytes(b'{\r\n  "b": 2,\r\n  "a": 1\r\n}\r\n')
            linux_path.write_bytes(b'{"a":1,"b":2}\n')
            self.assertEqual(
                VALIDATE_DATA.file_sha256(windows_path),
                VALIDATE_DATA.file_sha256(linux_path),
            )

    def test_previous_benchmark_history_can_be_reused_independently(self) -> None:
        module_path = ROOT / "scripts" / "update-etf-performance.py"
        spec = importlib.util.spec_from_file_location("update_etf_performance", module_path)
        if spec is None or spec.loader is None:
            self.fail(f"Could not load {module_path}")
        updater = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(updater)
        previous = {
            "performanceChart": {
                "points": [
                    {"date": "2026-07-22", "etf": 101.0, "cash": 100.2},
                    {"date": "2026-07-23", "etf": 101.1, "cash": 100.3},
                ]
            }
        }
        self.assertEqual(
            [
                {"date": row["date"].isoformat(), "close": row["close"]}
                for row in updater.previous_benchmark_history(previous, "cash")
            ],
            [
                {"date": "2026-07-22", "close": 100.2},
                {"date": "2026-07-23", "close": 100.3},
            ],
        )

    def test_current_fixed_income_price_survives_benchmark_timeout(self) -> None:
        module_path = ROOT / "scripts" / "update-etf-performance.py"
        spec = importlib.util.spec_from_file_location("update_etf_performance_timeout", module_path)
        if spec is None or spec.loader is None:
            self.fail(f"Could not load {module_path}")
        updater = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(updater)

        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            updater.UNIVERSE_PATH = directory / "etf-universe.json"
            updater.OUTPUT_PATH = directory / "etf-performance.json"
            updater.FIXED_INCOME_FALLBACK_PATH = directory / "fixed-income-performance.json"
            universe = {
                "benchmarkDefaults": {
                    "sp500": {"quoteSymbol": "SPY"},
                    "fedFunds": {"series": "DFF", "display": "Fed Funds accrued return"},
                },
                "instruments": [
                    {
                        "ticker": "IB01",
                        "name": "Test bond ETF",
                        "assetClass": "fixed_income",
                        "category": "Treasury bills",
                        "wrapper": "UCITS ETF",
                        "currency": "USD",
                        "quoteSource": "yahoo_chart",
                        "quoteSymbol": "IB01.L",
                        "benchmark": None,
                        "compareToSp500": False,
                        "valuation": None,
                    }
                ],
            }
            previous = {
                "instruments": [
                    {
                        **universe["instruments"][0],
                        "status": "ok",
                        "asOf": "2026-07-23",
                        "lastClose": 121.0,
                        "performanceChart": {
                            "points": [
                                {"date": "2026-07-22", "etf": 100.0, "cash": 100.0},
                                {"date": "2026-07-23", "etf": 100.1, "cash": 100.1},
                            ]
                        },
                    }
                ]
            }
            updater.UNIVERSE_PATH.write_text(json.dumps(universe), encoding="utf-8")
            updater.OUTPUT_PATH.write_text(json.dumps(previous), encoding="utf-8")
            updater.FIXED_INCOME_FALLBACK_PATH.write_text(json.dumps(previous), encoding="utf-8")

            history = [
                {"date": date(2026, 7, 28), "close": 121.1},
                {"date": date(2026, 7, 29), "close": 121.2},
                {"date": date(2026, 7, 30), "close": 121.3},
            ]
            updater.fetch_yahoo_chart_history = lambda _symbol: history
            updater.metrics_for_history = lambda _history: {
                "asOf": "2026-07-30",
                "lastClose": 121.3,
            }

            def fail_fred(_series: str) -> list[dict]:
                raise TimeoutError("temporary FRED timeout")

            updater.fetch_fred_rate_history = fail_fred
            updater.main()

            current = json.loads(updater.OUTPUT_PATH.read_text(encoding="utf-8"))
            instrument = current["instruments"][0]
            self.assertEqual(instrument["asOf"], "2026-07-30")
            self.assertEqual(instrument["status"], "ok")
            self.assertNotIn("stale", instrument)
            self.assertEqual(instrument["benchmarkStatus"], "stale")
            self.assertEqual(instrument["performanceChart"]["endDate"], "2026-07-30")

            fixed = json.loads(
                updater.FIXED_INCOME_FALLBACK_PATH.read_text(encoding="utf-8")
            )
            self.assertEqual(fixed["asOf"], "2026-07-30")

    def test_new_fixed_income_reuses_shared_cash_benchmark_after_fred_timeout(self) -> None:
        module_path = ROOT / "scripts" / "update-etf-performance.py"
        spec = importlib.util.spec_from_file_location("update_etf_performance_shared_cash", module_path)
        if spec is None or spec.loader is None:
            self.fail(f"Could not load {module_path}")
        updater = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(updater)

        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            updater.UNIVERSE_PATH = directory / "etf-universe.json"
            updater.OUTPUT_PATH = directory / "etf-performance.json"
            updater.FIXED_INCOME_FALLBACK_PATH = directory / "fixed-income-performance.json"
            base_item = {
                "name": "Test bond ETF",
                "assetClass": "fixed_income",
                "category": "Treasury bills",
                "currency": "USD",
                "quoteSource": "yahoo_chart",
                "benchmark": None,
                "compareToSp500": False,
                "valuation": None,
            }
            universe = {
                "benchmarkDefaults": {
                    "sp500": {"quoteSymbol": "SPY"},
                    "fedFunds": {"series": "DFF", "display": "Fed Funds accrued return"},
                },
                "instruments": [
                    {
                        **base_item,
                        "ticker": "IB01",
                        "wrapper": "UCITS ETF",
                        "quoteSymbol": "IB01.L",
                    },
                    {
                        **base_item,
                        "ticker": "SGOV",
                        "wrapper": "US-listed ETF",
                        "quoteSymbol": "SGOV",
                    },
                ],
            }
            previous = {
                "instruments": [
                    {
                        **universe["instruments"][0],
                        "status": "ok",
                        "asOf": "2026-07-23",
                        "performanceChart": {
                            "points": [
                                {"date": "2026-07-22", "etf": 100.0, "cash": 100.0},
                                {"date": "2026-07-23", "etf": 100.1, "cash": 100.1},
                            ]
                        },
                    }
                ]
            }
            updater.UNIVERSE_PATH.write_text(json.dumps(universe), encoding="utf-8")
            updater.OUTPUT_PATH.write_text(json.dumps(previous), encoding="utf-8")
            updater.FIXED_INCOME_FALLBACK_PATH.write_text(json.dumps(previous), encoding="utf-8")

            history = [
                {"date": date(2026, 7, 22), "close": 100.0},
                {"date": date(2026, 7, 23), "close": 100.1},
                {"date": date(2026, 7, 24), "close": 100.2},
            ]
            updater.fetch_yahoo_chart_history = lambda _symbol: history
            updater.metrics_for_history = lambda _history: {
                "asOf": "2026-07-24",
                "lastClose": 100.2,
            }
            updater.fetch_fred_rate_history = lambda _series: (_ for _ in ()).throw(
                TimeoutError("temporary FRED timeout")
            )

            updater.main()

            current = json.loads(updater.OUTPUT_PATH.read_text(encoding="utf-8"))
            by_ticker = {item["ticker"]: item for item in current["instruments"]}
            new_item = by_ticker["SGOV"]
            self.assertEqual(new_item["benchmarkStatus"], "stale")
            self.assertEqual(new_item["benchmarkAsOf"], "2026-07-23")
            self.assertTrue(
                all("cash" in point for point in new_item["performanceChart"]["points"][:2])
            )

    def test_scoped_error_does_not_block_unrelated_dataset(self) -> None:
        manifest = {
            "datasets": [
                {"id": "curve-us", "status": "ok"},
                {"id": "etf-performance", "status": "error"},
            ]
        }
        self.assertEqual(
            VALIDATE_DATA.blocking_error_count(manifest, {"curve-us"}),
            0,
        )
        self.assertEqual(
            VALIDATE_DATA.blocking_error_count(manifest, {"etf-performance"}),
            1,
        )
        self.assertEqual(
            VALIDATE_DATA.blocking_error_count(manifest),
            1,
        )

    def test_missing_curve_maturity_is_blocking(self) -> None:
        payload = copy.deepcopy(self.curve)
        del payload["curves"]["real"]["10Y"]
        issues: list[dict[str, str]] = []
        VALIDATE_DATA.validate_curve(payload, issues)
        self.assertTrue(
            any(
                issue["severity"] == "error"
                and issue["code"] == "invalid_curve_value"
                for issue in issues
            )
        )

    def test_partial_fixed_income_fallback_is_blocking(self) -> None:
        payload = copy.deepcopy(self.fixed_income)
        payload["instruments"] = payload["instruments"][:-1]
        issues: list[dict[str, str]] = []
        VALIDATE_DATA.validate_performance(
            payload,
            issues,
            self.universe,
            fixed_only=True,
        )
        self.assertTrue(
            any(
                issue["severity"] == "error"
                and issue["code"] == "missing_tickers"
                for issue in issues
            )
        )

    def test_stale_benchmark_is_visible_but_not_blocking(self) -> None:
        payload = copy.deepcopy(self.fixed_income)
        for instrument in payload["instruments"]:
            instrument["benchmarkStatus"] = "ok"
            instrument["benchmarkError"] = None
        payload["instruments"][0]["benchmarkStatus"] = "stale"
        payload["instruments"][0]["benchmarkError"] = "temporary source timeout"
        issues: list[dict[str, str]] = []
        metrics = VALIDATE_DATA.validate_performance(
            payload,
            issues,
            self.universe,
            fixed_only=True,
        )
        self.assertEqual(metrics["staleBenchmarkCount"], 1)
        self.assertTrue(
            any(
                issue["severity"] == "warning"
                and issue["code"] == "stale_benchmarks"
                for issue in issues
            )
        )
        self.assertFalse(any(issue["severity"] == "error" for issue in issues))

    def test_duplicate_universe_ticker_is_blocking(self) -> None:
        payload = copy.deepcopy(self.universe)
        payload["instruments"].append(copy.deepcopy(payload["instruments"][0]))
        issues: list[dict[str, str]] = []
        VALIDATE_DATA.validate_etf_universe(payload, issues)
        self.assertTrue(
            any(
                issue["severity"] == "error"
                and issue["code"] == "duplicate_ticker"
                for issue in issues
            )
        )


if __name__ == "__main__":
    unittest.main()
