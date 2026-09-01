window.GCInstrumentRegistry = (() => {
const DATA_LAB_METRICS = [
  ["returnYtdPct", "YTD"],
  ["return1yPct", "1 year"],
  ["return3yAnnPct", "3-year annualised return"],
  ["return5yAnnPct", "5-year annualised return"],
  ["vol1yAnnPct", "1-year annualised volatility"],
  ["maxDrawdown1yPct", "1-year maximum drawdown"],
  ["beta1yVsSp500", "1-year beta"],
];

const DATA_LAB_GROUPS = ["Fixed Income", "Core Equities", "Sectors", "US Satellites", "European Themes", "China / China+1", "Hedge"];

const DATA_LAB_SUBGROUP_ORDER = {
  "Fixed Income": ["USD liquidity", "Treasuries by duration", "TIPS / inflation", "USD credit", "Core aggregate bonds"],
  "Core Equities": ["Broad US", "Growth / Nasdaq", "Developed global core", "Developed ex-US", "European core", "Emerging markets"],
  Sectors: ["Growth / communication", "Cyclicals", "Defensives / yield", "Other sectors"],
  "US Satellites": ["AI / semiconductors", "Security / defence", "Infrastructure / energy", "Onshoring / reindustrialisation", "Technology optionality", "Constrained economy"],
  "European Themes": ["Defence", "Luxury / indirect China", "Pharma / healthcare", "Industrials / electrification", "Digital sovereignty"],
  "China / China+1": ["Direct China", "Indirect China", "China+1", "EM ex-China"],
  Hedge: ["Option income", "Beta reduction", "Volatility", "Directional hedge", "Deconcentration", "Macro"],
};

const SUBGROUP_TONES = {
  "USD liquidity": "#42d1b7",
  "Treasuries by duration": "#7fb8ff",
  "TIPS / inflation": "#77d38b",
  "USD credit": "#9ea7ff",
  "Core aggregate bonds": "#8bc7ff",
  "Broad US": "#54b6ff",
  "Growth / Nasdaq": "#6f8cff",
  "Developed global core": "#3cc7d6",
  "Developed ex-US": "#7ac6ff",
  "European core": "#86a8ff",
  "Emerging markets": "#4fd6a8",
  "Growth / communication": "#5d8cff",
  Cyclicals: "#4eb7e8",
  "Defensives / yield": "#55c891",
  "Other sectors": "#9da8b8",
  "AI / semiconductors": "#5d8cff",
  "Security / defence": "#50c7d8",
  "Infrastructure / energy": "#58c489",
  "Onshoring / reindustrialisation": "#7aa7ff",
  "Technology optionality": "#8c7dff",
  "Constrained economy": "#4ec0a8",
  Defence: "#54b5d8",
  "Luxury / indirect China": "#c5a35a",
  "Pharma / healthcare": "#5ec08b",
  "Industrials / electrification": "#62b6d8",
  "Digital sovereignty": "#8a9cff",
  "Direct China": "#5d8cff",
  "Indirect China": "#63c7d2",
  "China+1": "#65bf8b",
  "EM ex-China": "#8aa4ff",
  "Option income": "#7fa8ff",
  "Beta reduction": "#62c2d8",
  Volatility: "#9d8cff",
  "Directional hedge": "#e08585",
  Deconcentration: "#6cc4a0",
  Macro: "#c8a85a",
};

const categoryOf = (item) => (item?.category || "").toLowerCase();

const rawGroupFor = (item) => {
  const category = categoryOf(item);
  if (category.includes("gics sector")) return "Sectors";
  if (category.includes("covered call") || category.includes("minimum volatility") || category.includes("vix") || category.includes("inverse") || category.includes("concentration hedge") || category.includes("gold") || category.includes("swiss franc")) return "Hedge";
  if (category.includes("treasuries") || category.includes("treasury bills") || category.includes("inflation usd") || category.includes("credit") || category.includes("high yield") || category.includes("core bond")) return "Fixed Income";
  if (category.includes("china") || category.includes("em ex-china") || category.includes("china+1") || category.includes("asia technology") || category.includes("copper miners") || category.includes("metals and mining")) return "China / China+1";
  if (category.includes("luxury") || category.includes("europe healthcare") || category.includes("global healthcare")) return "European Themes";
  if (category.startsWith("core") || category.includes("s&p 500 benchmark") || category.includes("us growth") || category.includes("nasdaq-100")) return "Core Equities";
  return "US Satellites";
};

const groupFor = (item) => item?.registry?.group || rawGroupFor(item);

const rawSubgroupFor = (item) => {
  const category = categoryOf(item);
  const ticker = item?.ticker || "";
  const group = rawGroupFor(item);

  if (group === "Fixed Income") {
    if (category.includes("treasury bills") || category.includes("liquidity")) return "USD liquidity";
    if (category.includes("treasuries")) return "Treasuries by duration";
    if (category.includes("inflation")) return "TIPS / inflation";
    if (category.includes("credit") || category.includes("high yield")) return "USD credit";
    return "Core aggregate bonds";
  }

  if (group === "Core Equities") {
    if (category.includes("s&p 500 benchmark") || category.includes("core us equity")) return "Broad US";
    if (category.includes("nasdaq") || category.includes("us growth")) return "Growth / Nasdaq";
    if (category.includes("global developed")) return "Developed global core";
    if (category.includes("developed ex-us")) return "Developed ex-US";
    if (category.includes("core europe")) return "European core";
    if (category.includes("emerging")) return "Emerging markets";
    return "Broad US";
  }

  if (group === "Sectors") {
    if (["XLK", "XLC", "XLY"].includes(ticker)) return "Growth / communication";
    if (["XLF", "XLI", "XLB", "XLE"].includes(ticker)) return "Cyclicals";
    if (["XLV", "XLP", "XLU", "XLRE"].includes(ticker)) return "Defensives / yield";
    return "Other sectors";
  }

  if (group === "US Satellites") {
    if (category.includes("semiconductor") || category.includes("ai")) return "AI / semiconductors";
    if (category.includes("defense") || category.includes("cyber")) return "Security / defence";
    if (category.includes("grid") || category.includes("infrastructure") || category.includes("energy")) return "Infrastructure / energy";
    if (category.includes("onshoring") || category.includes("reindustrialization")) return "Onshoring / reindustrialisation";
    if (category.includes("robot") || category.includes("quantum")) return "Technology optionality";
    return "Constrained economy";
  }

  if (group === "European Themes") {
    if (category.includes("defense")) return "Defence";
    if (category.includes("luxury")) return "Luxury / indirect China";
    if (category.includes("healthcare")) return "Pharma / healthcare";
    if (category.includes("industrial") || category.includes("electrification")) return "Industrials / electrification";
    return "Digital sovereignty";
  }

  if (group === "China / China+1") {
    if (category.includes("direct") || category.includes("china equity")) return "Direct China";
    if (category.includes("china+1")) return "China+1";
    if (category.includes("ex-china")) return "EM ex-China";
    if (category.includes("copper") || category.includes("metals and mining")) return "Indirect China";
    return "Indirect China";
  }

  if (group === "Hedge") {
    if (category.includes("covered call")) return "Option income";
    if (category.includes("minimum volatility")) return "Beta reduction";
    if (category.includes("vix")) return "Volatility";
    if (category.includes("inverse")) return "Directional hedge";
    if (category.includes("concentration")) return "Deconcentration";
    return "Macro";
  }

  return "Other";
};

const subgroupFor = (item) => item?.registry?.subgroup || rawSubgroupFor(item);
const subgroupTone = (subgroup) => SUBGROUP_TONES[subgroup] || "#7fb8ff";

const benchmarkCodeFor = (item) => {
  if (item?.assetClass === "volatility") return null;
  if (item?.assetClass === "fixed_income") return "FED_FUNDS";
  return item?.benchmark || "SPY";
};

const benchmarkLabelFor = (item) => {
  if (item?.registry?.benchmark?.display !== undefined) return item.registry.benchmark.display;
  const benchmarkCode = benchmarkCodeFor(item);
  if (!benchmarkCode) return "";
  if (benchmarkCode === "FED_FUNDS") return "US Treasury 0-1y Index";
  if (benchmarkCode === "QQQ") return "Nasdaq-100";
  return "S&P 500";
};

const referenceLabelFor = (item) => {
  if (item?.registry?.referenceLabel !== undefined) return item.registry.referenceLabel;
  if (item?.assetClass === "volatility") return "";
  if (item?.assetClass === "fixed_income") return "Fed Funds";
  if (["commodity", "currency", "inverse_equity"].includes(item?.assetClass)) return "Correlation";
  return "Beta";
};

const metricsFor = (item) => {
  const assetClass = item?.assetClass || "";
  const category = categoryOf(item);
  const isMacro = ["commodity", "currency", "inverse_equity"].includes(assetClass);
  const isFixedIncome = assetClass === "fixed_income";
  const isHedge = groupFor(item) === "Hedge";
  const baseMetrics = DATA_LAB_METRICS.filter(([key]) => key !== "beta1yVsSp500");
  if (isFixedIncome) return [...baseMetrics, ["correlation1yVsCash", "Correlation vs Fed Funds"]];
  if (assetClass === "volatility") return baseMetrics;
  if (isMacro || isHedge || category.includes("gold") || category.includes("swiss franc")) {
    return [...baseMetrics, ["correlation1yVsSp500", benchmarkCodeFor(item) === "QQQ" ? "Correlation vs Nasdaq-100" : "Correlation vs S&P 500"]];
  }
  return DATA_LAB_METRICS;
};

const metricIsSuppressed = (item, key) =>
  (item?.ticker === "IB7A" && ["return3yAnnPct", "return5yAnnPct"].includes(key)) ||
  (item?.ticker === "TI5A" && key === "return5yAnnPct") ||
  (item?.ticker === "JEPQ" && key === "return5yAnnPct");

const chartBenchmarkFor = (item, points = []) => {
  const benchmarkCode = benchmarkCodeFor(item);
  if (!benchmarkCode) return { key: null, label: "" };
  if (benchmarkCode === "FED_FUNDS") {
    const key = points.some((point) => typeof point.cash === "number") ? "cash" : "sp500";
    return { key, label: key === "cash" ? "Fed Funds" : "S&P 500" };
  }
  if (benchmarkCode === "QQQ") return { key: "qqq", label: "Nasdaq-100" };
  return { key: "sp500", label: "S&P 500" };
};

const instrumentTypeFor = (item) => {
  if (item?.instrumentType) return item.instrumentType;
  const wrapper = (item?.wrapper || "").toLowerCase();
  if (wrapper.includes("etn")) return "etn";
  if (wrapper.includes("etf")) return "etf";
  if (item?.maturityDate || item?.expiryDate) return "fixed_income_security";
  return item?.assetClass || "instrument";
};

const enrichInstrument = (item, catalogItem = null) => {
  const merged = { ...(catalogItem || {}), ...(item || {}) };
  const group = rawGroupFor(merged);
  const subgroup = rawSubgroupFor(merged);
  const benchmarkCode = benchmarkCodeFor(merged);
  const explicitCapabilities = merged.capabilities || {};
  const capabilities = {
    performance: explicitCapabilities.performance !== false,
    risk: explicitCapabilities.risk !== false,
    comparison: explicitCapabilities.comparison !== false && Boolean(benchmarkCode),
    maturity: explicitCapabilities.maturity === true || Boolean(merged.maturityDate || merged.expiryDate),
    yield: explicitCapabilities.yield === true,
  };

  return {
    ...merged,
    instrumentId: merged.instrumentId || merged.ticker,
    registry: {
      schemaVersion: 1,
      instrumentType: instrumentTypeFor(merged),
      dataFamily: merged.dataFamily || "market_instrument",
      group,
      subgroup,
      subgroupTone: subgroupTone(subgroup),
      benchmark: {
        code: benchmarkCode,
        display: benchmarkLabelFor(merged),
      },
      referenceLabel: referenceLabelFor(merged),
      updateFrequency: merged.updateFrequency || null,
      maturityDate: merged.maturityDate || merged.expiryDate || null,
      capabilities,
    },
  };
};

const createCatalog = (payload) => {
  const items = Array.isArray(payload) ? payload : payload?.instruments || [];
  const byTicker = new Map(items.map((item) => [item.ticker, item]));
  return {
    size: byTicker.size,
    get: (ticker) => byTicker.get(ticker) || null,
    enrich: (item) => enrichInstrument(item, byTicker.get(item?.ticker) || null),
  };
};

return {
  DATA_LAB_GROUPS,
  DATA_LAB_SUBGROUP_ORDER,
  createCatalog,
  enrichInstrument,
  groupFor,
  subgroupFor,
  subgroupTone,
  metricsFor,
  metricIsSuppressed,
  benchmarkLabelFor,
  referenceLabelFor,
  chartBenchmarkFor,
};
})();
