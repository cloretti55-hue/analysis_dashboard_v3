(function () {
const { useEffect, useState } = React;

function scrollToMobileDetail(selector) {
  if (!window.matchMedia("(max-width: 720px)").matches) return;
  window.setTimeout(() => {
    const title = document.querySelector(selector);
    if (!title) return;
    const top = title.getBoundingClientRect().top + window.scrollY - 78;
    window.scrollTo({ top, behavior: "smooth" });
  }, 60);
}

const CORE_FUNCTIONS = [
  { fn: "US structural beta", why: "Low cost, efficient replication and long-term exposure.", tickers: ["VOO", "CSPX", "VUAA"], note: "UCITS Acc may suit non-US offshore portfolios where tax treatment is appropriate." },
  { fn: "US execution / hedge", why: "Liquidity, options and market depth.", tickers: ["SPY"], note: "Frequently used for puts, collars, overlays and tactical rebalancing." },
  { fn: "Structural growth", why: "Nasdaq-100 at lower cost or through a UCITS version.", tickers: ["QQQM", "CNDX", "EQQQ"], note: "QQQ is more execution-oriented; QQQM/UCITS are generally better suited to carry." },
  { fn: "Tactical growth / hedge", why: "Deep options markets and superior liquidity.", tickers: ["QQQ"], note: "A trading instrument, not necessarily the best tax vehicle." },
  { fn: "Concentration reduction", why: "Reduces mega-cap dominance.", tickers: ["RSP"], note: "Increases exposure to cyclicals and interest-rate risk." },
  { fn: "Developed global core", why: "MSCI World with a significant US weight.", tickers: ["IWDA", "SWDA"], note: "Simplifies a global core but does not reduce US exposure." },
  { fn: "Developed ex-US core", why: "Developed-market diversification outside the US.", tickers: ["VEA", "IEFA"], note: "VEA includes Canada; IEFA follows EAFE and excludes the US and Canada." },
  { fn: "European core", why: "Regional exposure.", tickers: ["VGK", "IEUR", "FEZ", "IMEU"], note: "A broad ETF does not capture defence, luxury and digital sovereignty well." },
  { fn: "Broad emerging markets", why: "Diversified EM beta.", tickers: ["VWO", "IEMG", "EIMI"], note: "China can dominate the risk profile." },
  { fn: "Emerging markets ex-China", why: "Reduces China risk.", tickers: ["EMXC", "EXCH"], note: "Useful for China+1 and geopolitical diversification." },
  { fn: "Treasury liquidity", why: "Very short US Treasury exposure.", tickers: ["SGOV", "IB01"], note: "SGOV covers 0–3 months; IB01 covers 0–1 year, so the maturity ranges are close but not identical." },
  { fn: "Treasury 1–3 years", why: "Short US Treasury exposure with limited rate sensitivity.", tickers: ["SHY", "IBTA"], note: "The vehicles differ in listing, distribution policy and wrapper." },
  { fn: "Treasury 3–7 years", why: "Short-intermediate exposure along the US Treasury curve.", tickers: ["IEI", "CBU7"], note: "Duration and price sensitivity are higher than in short Treasury vehicles." },
  { fn: "Treasury 7–10 years", why: "Intermediate US Treasury exposure.", tickers: ["IEF", "IB7A"], note: "This maturity range carries greater sensitivity to changes in medium-term yields." },
  { fn: "Treasury 20+ years", why: "Long-duration US Treasury exposure.", tickers: ["TLT", "DTLA"], note: "Long maturities bring materially greater sensitivity to changes in long-term yields." },
  { fn: "TIPS 0–5 years", why: "Inflation-linked exposure with lower duration.", tickers: ["STIP", "TI5A"], note: "Both focus on short-maturity US TIPS through different listing and distribution structures." },
  { fn: "Broad TIPS", why: "Inflation-linked exposure across a broader maturity range.", tickers: ["TIP", "IDTP"], note: "The broader basket carries more real-rate sensitivity than short-duration TIPS." },
  { fn: "Investment-grade credit", why: "USD corporate-bond exposure with higher credit quality.", tickers: ["LQD", "LQDA"], note: "Credit spreads and duration both influence performance." },
  { fn: "High-yield credit", why: "USD corporate-bond exposure with greater credit risk.", tickers: ["HYG", "IHYA"], note: "Higher spreads come with greater default and economic-cycle sensitivity." },
  { fn: "Aggregate bonds", why: "Broad sovereign and corporate fixed-income exposure.", tickers: ["AGG", "AGGU"], note: "AGG is US aggregate; AGGU is global aggregate with USD currency hedging, so they are functional counterparts rather than identical benchmarks." },
  { fn: "Macro hedge", why: "Regime protection, strong currency and store of value.", tickers: ["GLD", "IAU", "FXF / CHF"], note: "Physical gold and the Swiss franc as macro diversifiers." },
];

const FIXED_INCOME_TICKERS = new Set(["SGOV", "IB01", "SHY", "IBTA", "IEI", "CBU7", "IEF", "IB7A", "TLT", "DTLA", "STIP", "TI5A", "TIP", "IDTP", "LQD", "LQDA", "HYG", "IHYA", "AGG", "AGGU"]);
const HEDGE_MACRO_TICKERS = new Set(["GLD", "IAU", "FXF / CHF"]);
const FIXED_INCOME_FUNCTIONS = CORE_FUNCTIONS.filter((row) => row.tickers.some((ticker) => FIXED_INCOME_TICKERS.has(ticker)));
const CORE_EQUITY_FUNCTIONS = CORE_FUNCTIONS.filter((row) => !row.tickers.some((ticker) => FIXED_INCOME_TICKERS.has(ticker) || HEDGE_MACRO_TICKERS.has(ticker)));

const CORE_TOKEN_GROUPS = {
  VOO: "etf-us",
  CSPX: "etf-us",
  VUAA: "etf-us",
  SPY: "etf-us",
  QQQM: "etf-us",
  CNDX: "etf-us",
  EQQQ: "etf-us",
  QQQ: "etf-us",
  RSP: "etf-us",
  VEA: "etf-developed",
  IEFA: "etf-developed",
  IWDA: "etf-global",
  SWDA: "etf-global",
  VGK: "etf-developed",
  IEUR: "etf-developed",
  FEZ: "etf-developed",
  IMEU: "etf-developed",
  VWO: "etf-emerging",
  IEMG: "etf-emerging",
  EIMI: "etf-emerging",
  EMXC: "etf-emerging",
  EXCH: "etf-emerging",
  IB01: "etf-treasury",
  IBTA: "etf-treasury",
  CBU7: "etf-treasury",
  IB7A: "etf-treasury",
  DTLA: "etf-treasury",
  TI5A: "etf-inflation",
  IDTP: "etf-inflation",
  LQDA: "etf-credit",
  IHYA: "etf-credit",
  AGGU: "etf-aggregate",
  SGOV: "etf-treasury",
  SHY: "etf-treasury",
  IEI: "etf-treasury",
  IEF: "etf-treasury",
  TLT: "etf-treasury",
  STIP: "etf-inflation",
  TIP: "etf-inflation",
  LQD: "etf-credit",
  HYG: "etf-credit",
  AGG: "etf-aggregate",
  GLD: "etf-other",
  IAU: "etf-other",
  "FXF / CHF": "etf-other",
};

const UCITS_TICKERS = new Set([
  "CSPX",
  "VUAA",
  "CNDX",
  "EQQQ",
  "IUIT",
  "IUCM",
  "IUCD",
  "IUCS",
  "IUES",
  "IUFS",
  "IUHC",
  "IUIS",
  "IUMS",
  "IUUS",
  "IWDA",
  "SWDA",
  "IMEU",
  "EIMI",
  "EXCH",
  "IB01",
  "IBTA",
  "CBU7",
  "IB7A",
  "DTLA",
  "TI5A",
  "IDTP",
  "LQDA",
  "IHYA",
  "AGGU",
]);

const tickerMatchesVehicleView = (ticker, vehicleView) =>
  vehicleView === "all" ||
  (vehicleView === "ucits" && UCITS_TICKERS.has(ticker)) ||
  (vehicleView === "us" && !UCITS_TICKERS.has(ticker));

const coreTokenClass = (ticker, vehicleView) => {
  const classes = ["etf-token", CORE_TOKEN_GROUPS[ticker] || "etf-other"];
  if (vehicleView !== "all" && !tickerMatchesVehicleView(ticker, vehicleView)) {
    classes.push("is-muted");
  }
  return classes.join(" ");
};

const CORE_COUNTRY_WEIGHTS = {
  VEA: [
    ["Japão", 21.0],
    ["Reino Unido", 12.0],
    ["Canadá", 9.0],
    ["França", 8.0],
    ["Suíça", 7.5],
    ["Alemanha", 7.0],
  ],
  IEFA: [
    ["Japão", 25.7],
    ["Reino Unido", 13.9],
    ["França", 9.0],
    ["Suíça", 8.7],
    ["Alemanha", 8.0],
    ["Austrália", 7.1],
  ],
  IWDA: [
    ["EUA", 72.0],
    ["Japão", 5.5],
    ["Reino Unido", 3.5],
    ["Canadá", 3.0],
    ["França", 2.8],
    ["Suíça", 2.6],
  ],
  SWDA: [
    ["EUA", 72.0],
    ["Japão", 5.5],
    ["Reino Unido", 3.5],
    ["Canadá", 3.0],
    ["França", 2.8],
    ["Suíça", 2.6],
  ],
  VGK: [
    ["Reino Unido", 23.0],
    ["França", 17.0],
    ["Suíça", 15.0],
    ["Alemanha", 13.0],
    ["Holanda", 7.0],
    ["Suécia", 6.0],
  ],
  IEUR: [
    ["Reino Unido", 21.5],
    ["França", 18.2],
    ["Suíça", 16.5],
    ["Alemanha", 13.6],
    ["Holanda", 7.3],
    ["Dinamarca", 5.4],
  ],
  FEZ: [
    ["França", 34.0],
    ["Alemanha", 31.0],
    ["Holanda", 14.0],
    ["Espanha", 8.0],
    ["Itália", 7.0],
    ["Bélgica", 3.0],
  ],
  IMEU: [
    ["Reino Unido", 22.0],
    ["França", 18.0],
    ["Suíça", 16.2],
    ["Alemanha", 13.8],
    ["Holanda", 7.2],
    ["Dinamarca", 5.1],
  ],
  VWO: [
    ["Taiwan", 29.0],
    ["China", 29.0],
    ["Índia", 19.0],
    ["Brasil", 4.0],
    ["Arábia Saudita", 3.0],
    ["África do Sul", 3.0],
  ],
  IEMG: [
    ["Taiwan", 28.1],
    ["Coreia do Sul", 21.7],
    ["China", 17.9],
    ["Índia", 12.2],
    ["Brasil", 3.7],
    ["África do Sul", 3.0],
  ],
  EIMI: [
    ["Taiwan", 28.0],
    ["Coreia do Sul", 21.5],
    ["China", 18.0],
    ["Índia", 12.0],
    ["Brasil", 3.7],
    ["África do Sul", 3.0],
  ],
  EMXC: [
    ["Taiwan", 34.6],
    ["Coreia do Sul", 28.2],
    ["Índia", 13.6],
    ["Brasil", 4.6],
    ["África do Sul", 3.6],
    ["Arábia Saudita", 3.0],
  ],
  EXCH: [
    ["Taiwan", 34.5],
    ["Coreia do Sul", 28.0],
    ["Índia", 13.5],
    ["Brasil", 4.5],
    ["África do Sul", 3.5],
    ["Arábia Saudita", 3.0],
  ],
};

const CORE_DETAILS = {
  VOO: ["US structural beta", "Low-cost S&P 500 exposure.", "Not the best instrument for options hedging.", ["An efficient buy-and-hold vehicle.", "A good choice when US-listed tax treatment is appropriate.", "Less suited to tactical overlays than SPY."]],
  CSPX: ["US structural beta", "Accumulating S&P 500 UCITS.", "Less useful for tactical execution and options.", ["Appropriate for many non-US offshore portfolios.", "Accumulation reduces cash distributions.", "A carry vehicle, not a trading vehicle."]],
  VUAA: ["US structural beta", "S&P 500 UCITS Acc at competitive cost.", "Less tactical depth than SPY.", ["Good for automatic reinvestment.", "Useful when UCITS domicile matters.", "Its primary role is a structural core holding."]],
  SPY: ["US execution / hedge", "Liquidity, options and tactical execution.", "May not be the most efficient vehicle for holding offshore wealth.", ["Excellent for puts, collars and overlays.", "Market depth reduces friction.", "An operating instrument, not necessarily a tax-efficient carry vehicle."]],
  QQQ: ["Tactical growth / hedge", "Nasdaq-100 execution and options.", "Buy-and-hold may call for another vehicle.", ["High intraday liquidity.", "Deep options markets.", "Concentration in growth and technology is part of the thesis."]],
  QQQM: ["Structural growth", "Lower-cost Nasdaq-100 exposure.", "Less suitable for heavy trading than QQQ.", ["Better suited to a structural position.", "Maintains concentrated growth exposure.", "Vehicle choice matters over a long horizon."]],
  CNDX: ["Structural growth", "Nasdaq-100 UCITS Acc.", "Does not replace QQQ for liquidity or options.", ["Useful for non-US offshore investors.", "Accumulation facilitates reinvestment.", "Growth exposure in a UCITS wrapper."]],
  EQQQ: ["Structural growth", "Invesco EQQQ NASDAQ-100 UCITS ETF Dist.", "Distribution, cost and trading currency differ from accumulating alternatives.", ["A European alternative for Nasdaq-100 exposure.", "Distributes income rather than reinvesting it within the fund.", "Compare with CNDX according to domicile and distribution policy."]],
  RSP: ["Concentration reduction", "Equal-weight S&P 500.", "Not automatically better; it changes risk factors.", ["Reduces the Magnificent 7 weight.", "Increases sensitivity to mid/large-cap cyclicals.", "May suffer more from rates and the domestic cycle."]],
  VEA: ["Developed ex-US core", "Developed markets outside the US.", "May dilute quality and growth versus the US.", ["Broad geographic diversification.", "Exposure to Europe, Japan and the Pacific.", "Review overlap with regional ETFs."]],
  IEFA: ["Developed ex-US core", "Broad developed ex-US exposure.", "Does not solve the desired sector composition on its own.", ["A broad developed-market alternative.", "A good international core building block.", "Check tracking, cost and domicile."]],
  IWDA: ["Developed global core", "MSCI World UCITS.", "Includes the US and can overlap with the S&P 500.", ["A broad UCITS vehicle.", "Useful for simplifying a global core.", "Check overlap with VOO/CSPX/VUAA."]],
  SWDA: ["Developed global core", "MSCI World UCITS Acc.", "It is not ex-US; the US dominates the index.", ["Accumulation and broad diversification.", "Suitable for a simple offshore portfolio.", "Requires management of US concentration."]],
  VGK: ["European core", "Broad European beta.", "Broad Europe can hide distinct sector theses.", ["Direct regional exposure.", "Useful for geographic rebalancing.", "Does not perfectly capture luxury, defence and digital sovereignty."]],
  IEUR: ["European core", "Broad Europe through an iShares vehicle.", "Assess cost, domicile and liquidity.", ["A regional building block for developed markets.", "Can complement a global core.", "Check overlap with VEA/IEFA."]],
  FEZ: ["European core", "Euro Stoxx 50.", "More concentrated than broad Europe.", ["Eurozone blue-chip exposure.", "More concentrated in large names.", "Does not replace broad Europe."]],
  IMEU: ["European core", "iShares Core MSCI Europe UCITS ETF EUR Dist.", "A distributing regional vehicle traded in multiple currencies.", ["A regional offshore tool.", "Useful for domicile control.", "Compare with VGK/IEUR/FEZ."]],
  VWO: ["Broad emerging markets", "Diversified emerging-market beta.", "China can dominate the risk.", ["Broad EM exposure.", "Competitive cost.", "Geopolitical and China risks require awareness."]],
  IEMG: ["Broad emerging markets", "Broad EM with significant liquidity.", "Does not neutralise China on its own.", ["Includes large, mid and small caps in EM.", "A strong emerging-market beta building block.", "Assess regional composition."]],
  EIMI: ["Broad emerging markets", "Broad EM UCITS.", "China risk and tracking should be monitored.", ["Useful for offshore UCITS portfolios.", "Broad EM diversification.", "Check Acc/Dist and currency."]],
  EMXC: ["Emerging markets ex-China", "China+1 thesis and lower China risk.", "Does not represent the complete traditional EM beta.", ["Removes the main geopolitical risk from broad EM.", "Raises the relative weight of India, Taiwan and others.", "Useful as a complement."]],
  EXCH: ["Emerging markets ex-China", "iShares MSCI EM ex-China UCITS ETF USD Acc.", "Check liquidity and tracking.", ["Geopolitical separation from EM beta.", "Useful for offshore portfolios.", "Complements VWO/IEMG/EIMI."]],
  IB01: ["USD liquidity", "iShares $ Treasury Bond 0-1yr UCITS ETF USD Acc.", "Yield-bearing USD cash, not a duration bet.", ["Serves as yield-bearing liquidity.", "Low volatility and low interest-rate sensitivity.", "A suitable Acc vehicle when the objective is offshore reinvestment."]],
  IBTA: ["Short duration", "iShares $ Treasury Bond 1-3yr UCITS ETF USD Acc.", "Low interest-rate sensitivity.", ["Adds slightly more duration than cash.", "Useful for carrying yield without extending too far.", "Acts as the first step after liquidity."]],
  CBU7: ["Short-intermediate duration", "iShares $ Treasury Bond 3-7yr UCITS ETF USD Acc.", "The short middle of the curve.", ["Balances carry and duration risk.", "Can capture moderate cuts without going to the long end.", "A useful intermediate rung in a Treasury ladder."]],
  IB7A: ["Intermediate duration", "iShares $ Treasury Bond 7-10yr UCITS ETF USD Acc.", "Partial hedge against falling rates.", ["More sensitive to the monetary-policy cycle.", "Can help when the thesis calls for lower rates.", "Requires more conviction than shorter maturities."]],
  DTLA: ["Long duration", "iShares $ Treasury Bond 20+yr UCITS ETF USD Acc.", "Directional position on falling rates.", ["Highly sensitive to long rates.", "Greater upside potential if yields compress.", "Material volatility; it is not simply yield-bearing cash."]],
  TI5A: ["Short inflation", "iShares $ TIPS 0-5 UCITS ETF USD Acc.", "Inflation protection with lower duration.", ["Combines positive real rates with lower duration.", "More aligned with real carry than a long-rate bet.", "Avoids mixing inflation exposure with excessive duration."]],
  IDTP: ["Broad inflation", "iShares $ TIPS UCITS ETF USD Acc.", "US inflation exposure with more duration.", ["Provides realised-inflation exposure through a broader basket.", "Brings greater sensitivity to real rates.", "Can suit portfolios that accept more duration."]],
  LQDA: ["USD investment-grade credit", "iShares $ Corp Bond UCITS ETF USD Acc.", "Investment-grade corporate spread exposure.", ["Adds credit premium with higher quality.", "Does not replace Treasuries as a crisis hedge.", "Sensitive to spread, duration and the corporate cycle."]],
  IHYA: ["USD high yield", "iShares $ High Yield Corp Bond UCITS ETF USD Acc.", "Riskier credit with higher yield.", ["Carries more spread and more default risk.", "Tends to perform better when credit and the cycle are constructive.", "It is not usually treated as defensive fixed income."]],
  AGGU: ["Global core bonds", "iShares Core Global Aggregate Bond UCITS ETF USD Hedged Acc.", "Global bond diversification with USD currency hedging.", ["Combines sovereign and global credit exposure.", "Can serve as a broad fixed-income building block.", "Currency hedging, duration and composition change its role as a core holding."]],
  SGOV: ["USD liquidity", "iShares 0-3 Month Treasury Bond ETF.", "Very short US Treasury exposure in a US-listed distributing vehicle.", ["Tracks Treasury bills with minimal duration.", "Monthly distributions differ from an accumulating UCITS structure.", "Market price can still vary even with very short maturity exposure."]],
  SHY: ["Short duration", "iShares 1-3 Year Treasury Bond ETF.", "Short US Treasury exposure through a US-listed vehicle.", ["Adds limited duration beyond Treasury bills.", "Distributes income monthly.", "Rate sensitivity is lower than in intermediate and long Treasury funds."]],
  IEI: ["Short-intermediate duration", "iShares 3-7 Year Treasury Bond ETF.", "The short middle of the US Treasury curve in a US-listed vehicle.", ["Combines more duration with government-credit exposure.", "Distributes income monthly.", "Price sensitivity rises as maturity extends."]],
  IEF: ["Intermediate duration", "iShares 7-10 Year Treasury Bond ETF.", "Intermediate US Treasury exposure through a US-listed vehicle.", ["Has greater sensitivity to changes in medium-term yields.", "Distributes income monthly.", "Its role differs from both cash-like and long-duration Treasury funds."]],
  TLT: ["Long duration", "iShares 20+ Year Treasury Bond ETF.", "Long US Treasury exposure through a US-listed vehicle.", ["Carries substantial sensitivity to long-term yields.", "Distributes income monthly.", "Price volatility can be material despite the government-bond holdings."]],
  STIP: ["Short inflation", "iShares 0-5 Year TIPS Bond ETF.", "Short-maturity US inflation-linked bonds in a US-listed vehicle.", ["Combines realised-inflation exposure with lower duration.", "Distributes income monthly.", "Real-rate changes still affect market value."]],
  TIP: ["Broad inflation", "iShares TIPS Bond ETF.", "Broad US inflation-linked Treasury exposure in a US-listed vehicle.", ["Includes more duration than a short TIPS fund.", "Distributes income monthly.", "Performance reflects both inflation adjustments and changes in real yields."]],
  LQD: ["USD investment-grade credit", "iShares iBoxx $ Investment Grade Corporate Bond ETF.", "US dollar investment-grade corporate-bond exposure.", ["Adds corporate spread exposure to fixed income.", "Distributes income monthly.", "Credit spreads and duration both affect performance."]],
  HYG: ["USD high yield", "iShares iBoxx $ High Yield Corporate Bond ETF.", "US dollar below-investment-grade corporate-bond exposure.", ["Carries greater credit and default risk than investment-grade funds.", "Distributes income monthly.", "Its behaviour is more cyclical than government-bond exposure."]],
  AGG: ["US core bonds", "iShares Core U.S. Aggregate Bond ETF.", "Broad US investment-grade bond-market exposure.", ["Combines US Treasuries, agency mortgages and investment-grade credit.", "Distributes income monthly.", "Its US-only scope differs from AGGU's global USD-hedged universe."]],
  GLD: ["Macro hedge", "SPDR Gold Shares.", "A highly liquid physical-gold ETF.", ["Functions as a real/monetary asset.", "Helps during confidence shocks and adverse regimes.", "Most useful when liquidity and depth matter."]],
  IAU: ["Macro hedge", "iShares Gold Trust.", "A competitively priced physical-gold ETF.", ["An efficient alternative for holding gold exposure.", "Useful as a long-term macro diversifier.", "Less focused on heavy trading than GLD."]],
  "FXF / CHF": ["Macro hedge", "Invesco CurrencyShares Swiss Franc Trust.", "Swiss-franc exposure against the US dollar.", ["A historical haven during confidence shocks.", "Low carry, lower liquidity than large ETFs and risk of SNB intervention.", "The dollar is the natural hedge against Brazil. The Swiss franc represents monetary quality; gold is a regime hedge."]],
};

const SATELLITE_FILTERS = {
  zone: [
    ["all", "All"],
    ["resolve", "ETF fits"],
    ["partial", "Partial ETF"],
    ["basket", "Basket required"],
  ],
  aggression: [
    ["all", "All"],
    ["high", "High convexity"],
    ["medium", "Medium convexity"],
    ["defensive", "Defensive"],
  ],
  motor: [
    ["all", "All"],
    ["ai", "AI hardware"],
    ["energy", "Energy & grid"],
    ["defense", "Defence"],
    ["cyber", "Cyber"],
    ["industry", "Reindustrialisation"],
    ["housing", "Housing"],
    ["demography", "Demographics"],
  ],
  vehicle: [
    ["all", "All"],
    ["etf", "ETF"],
    ["hybrid", "ETF + basket"],
    ["basket", "Basket"],
  ],
};

const SATELLITES = [
  {
    theme: "Semiconductors / AI hardware",
    icon: "chip",
    zone: "resolve",
    aggression: "high",
    motor: "ai",
    vehicle: "hybrid",
    etfs: "SMH / SOXX",
    quality: "High",
    implementation: "ETF + basket",
    reading: "Captures the central AI bottleneck, but is highly sensitive to the CAPEX cycle.",
    names: ["Nvidia", "TSMC", "Broadcom", "ASML", "AMD"],
    extraTitle: "Strategic companies outside the ETF",
    extraCompanies: [
      "Samsung Electronics: HBM, DRAM and NAND memory.",
      "SK Hynix: a leader in HBM for AI.",
      "Tokyo Electron: chip-manufacturing equipment.",
      "Advantest: advanced-chip testing.",
    ],
    points: ["The ETF captures the value chain well.", "Valuation and the semiconductor cycle need to be monitored.", "A useful first layer for exposure to AI infrastructure."],
  },
  {
    theme: "US defence",
    icon: "shield",
    zone: "resolve",
    aggression: "medium",
    motor: "defense",
    vehicle: "etf",
    etfs: "ITA / PPA",
    quality: "High",
    implementation: "ETF",
    reading: "Geopolitics, public budgets and dual-use technology support structural demand.",
    names: ["Lockheed Martin", "RTX", "Northrop Grumman", "General Dynamics"],
    points: ["The ETF represents major US contractors well.", "Government demand reduces dependence on consumers.", "It combines traditional defence, cyber and military technology."],
  },
  {
    theme: "Cybersecurity",
    icon: "network",
    zone: "resolve",
    aggression: "medium",
    motor: "cyber",
    vehicle: "etf",
    etfs: "CIBR / HACK",
    quality: "Medium/high",
    implementation: "ETF",
    reading: "Structural, recurring demand that is less dependent on physical CAPEX.",
    names: ["Palo Alto", "CrowdStrike", "Fortinet", "Zscaler"],
    points: ["The ETF represents the theme, but its composition should be monitored.", "A recurring theme within digital security.", "Less binary than quantum computing or physical data centres."],
  },
  {
    theme: "Robotics / automation",
    icon: "robotics",
    zone: "partial",
    aggression: "high",
    motor: "industry",
    vehicle: "hybrid",
    etfs: "BOTZ / ROBO",
    quality: "Medium",
    implementation: "ETF + basket",
    reading: "A strong theme, but the ETFs combine companies with different economic drivers.",
    names: ["Rockwell", "ABB", "Fanuc", "Teradyne"],
    points: ["An ETF helps as an initial layer.", "A basket improves the thesis precision.", "Industrial automation is a relevant subtheme of reindustrialisation."],
  },
  {
    theme: "Energy / grid",
    icon: "energy",
    zone: "partial",
    aggression: "medium",
    motor: "energy",
    vehicle: "hybrid",
    etfs: "XLE / GRID / PAVE / XLU",
    quality: "Partial",
    implementation: "ETF + basket",
    reading: "The thesis is electrification, transmission and equipment, not only traditional energy.",
    names: ["Eaton", "Hubbell", "Quanta Services", "Constellation", "NextEra"],
    points: ["A broad ETF dilutes the economic driver.", "A basket separates utilities, equipment and engineering.", "Data centres make the grid a strategic constraint."],
  },
  {
    theme: "Infrastructure / utilities",
    icon: "grid",
    zone: "partial",
    aggression: "defensive",
    motor: "energy",
    vehicle: "hybrid",
    etfs: "XLU / PAVE / GRID",
    quality: "Medium",
    implementation: "ETF + basket",
    reading: "A more defensive exposure linked to physical CAPEX, regulation and electricity demand.",
    names: ["Duke Energy", "Southern Company", "NextEra", "Quanta Services"],
    points: ["It may stabilise the portfolio.", "Duration risk needs to be monitored.", "A broad ETF combines a defensive profile with interest-rate sensitivity."],
  },
  {
    theme: "Residential construction",
    icon: "home",
    zone: "resolve",
    aggression: "medium",
    motor: "housing",
    vehicle: "etf",
    etfs: "ITB / XHB",
    quality: "High",
    implementation: "ETF",
    reading: "Structural scarcity of housing, land and construction capacity.",
    names: ["D.R. Horton", "Lennar", "PulteGroup", "NVR"],
    points: ["Housing demand is structural but interest-rate sensitive.", "The ETF helps capture the homebuilder cycle.", "The thesis strengthens when new supply remains constrained."],
  },
  {
    theme: "Construction materials and infrastructure",
    icon: "factory",
    zone: "resolve",
    aggression: "medium",
    motor: "housing",
    vehicle: "etf",
    etfs: "PKB",
    quality: "Medium/high",
    implementation: "ETF",
    reading: "Critical suppliers to the housing and infrastructure value chains.",
    names: ["Builders FirstSource", "Vulcan Materials", "Martin Marietta", "Masco"],
    points: ["Captures the construction chain beyond homebuilders.", "Combines housing, infrastructure and materials.", "Cyclical, but supported by physical needs."],
  },
  {
    theme: "Senior care",
    icon: "home",
    zone: "basket",
    aggression: "defensive",
    motor: "demography",
    vehicle: "basket",
    etfs: "No pure-play ETF",
    quality: "Low",
    implementation: "Basket",
    reading: "Ageing increases demand for assisted living, nursing and long-term care services.",
    names: ["Brookdale Senior Living", "The Ensign Group", "Option Care Health"],
    points: ["Demographics provide a structural tailwind.", "Supply grows slowly because of labour constraints and regulation.", "A small basket avoids an overly generic ETF."],
  },
  {
    theme: "Pharmaceutical distribution",
    icon: "pulse",
    zone: "basket",
    aggression: "defensive",
    motor: "demography",
    vehicle: "basket",
    etfs: "No clean ETF",
    quality: "Low",
    implementation: "Equity basket",
    reading: "A highly concentrated market responsible for distributing most medicines in the United States.",
    names: ["McKesson", "Cencora", "Cardinal Health"],
    points: ["Recurring revenue, substantial operating scale and logistical barriers.", "Structural demand driven by population ageing and increased medicine use.", "Risks include thin margins, regulatory pressure, reimbursement-system changes and customer concentration."],
  },
  {
    theme: "Physical data centres",
    icon: "server",
    zone: "basket",
    aggression: "high",
    motor: "ai",
    vehicle: "basket",
    etfs: "SRVR / VPN / proxies",
    quality: "Low",
    implementation: "Basket",
    reading: "ETFs still capture power, cooling, equipment and networking poorly.",
    names: ["Vertiv", "Eaton", "Schneider", "Equinix", "Digital Realty", "Arista", "Broadcom"],
    points: ["A physical and fragmented theme.", "REITs and proxies do not capture the full value chain.", "Here, a basket becomes an implementation requirement."],
  },
  {
    theme: "Onshoring / reindustrialisation",
    icon: "factory",
    zone: "basket",
    aggression: "medium",
    motor: "industry",
    vehicle: "basket",
    etfs: "XLI / AIRR",
    quality: "Partial",
    implementation: "Basket",
    reading: "A broad industrial ETF dilutes the reindustrialisation thesis.",
    names: ["Rockwell", "Emerson", "Honeywell", "Caterpillar", "Nucor", "Union Pacific"],
    points: ["It requires separating automation, transport, steel and capital goods.", "A broad ETF tends to reflect the industry of the past, not necessarily future CAPEX.", "A basket improves alignment with the thesis."],
  },
  {
    theme: "Quantum / frontier computing",
    icon: "atom",
    zone: "basket",
    aggression: "high",
    motor: "ai",
    vehicle: "basket",
    etfs: "QTUM / baskets",
    quality: "Low/medium",
    implementation: "Small basket",
    reading: "High optionality, low predictability and extremely dispersed outcomes.",
    names: ["IBM", "IonQ", "Rigetti", "D-Wave", "Microsoft"],
    points: ["Initial exposure is generally approached cautiously.", "The theme is still selecting its winners.", "An ETF may include companies with little exposure to the actual driver."],
  },
];

function SatelliteIcon({ type }) {
  const iconProps = { viewBox: "0 0 24 24", fill: "none", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  const path = (d) => React.createElement("path", { d, key: d });
  const line = (x1, y1, x2, y2) => React.createElement("line", { x1, y1, x2, y2, key: `${x1}-${y1}-${x2}-${y2}` });
  const circle = (cx, cy, r) => React.createElement("circle", { cx, cy, r, key: `${cx}-${cy}-${r}` });
  const rect = (x, y, width, height, rx = 2) => React.createElement("rect", { x, y, width, height, rx, key: `${x}-${y}-${width}-${height}` });

  const shapes = {
    chip: [
      rect(7, 7, 10, 10, 2),
      line(4, 9, 7, 9),
      line(4, 15, 7, 15),
      line(17, 9, 20, 9),
      line(17, 15, 20, 15),
      line(9, 4, 9, 7),
      line(15, 4, 15, 7),
      line(9, 17, 9, 20),
      line(15, 17, 15, 20),
    ],
    shield: [path("M12 3l7 3v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3z"), path("M9 12l2 2 4-5")],
    network: [circle(7, 8, 2), circle(17, 8, 2), circle(12, 17, 2), line(9, 9, 15, 9), line(8, 10, 11, 15), line(16, 10, 13, 15)],
    phone: [rect(8, 3, 8, 18, 2), line(10, 6, 14, 6), circle(12, 18, 0.7), path("M18 8c1.5 2.5 1.5 5.5 0 8"), path("M6 8c-1.5 2.5-1.5 5.5 0 8")],
    robotics: [path("M5 18h8"), path("M8 18v-5l4-4 3 3-4 4"), circle(16, 7, 2), path("M14 19l4-4"), path("M18 15l2 2")],
    energy: [path("M13 2L5 14h6l-1 8 8-12h-6l1-8z")],
    oil: [path("M5 20h14"), path("M8 20V8l4-4 4 4v12"), path("M8 10h8"), path("M10 20v-7h4v7"), path("M16 9l4 2v5"), circle(20, 17, 1.3)],
    grid: [path("M12 3l7 18H5l7-18z"), line(8, 13, 16, 13), line(9.5, 17, 14.5, 17), line(12, 3, 12, 21)],
    faucet: [path("M9 6h8a3 3 0 013 3v1"), path("M4 10h13"), path("M7 10v7"), path("M5 17h4"), path("M15 10v3"), path("M17 16c0 1.2-.8 2-2 2s-2-.8-2-2c0-1.4 2-3.5 2-3.5s2 2.1 2 3.5z"), path("M10 6V4h4v2")],
    server: [rect(5, 5, 14, 5, 1), rect(5, 14, 14, 5, 1), circle(8, 7.5, 0.7), circle(8, 16.5, 0.7), line(11, 7.5, 16, 7.5), line(11, 16.5, 16, 16.5)],
    factory: [path("M4 20V9l5 3V9l5 3V5h6v15H4z"), line(7, 16, 7, 16), line(11, 16, 11, 16), line(15, 16, 15, 16)],
    home: [path("M4 11l8-7 8 7"), path("M6 10v10h12V10"), path("M10 20v-6h4v6")],
    book: [path("M5 5.5A3.5 3.5 0 018.5 2H20v17H8.5A3.5 3.5 0 005 22V5.5z"), path("M5 5.5A3.5 3.5 0 018.5 9H20")],
    diamond: [path("M6 4h12l3 5-9 11L3 9l3-5z"), path("M3 9h18"), path("M8 4l4 16 4-16")],
    money: [rect(4, 6, 16, 12, 2), circle(12, 12, 3), path("M8 9h.01"), path("M16 15h.01"), path("M12 9v6"), path("M10.5 10.5c.6-.7 2.4-.7 3 0"), path("M10.5 13.5c.6.7 2.4.7 3 0")],
    pulse: [path("M20 12h-4l-2 5-4-10-2 5H4"), path("M12 21C7 17.5 4 14.5 4 10a4 4 0 017-2.6A4 4 0 0118 10c0 4.5-3 7.5-6 11z")],
    atom: [circle(12, 12, 1.5), React.createElement("ellipse", { cx: 12, cy: 12, rx: 8, ry: 3.2, key: "e1" }), React.createElement("ellipse", { cx: 12, cy: 12, rx: 8, ry: 3.2, transform: "rotate(60 12 12)", key: "e2" }), React.createElement("ellipse", { cx: 12, cy: 12, rx: 8, ry: 3.2, transform: "rotate(120 12 12)", key: "e3" })],
  };

  return React.createElement("span", { className: "satellite-icon" }, React.createElement("svg", iconProps, shapes[type] || shapes.chip));
}

function SatelliteModule({ initialTheme = "Semiconductors / AI hardware" } = {}) {
  const riskOrder = { high: 0, medium: 1, defensive: 2 };
  const [filters, setFilters] = useState({ aggression: "all", motor: "all" });
  const [selectedTheme, setSelectedTheme] = useState(initialTheme);
  const filtered = SATELLITES.filter((item) =>
    Object.entries(filters).every(([key, value]) => value === "all" || item[key] === value)
  ).sort((a, b) => riskOrder[a.aggression] - riskOrder[b.aggression] || a.theme.localeCompare(b.theme, "pt-BR"));
  const active = filtered.find((item) => item.theme === selectedTheme) || filtered[0] || SATELLITES[0];

  const filterRow = (key, label, extraClass = "") =>
    React.createElement(
      "div",
      { className: `filter-row ${extraClass}`.trim(), key },
      React.createElement("span", { className: "filter-label" }, label),
      SATELLITE_FILTERS[key].map(([value, text]) =>
        React.createElement(
          "button",
          {
            className: "filter-chip",
            type: "button",
            key: value,
            "aria-pressed": filters[key] === value,
            onClick: () => setFilters({ ...filters, [key]: value }),
          },
          text
        )
      )
    );

  return React.createElement(
    "main",
    { className: "satellite-layout" },
    React.createElement(
      "article",
      { className: "panel" },
      React.createElement("div", { className: "section-head" }, React.createElement("div", null, React.createElement("span", { className: "control-title" }, "Thematic satellites"))),
      React.createElement(
        "div",
        { className: "satellite-filters" },
        filterRow("aggression", "Convexity"),
        filterRow("motor", "Driver", "satellite-mobile-hide"),
        React.createElement(
          "div",
          { className: "risk-legend" },
          React.createElement("span", { className: "sat-risk-high" }, "High convexity"),
          React.createElement("span", { className: "sat-risk-medium" }, "Medium convexity"),
          React.createElement("span", { className: "sat-risk-defensive" }, "Defensive")
        )
      ),
      React.createElement(
        "div",
        { className: "satellite-grid" },
        filtered.map((item) =>
          React.createElement(
            "button",
            { className: `satellite-card sat-risk-${item.aggression}`, type: "button", key: item.theme, "aria-pressed": active.theme === item.theme, onClick: () => { setSelectedTheme(item.theme); scrollToMobileDetail(".satellite-detail h2"); } },
            React.createElement(
              "div",
              null,
              React.createElement("div", { className: "satellite-title-row" }, React.createElement(SatelliteIcon, { type: item.icon }), React.createElement("h3", null, item.theme)),
              React.createElement("p", null, item.reading)
            )
          )
        )
      )
    ),
    React.createElement(
      "aside",
      { className: "panel satellite-detail" },
      React.createElement("span", { className: "detail-role" }, "Selected theme"),
      React.createElement("div", { className: `satellite-detail-head sat-risk-${active.aggression}` }, React.createElement(SatelliteIcon, { type: active.icon }), React.createElement("h2", null, active.theme)),
      React.createElement(
        "div",
        { className: "detail-grid" },
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Possible ETF"), React.createElement("strong", null, active.etfs)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Alternative"), React.createElement("strong", null, active.implementation)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "ETF quality"), React.createElement("strong", null, active.quality))
      ),
      React.createElement("p", null, active.reading),
      React.createElement("ul", { className: "satellite-list" }, active.points.map((point) => React.createElement("li", { key: point }, point))),
      active.extraCompanies
        ? React.createElement(
            "div",
            { className: "detail-box proxy-box" },
            React.createElement("span", null, active.extraTitle),
            React.createElement("ul", { className: "satellite-list" }, active.extraCompanies.map((point) => React.createElement("li", { key: point }, point)))
          )
        : null,
      React.createElement("div", { className: "detail-box proxy-box" }, React.createElement("span", null, "Examples"), React.createElement("strong", null, active.names.join(" · "))),
      React.createElement("p", { className: "data-note" }, "Source: sector examples and proxies, June 2026. Non-exhaustive list.")
    )
  );
}
const EUROPE_THEMES = [
  {
    theme: "European defence",
    icon: "shield",
    status: "No",
    quality: "No ETF available",
    tone: "sat-risk-high",
    implementation: "Basket",
    etfs: "A broad European ETF dilutes the thesis",
    tag: "No clean ETF",
    why: "Rearmament, NATO and military sovereignty.",
    thesis: "A new cycle of European military spending. Exposure is fragmented across countries and national champions.",
    names: ["Rheinmetall", "BAE Systems", "Leonardo", "Saab", "Thales", "Dassault Aviation", "Airbus", "Safran", "Rolls-Royce", "Hensoldt", "Kongsberg", "Indra"],
    points: ["Military spending has become a priority.", "A broad ETF dilutes defence exposure.", "A basket captures national champions."],
  },
  {
    theme: "Digital sovereignty",
    icon: "network",
    status: "No",
    quality: "No ETF available",
    tone: "sat-risk-high",
    implementation: "Basket",
    etfs: "No clean ETF for the thesis",
    tag: "No clean ETF",
    why: "Local cloud, telecoms, software, cyber and data.",
    thesis: "Europe does not have a dominant hyperscaler. The thesis is a regulated architecture of infrastructure, software and security.",
    names: ["SAP", "OVHcloud", "Deutsche Telekom", "Orange", "Telefónica", "Capgemini", "Dassault Systèmes", "Sopra Steria", "Thales", "Schneider", "Siemens", "Legrand"],
    points: ["More data control than explosive growth.", "Regulation supports demand.", "A basket avoids dependence on a single name."],
  },
  {
    theme: "Luxury / indirect China",
    icon: "diamond",
    status: "Partial",
    quality: "Partial ETF",
    tone: "sat-risk-medium",
    implementation: "Basket",
    etfs: "LUXU / GLUX (UCITS) for simple exposure; LUXY as a US-listed alternative",
    tag: "LUXU / GLUX",
    why: "Pricing power and indirect exposure to Asian consumers.",
    thesis: "European luxury combines brands, scarcity and global margins. An ETF exists, but specific brands provide a cleaner expression of the thesis.",
    names: ["LVMH", "Hermès", "Ferrari", "Richemont", "Moncler", "Prada", "Kering", "L’Oréal", "EssilorLuxottica", "Pernod Ricard"],
    points: ["LUXU/GLUX provide straightforward exposure.", "An ETF buys the sector; a basket buys scarce brands.", "A basket separates leaders from weaker brands."],
  },
  {
    theme: "Pharma / healthcare",
    icon: "pulse",
    status: "Partial",
    quality: "Partial ETF",
    tone: "sat-risk-defensive",
    implementation: "Basket or sector ETF",
    etfs: "EXV4 / XDWH / global healthcare as a first layer; a basket improves precision",
    tag: "EXV4 / XDWH",
    why: "Defensive characteristics, innovation and global revenue.",
    thesis: "European pharma combines research, global scale and lower dependence on the economic cycle.",
    names: ["Novo Nordisk", "Roche", "Novartis", "AstraZeneca", "Sanofi", "GSK", "Merck KGaA", "Lonza", "Genmab", "UCB"],
    points: ["Global revenue.", "Lower cyclicality.", "Defensive quality."],
  },
  {
    theme: "Electrification / industrials",
    icon: "energy",
    status: "Partial",
    quality: "Partial ETF",
    tone: "sat-risk-high",
    implementation: "Basket",
    etfs: "GRID / PAVE / a European industrial ETF as a first layer",
    tag: "GRID / PAVE",
    why: "Grid, automation and electrical equipment.",
    thesis: "Europe has leaders in electrical equipment, automation and critical components for infrastructure, AI and data centres.",
    names: ["Schneider Electric", "Siemens", "ABB", "Legrand", "Prysmian", "Assa Abloy", "Atlas Copco", "Sandvik", "Infineon", "STMicroelectronics", "ASML"],
    points: ["Connects with AI, energy and data centres.", "A broad industrial ETF dilutes quality.", "A basket captures equipment and automation more effectively."],
  },
  {
    theme: "European semiconductors",
    icon: "chip",
    status: "Partial",
    quality: "Partial ETF",
    tone: "sat-risk-high",
    implementation: "Basket",
    etfs: "SMH / SOXX as global proxies; a basket for pure European exposure",
    tag: "SMH / SOXX",
    why: "ASML, power semiconductors and critical equipment.",
    thesis: "Europe does not dominate the entire chain, but it controls critical elements in equipment, analogue and power semiconductors.",
    names: ["ASML", "Infineon", "STMicroelectronics", "ASM International", "BE Semiconductor", "Soitec"],
    points: ["ASML is difficult to replicate.", "Exposure is concentrated in a few names.", "A basket avoids dilution."],
  },
];

function EuropeModule({ initialTheme = "European defence" } = {}) {
  const legendOrder = { "sat-risk-high": 0, "sat-risk-defensive": 1, "sat-risk-medium": 2 };
  const sortedThemes = [...EUROPE_THEMES].sort((a, b) => legendOrder[a.tone] - legendOrder[b.tone] || a.theme.localeCompare(b.theme, "pt-BR"));
  const [selectedTheme, setSelectedTheme] = useState(initialTheme);
  const active = EUROPE_THEMES.find((item) => item.theme === selectedTheme) || EUROPE_THEMES[0];

  return React.createElement(
    "main",
    { className: "satellite-layout" },
    React.createElement(
      "article",
      { className: "panel" },
      React.createElement(
        "div",
        { className: "risk-legend", style: { padding: "14px 16px 0" } },
        React.createElement("span", { className: "sat-risk-high" }, "Local growth strategy"),
        React.createElement("span", { className: "sat-risk-defensive" }, "Defensive theme"),
        React.createElement("span", { className: "sat-risk-medium" }, "China exposure")
      ),
      React.createElement(
        "div",
        { className: "satellite-grid", style: { paddingTop: 16 } },
        sortedThemes.map((item) =>
          React.createElement(
            "button",
            { className: `satellite-card ${item.tone}`, type: "button", key: item.theme, "aria-pressed": active.theme === item.theme, onClick: () => { setSelectedTheme(item.theme); scrollToMobileDetail(".satellite-detail h2"); } },
            React.createElement(
              "div",
              null,
              React.createElement("div", { className: "satellite-title-row" }, React.createElement(SatelliteIcon, { type: item.icon }), React.createElement("h3", null, item.theme)),
              React.createElement("p", null, item.why)
            )
          )
        )
      )
    ),
    React.createElement(
      "aside",
      { className: "panel satellite-detail" },
      React.createElement("span", { className: "detail-role" }, "Selected theme"),
      React.createElement("div", { className: `satellite-detail-head ${active.tone}` }, React.createElement(SatelliteIcon, { type: active.icon }), React.createElement("h2", null, active.theme)),
      React.createElement(
        "div",
        { className: "detail-grid" },
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Broad ETF"), React.createElement("strong", null, active.status)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Alternative"), React.createElement("strong", null, active.implementation)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Vehicle assessment"), React.createElement("strong", null, active.quality)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "First layer"), React.createElement("strong", null, active.etfs))
      ),
      React.createElement("p", null, active.thesis),
      React.createElement("ul", { className: "satellite-list" }, active.points.map((point) => React.createElement("li", { key: point }, point))),
      React.createElement("div", { className: "detail-box proxy-box" }, React.createElement("span", null, "Examples"), React.createElement("strong", null, active.names.join(" · "))),
      React.createElement("p", { className: "data-note" }, "Source: ETF examples and proxies, June 2026. Non-exhaustive list.")
    )
  );
}

const CHINA_FILTERS = {
  channel: [
    ["all", "All"],
    ["direct", "Direct China"],
    ["indirect", "Indirect China"],
    ["china1", "China+1"],
  ],
  motor: [
    ["all", "All"],
    ["market", "Market"],
    ["consumer", "Consumer"],
    ["physical", "Physical demand"],
    ["technology", "Technology"],
    ["chain", "Supply chain"],
  ],
};

const CHINA_CHANNELS = [
  {
    theme: "Direct China",
    icon: "network",
    channel: "direct",
    motor: "market",
    tone: "sat-risk-high",
    instruments: "MCHI, FXI, KWEB, ASHR, KBA",
    captures: "Chinese equities, domestic consumption, internet companies and A-shares.",
    risk: "Governance, state intervention, geopolitics, VIEs and deflation.",
    reading: "Pure exposure, but with high risk. Buying China requires choosing which part of China to own.",
    points: ["MCHI provides broad China exposure.", "FXI concentrates on large caps and Hong Kong.", "KWEB provides exposure to Chinese internet companies.", "ASHR/KBA provide exposure to onshore A-shares."],
    names: ["Alibaba", "Tencent", "PDD", "Baidu", "A-shares", "large caps Hong Kong"],
  },
  {
    theme: "Indirect China — luxury",
    icon: "diamond",
    channel: "indirect",
    motor: "consumer",
    tone: "sat-risk-medium",
    instruments: "LVMH, Hermès, Ferrari, Richemont, Moncler, Prada, L'Oréal",
    captures: "Premium Chinese consumers and Asian demand without directly buying Chinese equities.",
    risk: "The Chinese consumption cycle, tourism, confidence and slowing income growth.",
    reading: "Higher quality and lower direct political risk, but still dependent on Asian consumers.",
    points: ["Global brands, high margins and pricing power.", "Lower direct legal and political risk.", "A luxury ETF exists, but a basket is often cleaner."],
    names: ["LVMH", "Hermès", "Ferrari", "Richemont", "Moncler", "Prada", "L'Oréal", "EssilorLuxottica"],
  },
  {
    theme: "Indirect China — commodities",
    icon: "energy",
    channel: "indirect",
    motor: "physical",
    tone: "sat-risk-medium",
    instruments: "BHP, Rio Tinto, Freeport, Glencore, Vale, COPX, PICK",
    captures: "Chinese demand for copper, iron ore, energy and infrastructure.",
    risk: "The industrial cycle, construction, government stimulus and commodity prices.",
    reading: "Here China appears as a physical buyer rather than an equity market.",
    points: ["Exposure is more closely linked to real resources.", "More cyclical and sensitive to stimulus.", "Useful for separating physical China from listed China."],
    names: ["BHP", "Rio Tinto", "Freeport-McMoRan", "Glencore", "Vale", "COPX", "PICK"],
  },
  {
    theme: "Indirect China — technology",
    icon: "chip",
    channel: "indirect",
    motor: "technology",
    tone: "sat-risk-high",
    instruments: "ASML, TSMC, Applied Materials, Lam, KLA, Nvidia, Broadcom",
    captures: "The global technology chain, with Chinese demand and strategic bottlenecks.",
    risk: "Sanctions, export restrictions, Taiwan and geopolitical competition.",
    reading: "Strategic exposure, but with geopolitics at the centre of the thesis.",
    points: ["Captures bottlenecks in semiconductors and equipment.", "Does not depend solely on Chinese consumers.", "Export controls can change the thesis quickly."],
    names: ["ASML", "TSMC", "Applied Materials", "Lam Research", "KLA", "Nvidia", "Broadcom"],
  },
  {
    theme: "China+1",
    icon: "factory",
    channel: "china1",
    motor: "chain",
    tone: "sat-risk-defensive",
    instruments: "INDA, FLIN, EWW, VNM, EWT, EWY",
    captures: "Supply-chain diversification, nearshoring and alternative manufacturing.",
    risk: "Valuation, local execution, infrastructure and institutional capacity.",
    reading: "This is not about abandoning China. It is about insuring against concentration in a single supply chain.",
    points: ["India combines a domestic market, services and demographic scale.", "Mexico captures nearshoring to the US.", "Vietnam and Southeast Asia capture alternative manufacturing."],
    names: ["India", "Mexico", "Vietnam", "Indonesia", "Taiwan", "South Korea"],
  },
  {
    theme: "EM ex-China",
    icon: "grid",
    channel: "china1",
    motor: "chain",
    tone: "sat-risk-defensive",
    instruments: "EMXC / EXCH",
    captures: "Emerging markets without a dominant China weight.",
    risk: "May miss a Chinese recovery and can dilute specific theses.",
    reading: "A structural way to reduce China risk without abandoning emerging markets.",
    points: ["Removes the dominant Chinese risk from the emerging-market allocation.", "Helps build a more geopolitically neutral EM core.", "Less tactical; more about portfolio architecture."],
    names: ["India", "Taiwan", "South Korea", "Brazil", "Mexico", "Southeast Asia"],
  },
];

function ChinaModule({ initialTheme = "Direct China" } = {}) {
  const [filters, setFilters] = useState({ channel: "all", motor: "all" });
  const [selectedTheme, setSelectedTheme] = useState(initialTheme);
  const order = { direct: 0, indirect: 1, china1: 2 };
  const filtered = CHINA_CHANNELS.filter((item) =>
    Object.entries(filters).every(([key, value]) => value === "all" || item[key] === value)
  ).sort((a, b) => order[a.channel] - order[b.channel] || a.theme.localeCompare(b.theme, "pt-BR"));
  const active = filtered.find((item) => item.theme === selectedTheme) || filtered[0] || CHINA_CHANNELS[0];

  const filterRow = (key, label, extraClass = "") =>
    React.createElement(
      "div",
      { className: `filter-row ${extraClass}`.trim(), key },
      React.createElement("span", { className: "filter-label" }, label),
      CHINA_FILTERS[key].map(([value, text]) =>
        React.createElement(
          "button",
          {
            className: "filter-chip",
            type: "button",
            key: value,
            "aria-pressed": filters[key] === value,
            onClick: () => setFilters({ ...filters, [key]: value }),
          },
          text
        )
      )
    );

  return React.createElement(
    "main",
    { className: "satellite-layout" },
    React.createElement(
      "article",
      { className: "panel" },
      React.createElement(
        "div",
        { className: "section-head" },
        React.createElement("div", null, React.createElement("span", { className: "control-title" }, "Exposure matrix"), React.createElement("h2", null, "Direct, indirect or partial substitute"))
      ),
      React.createElement(
        "div",
        { className: "satellite-filters" },
        filterRow("channel", "Channel", "satellite-mobile-hide"),
        filterRow("motor", "Driver", "satellite-mobile-hide"),
        React.createElement(
          "div",
          { className: "risk-legend" },
          React.createElement("span", { className: "sat-risk-high" }, "Direct geopolitical risk"),
          React.createElement("span", { className: "sat-risk-medium" }, "Indirect Chinese demand"),
          React.createElement("span", { className: "sat-risk-defensive" }, "China+1 / reduced dependence")
        )
      ),
      React.createElement(
        "div",
        { className: "satellite-grid" },
        filtered.map((item) =>
          React.createElement(
            "button",
            { className: `satellite-card ${item.tone}`, type: "button", key: item.theme, "aria-pressed": active.theme === item.theme, onClick: () => { setSelectedTheme(item.theme); scrollToMobileDetail(".satellite-detail h2"); } },
            React.createElement(
              "div",
              null,
              React.createElement("div", { className: "satellite-title-row" }, React.createElement(SatelliteIcon, { type: item.icon }), React.createElement("h3", null, item.theme))
            )
          )
        )
      )
    ),
    React.createElement(
      "aside",
      { className: "panel satellite-detail" },
      React.createElement("span", { className: "detail-role" }, "Selected channel"),
      React.createElement("div", { className: `satellite-detail-head ${active.tone}` }, React.createElement(SatelliteIcon, { type: active.icon }), React.createElement("h2", null, active.theme)),
      React.createElement(
        "div",
        { className: "detail-grid" },
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Instruments"), React.createElement("strong", null, active.instruments)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Exposure captured"), React.createElement("strong", null, active.captures)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Main risk"), React.createElement("strong", null, active.risk))
      ),
      React.createElement("p", null, active.reading),
      React.createElement("ul", { className: "satellite-list" }, active.points.map((point) => React.createElement("li", { key: point }, point))),
      React.createElement("div", { className: "detail-box proxy-box" }, React.createElement("span", null, "Examples"), React.createElement("strong", null, active.names.join(" · "))),
      React.createElement("p", { className: "data-note" }, "Source: channel and instrument examples, June 2026. Holdings should be checked with the provider.")
    )
  );
}

const HEDGE_FILTERS = {
  objective: [
    ["all", "All"],
    ["income", "Income"],
    ["beta", "Beta"],
    ["stress", "Stress"],
    ["payoff", "Payoff"],
  ],
};

const HEDGE_STRATEGIES = [
  {
    theme: "Macro hedge",
    icon: "diamond",
    objective: "stress",
    tone: "sat-risk-defensive",
    instruments: "GLD, IAU, FXF / CHF",
    does: "Combines a store of value, a strong currency and regime protection.",
    use: "Diversify currency risk, institutional-confidence risk and macro shocks.",
    limit: "Not a perfect hedge against equity declines; it may remain flat in a bull market.",
    reading: "The US dollar is the reference hedge against Brazilian risk. The Swiss franc represents monetary quality. Gold acts as a regime hedge.",
    examples: ["GLD: highly liquid physical gold", "IAU: competitively priced physical gold", "FXF / CHF: Swiss-franc exposure"],
  },
  {
    theme: "Option income",
    icon: "network",
    objective: "income",
    tone: "sat-risk-medium",
    instruments: "JEPI, JEPQ, XYLD, QYLD",
    does: "Sells calls to convert part of the expected upside into current income.",
    use: "A sideways market or a portfolio that prioritises income.",
    limit: "It remains an equity exposure and lags during strong rallies.",
    reading: "Income today in exchange for less upside tomorrow.",
    examples: ["JEPI: defensive equity + options", "JEPQ: Nasdaq/growth + options", "XYLD: S&P 500 covered call", "QYLD: Nasdaq 100 covered call"],
  },
  {
    theme: "Defensive equity / min-vol",
    icon: "shield",
    objective: "beta",
    tone: "sat-risk-defensive",
    instruments: "USMV, SPLV, MVOL / Min Vol UCITS",
    does: "Replaces aggressive equity exposure with a basket that has historically been less volatile.",
    use: "Reduce beta without leaving equities.",
    limit: "It can still decline during a crisis and may lag in a concentrated bull market.",
    reading: "Less beta, not less market exposure.",
    examples: ["USMV: US minimum volatility", "SPLV: low volatility within the S&P 500", "MVOL / UCITS: global or regional versions"],
  },
  {
    theme: "Volatility / VIX",
    icon: "pulse",
    objective: "stress",
    tone: "sat-risk-high",
    instruments: "VIXY, VXX, UVXY, VIX futures UCITS",
    does: "Gains when implied volatility surges.",
    use: "Short-lived stress, a specific event or tactical protection.",
    limit: "Decay and rolling costs make long-term holding expensive.",
    reading: "Tends to work as emergency protection.",
    examples: ["VIXY: short-term VIX futures", "VXX: short-term futures ETN", "UVXY: leveraged exposure", "UCITS: offshore alternative"],
  },
  {
    theme: "Tactical directional hedge",
    icon: "shield",
    objective: "stress",
    tone: "sat-risk-high",
    instruments: "SH, PSQ, RWM, EUM, SDS, QID, SQQQ, SPXU",
    does: "Rises when the index falls, generally on a daily-reset basis.",
    use: "A short-term hedge without selling the original position.",
    limit: "Compounding and decay penalise long holding periods.",
    reading: "Directional, short term and disciplined.",
    examples: ["SH: -1x S&P 500", "PSQ: -1x Nasdaq-100", "RWM: -1x small caps", "EUM: -1x emerging markets", "SDS / QID / SQQQ / SPXU: leveraged"],
  },
  {
    theme: "Buffered / defined outcome",
    icon: "server",
    objective: "payoff",
    tone: "sat-risk-medium",
    instruments: "Innovator Buffer ETFs, FT Vest Buffer ETFs, AllianzIM Buffered Outcome ETFs",
    does: "Creates a downside buffer in exchange for an upside cap.",
    use: "For an investor who accepts a cap to reduce a moderate loss.",
    limit: "Depends on the current outcome period, buffer and cap.",
    reading: "Partial protection, not full insurance.",
    examples: ["Innovator Buffer ETFs: series such as BJAN/BJUN/BJUL", "FT Vest Buffer ETFs: families such as FJAN/FJUN/FJUL", "AllianzIM Buffered Outcome ETFs: defined buffers and caps", "Collars/put spreads: structures rather than ready-made ETFs"],
  },
  {
    theme: "Deconcentration",
    icon: "grid",
    objective: "beta",
    tone: "sat-risk-defensive",
    instruments: "RSP, EQWL, QQEW, USMV",
    does: "Reduces dependence on mega-caps and narrow market leadership.",
    use: "When the primary risk is concentration in a few names.",
    limit: "It does not usually mitigate a broad market decline.",
    reading: "A concentration hedge, not a crash hedge.",
    examples: ["RSP: S&P 500 equal weight", "EQWL: S&P 100 equal weight", "QQEW: Nasdaq 100 equal weight", "USMV: min-vol with a defensive bias"],
  },
  {
    theme: "Direct index options",
    icon: "shield",
    objective: "payoff",
    tone: "sat-risk-high",
    instruments: "SPY puts, QQQ puts, put spreads, collars",
    does: "Defines a floor, cost, term and participation in the upside.",
    use: "Custom protection using SPY, QQQ or liquid indices.",
    limit: "Requires a premium, gives up upside or limits protection.",
    reading: "More precision, more trade-offs.",
    examples: ["Protective put: direct insurance", "Put spread: partial protection", "Collar: put + sold call", "Call-financed put spread: lower cost, limited upside"],
  },
];

function HedgeModule({ initialTheme = "Option income" } = {}) {
  const [filters, setFilters] = useState({ objective: "all" });
  const [selectedTheme, setSelectedTheme] = useState(initialTheme);
  const toneOrder = { "sat-risk-high": 0, "sat-risk-medium": 1, "sat-risk-defensive": 2 };
  const filtered = HEDGE_STRATEGIES.filter((item) =>
    Object.entries(filters).every(([key, value]) => value === "all" || item[key] === value)
  ).sort((a, b) => toneOrder[a.tone] - toneOrder[b.tone] || a.theme.localeCompare(b.theme, "pt-BR"));
  const active = filtered.find((item) => item.theme === selectedTheme) || filtered[0] || HEDGE_STRATEGIES[0];

  const filterRow = (key, label) =>
    React.createElement(
      "div",
      { className: "filter-row", key },
      React.createElement("span", { className: "filter-label" }, label),
      HEDGE_FILTERS[key].map(([value, text]) =>
        React.createElement(
          "button",
          {
            className: "filter-chip",
            type: "button",
            key: value,
            "aria-pressed": filters[key] === value,
            onClick: () => setFilters({ ...filters, [key]: value }),
          },
          text
        )
      )
    );

  return React.createElement(
    "main",
    { className: "satellite-layout" },
    React.createElement(
      "article",
      { className: "panel" },
      React.createElement(
        "div",
        { className: "section-head" },
        React.createElement("div", null, React.createElement("span", { className: "control-title" }, "Hedging strategies"), React.createElement("h2", null, "Payoff, beta, volatility and currency"))
      ),
      React.createElement(
        "div",
        { className: "satellite-filters" },
        filterRow("objective", "Objective"),
        React.createElement(
          "div",
          { className: "risk-legend" },
          React.createElement("span", { className: "sat-risk-high" }, "Tactical / high carrying cost"),
          React.createElement("span", { className: "sat-risk-medium" }, "Payoff / income"),
          React.createElement("span", { className: "sat-risk-defensive" }, "Beta reduction")
        )
      ),
      React.createElement(
        "div",
        { className: "satellite-grid" },
        filtered.map((item) =>
          React.createElement(
            "button",
            { className: `satellite-card ${item.tone}`, type: "button", key: item.theme, "aria-pressed": active.theme === item.theme, onClick: () => { setSelectedTheme(item.theme); scrollToMobileDetail(".satellite-detail h2"); } },
            React.createElement(
              "div",
              null,
              React.createElement("div", { className: "satellite-title-row" }, React.createElement(SatelliteIcon, { type: item.icon }), React.createElement("h3", null, item.theme)),
              React.createElement("p", null, item.reading)
            )
          )
        )
      )
    ),
    React.createElement(
      "aside",
      { className: "panel satellite-detail" },
      React.createElement("span", { className: "detail-role" }, "Selected hedge"),
      React.createElement("div", { className: `satellite-detail-head ${active.tone}` }, React.createElement(SatelliteIcon, { type: active.icon }), React.createElement("h2", null, active.theme)),
      React.createElement(
        "div",
        { className: "detail-grid" },
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Instruments"), React.createElement("strong", null, active.instruments)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "What it does"), React.createElement("strong", null, active.does)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Typical use"), React.createElement("strong", null, active.use)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Limitation"), React.createElement("strong", null, active.limit))
      ),
      React.createElement("p", null, active.reading),
      React.createElement("ul", { className: "satellite-list" }, active.examples.map((point) => React.createElement("li", { key: point }, point))),
      React.createElement("p", { className: "data-note" }, "Source: liquid instruments and common structures, June 2026. Tactical products require checks of term, liquidity, cost and daily reset rules.")
    )
  );
}

function DataLabTickerLink({ ticker, availableTickers }) {
  if (!availableTickers?.has(ticker)) return null;
  return React.createElement(
    "a",
    {
      className: "data-lab-direct-link",
      href: `#dataLab/${encodeURIComponent(ticker)}`,
      "aria-label": `Open ${ticker} in Data Lab`,
    },
    "Data Lab ↗"
  );
}

function CoreModule({ functions = CORE_EQUITY_FUNCTIONS, initialEtf = "VOO", legendMode = "equity", showVehicleToggle = true, dataLabTickers = new Set() } = {}) {
  const [selectedEtf, setSelectedEtf] = useState(initialEtf);
  const [vehicleView, setVehicleView] = useState("all");
  const [geoData, setGeoData] = useState(null);
  const [geoResult, setGeoResult] = useState(null);
  useEffect(() => {
    let cancelled = false;
    DataClient.load("etf-geography")
      .then((result) => {
        if (cancelled) return;
        setGeoResult(result);
        setGeoData(result.ok ? result.data : null);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const selectCoreEtf = (ticker) => {
    setSelectedEtf(ticker);
    if (window.matchMedia("(max-width: 720px)").matches) {
      window.setTimeout(() => {
        const title = document.querySelector(".core-detail h2");
        if (!title) return;
        const top = title.getBoundingClientRect().top + window.scrollY - 78;
        window.scrollTo({ top, behavior: "smooth" });
      }, 60);
    }
  };
  const setCoreVehicleView = (nextView) => {
    setVehicleView(nextView);
    if (!tickerMatchesVehicleView(selectedEtf, nextView)) {
      const fallback = functions.flatMap((row) => row.tickers).find((ticker) => tickerMatchesVehicleView(ticker, nextView)) || "VOO";
      setSelectedEtf(fallback);
    }
  };
  const detail = CORE_DETAILS[selectedEtf] || CORE_DETAILS.VOO;
  const geography = geoData?.instruments?.[selectedEtf];
  const countryWeights = geography?.weights || CORE_COUNTRY_WEIGHTS[selectedEtf];
  const maxCountryWeight = countryWeights ? Math.max(...countryWeights.map((row) => row[1])) : 0;

  return React.createElement(
    "main",
    { className: "tech-layout" },
    React.createElement(
      "section",
      { className: "core-layout" },
      React.createElement(
        "article",
        { className: "panel" },
        legendMode !== "fixed" || showVehicleToggle
          ? React.createElement(
              "div",
              { className: "core-legend-row" },
              React.createElement(
                    "div",
                    { className: "core-legend" },
                    legendMode === "fixed"
                      ? [
                          React.createElement("span", { className: "etf-token etf-treasury", key: "treasury" }, "Nominal Treasuries"),
                          React.createElement("span", { className: "etf-token etf-inflation", key: "inflation" }, "Inflation-linked"),
                          React.createElement("span", { className: "etf-token etf-credit", key: "credit" }, "Corporate credit"),
                          React.createElement("span", { className: "etf-token etf-aggregate", key: "aggregate" }, "Aggregate bonds"),
                        ]
                      : [
                          React.createElement("span", { className: "etf-token etf-us", key: "us" }, "US"),
                          React.createElement("span", { className: "etf-token etf-global", key: "global" }, "Developed global"),
                          React.createElement("span", { className: "etf-token etf-developed", key: "developed" }, "Developed ex-US"),
                          React.createElement("span", { className: "etf-token etf-emerging", key: "emerging" }, "Emerging markets"),
                        ]
                  ),
              showVehicleToggle
                ? React.createElement(
                    "div",
                    { className: "ucits-toggle", "aria-label": "Filter ETFs by listing type" },
                    React.createElement("button", { type: "button", "aria-pressed": vehicleView === "all", onClick: () => setCoreVehicleView("all") }, "All"),
                    React.createElement("button", { type: "button", "aria-pressed": vehicleView === "us", onClick: () => setCoreVehicleView("us") }, "US-listed"),
                    React.createElement("button", { type: "button", "aria-pressed": vehicleView === "ucits", onClick: () => setCoreVehicleView("ucits") }, "UCITS")
                  )
                : null
            )
          : null,
        React.createElement(
          "div",
          { className: "core-function-grid" },
          functions.map((row) =>
            React.createElement(
              "div",
              { className: "core-function", key: row.fn },
              React.createElement("div", null, React.createElement("h3", null, row.fn), React.createElement("p", null, row.why), React.createElement("p", null, row.note)),
              React.createElement(
                "div",
                { className: "etf-token-grid" },
                row.tickers.map((ticker) =>
                  React.createElement("button", { className: coreTokenClass(ticker, vehicleView), type: "button", key: `${row.fn}-${ticker}`, "aria-pressed": selectedEtf === ticker, disabled: !tickerMatchesVehicleView(ticker, vehicleView), onClick: () => selectCoreEtf(ticker) }, ticker)
                )
              )
            )
          )
        )
      ),
      React.createElement(
        "aside",
        { className: "panel core-detail" },
        React.createElement(
          "div",
          { className: "instrument-detail-heading" },
          React.createElement("h2", null, selectedEtf),
          React.createElement(DataLabTickerLink, { ticker: selectedEtf, availableTickers: dataLabTickers })
        ),
        React.createElement("span", { className: "detail-role" }, detail[0]),
        React.createElement("p", null, detail[1]),
        React.createElement("p", null, detail[2]),
        countryWeights
          ? React.createElement(
              "div",
              { className: "mini-country-chart" },
              React.createElement("h3", null, "Approximate geographic composition"),
              countryWeights.map(([country, weight]) =>
                React.createElement(
                  "div",
                  { className: "mini-country-row", key: `${selectedEtf}-${country}` },
                  React.createElement("span", null, country),
                  React.createElement("div", { className: "mini-country-track" }, React.createElement("div", { className: "mini-country-bar", style: { width: `${(weight / maxCountryWeight) * 100}%` } })),
                  React.createElement("span", null, `${weight.toFixed(1).replace(".", ",")}%`)
                )
              ),
              React.createElement(
                "p",
                { className: "data-note" },
                geography
                  ? `Source: ${geography.source}.`
                  : "Approximate weights by country. Source: provider factsheets and benchmarks, June 2026."
              )
            )
          : null,
        React.createElement("ul", { className: "core-detail-list" }, detail[3].map((point) => React.createElement("li", { key: point }, point)))
      )
    )
  );
}

function FixedIncomeModule({ dataLabTickers, initialEtf = "IB01" }) {
  return React.createElement(CoreModule, { functions: FIXED_INCOME_FUNCTIONS, initialEtf, legendMode: "fixed", showVehicleToggle: true, dataLabTickers });
}

const SECTOR_GICS_ETFS = [
  { tickers: ["XLK", "IUIT"], sector: "Information Technology", icon: "chip", tone: "sat-risk-high", role: "Growth / quality", why: "Software, semiconductors and digital infrastructure.", limit: "High concentration and multiples that are more sensitive to growth revisions.", points: ["The most direct technology proxy within the S&P 500.", "Carries a significant share of the index's structural leadership.", "Useful for examining the growth premium versus the benchmark."] },
  { tickers: ["XLC", "IUCM"], sector: "Communication Services", icon: "phone", tone: "sat-risk-high", role: "Platforms / media", why: "Large digital platforms, media, streaming and telecoms.", limit: "Combines very different businesses and may be concentrated in a few names.", points: ["Useful for separating digital platforms from pure technology.", "Linked to advertising, content and distribution.", "It is not defensive despite including telecoms."] },
  { tickers: ["XLY", "IUCD"], sector: "Consumer Discretionary", icon: "diamond", tone: "sat-risk-high", role: "Cyclical consumption", why: "E-commerce, autos, retail and income-sensitive consumption.", limit: "Carries economic-cycle, consumer-confidence and concentration risks.", points: ["A useful gauge of domestic risk appetite.", "May capture premium consumption and retail platforms.", "More exposed to slowdowns and high interest rates."] },
  { tickers: ["XLB", "IUMS"], sector: "Materials", icon: "factory", tone: "sat-risk-medium", role: "Cycle / commodities", why: "Chemicals, metals, materials and industrial inputs.", limit: "Closely linked to the global cycle, the US dollar and commodity demand.", points: ["Acts as an indicator of the industrial cycle.", "Complements energy and industrials.", "Does not replace direct commodity exposure."] },
  { tickers: ["XLE", "IUES"], sector: "Energy", icon: "oil", tone: "sat-risk-medium", role: "Traditional energy", why: "Oil, gas, majors and cash generation within the energy sector.", limit: "Sensitive to oil prices, geopolitics and CAPEX discipline.", points: ["A partial hedge against an energy shock.", "Carries the sector's dividends and buybacks.", "It is more traditional energy than energy transition."] },
  { tickers: ["XLF", "IUFS"], sector: "Financials", icon: "money", tone: "sat-risk-medium", role: "Rates / credit", why: "Banks, insurers, card companies, brokers and capital markets.", limit: "Depends on the yield curve, credit conditions and the default cycle.", points: ["A useful view of the US financial cycle.", "May benefit from a steeper yield curve.", "Risk rises when credit deteriorates."] },
  { tickers: ["XLI", "IUIS"], sector: "Industrials", icon: "factory", tone: "sat-risk-medium", role: "Cycle / CAPEX", why: "Industry, transport, defence, machinery and infrastructure.", limit: "A broad ETF dilutes specific theses such as defence or reindustrialisation.", points: ["A useful building block for the physical cycle and CAPEX.", "Linked to onshoring and infrastructure.", "For a precise thesis, a basket may work better."] },
  { tickers: ["XLP", "IUCS"], sector: "Consumer Staples", icon: "home", tone: "sat-risk-defensive", role: "Defensive / essential consumption", why: "Brands, food, beverages, hygiene and essential retail.", limit: "May lag during a growth-led bull market.", points: ["Reduces cyclicality within equities.", "A useful proxy for margin stability.", "Sensitive to costs and price elasticity."] },
  { tickers: ["XLV", "IUHC"], sector: "Health Care", icon: "pulse", tone: "sat-risk-defensive", role: "Defensive quality", why: "Pharma, services, medical equipment and managed care.", limit: "Combines defensive characteristics with regulatory risk and innovation-pipeline risk.", points: ["A useful layer of less cyclical quality.", "Combines demographics, innovation and scale.", "It is not a pure biotech or pharma thesis."] },
  { tickers: ["XLRE"], sector: "Real Estate", icon: "home", tone: "sat-risk-defensive", role: "Listed real estate", why: "REITs and listed real-estate assets.", limit: "Sensitive to interest rates, credit, capitalisation rates and vacancy.", points: ["Useful for liquid real-estate exposure.", "More duration and credit than growth.", "Does not replace private real estate."] },
  { tickers: ["XLU", "IUUS"], sector: "Utilities", icon: "faucet", tone: "sat-risk-defensive", role: "Defensive / duration", why: "Regulated utilities, electricity and essential infrastructure.", limit: "Sensitive to interest rates and regulation; it is not the same as a specific grid exposure.", points: ["A classic defensive exposure within equities.", "Linked to electrification and data-centre demand.", "A grid/AI thesis may require a complementary basket."] },
];

function SectorGicsModule({ dataLabTickers, initialSector = "XLK" }) {
  const [selectedSector, setSelectedSector] = useState(initialSector);
  const [vehicleView, setVehicleView] = useState("all");
  const activeMeta = SECTOR_GICS_ETFS.find((item) => item.tickers.includes(selectedSector)) || SECTOR_GICS_ETFS[0];
  const setSectorVehicleView = (nextView) => {
    setVehicleView(nextView);
    if (!tickerMatchesVehicleView(selectedSector, nextView)) {
      const fallback = SECTOR_GICS_ETFS.flatMap((item) => item.tickers).find((ticker) => tickerMatchesVehicleView(ticker, nextView));
      if (fallback) setSelectedSector(fallback);
    }
  };

  return React.createElement(
    "main",
    { className: "core-layout sector-layout" },
    React.createElement(
      "article",
      { className: "panel" },
      React.createElement(
        "div",
        { className: "section-head" },
        React.createElement("div", null, React.createElement("span", { className: "control-title" }, "GICS sectors / S&P 500"))
      ),
      React.createElement(
        "div",
        { className: "core-legend-row sector-legend-row" },
        React.createElement(
          "div",
          { className: "risk-legend" },
          React.createElement("span", { className: "sat-risk-high" }, "Growth / concentration"),
          React.createElement("span", { className: "sat-risk-medium" }, "Cyclical / macro"),
          React.createElement("span", { className: "sat-risk-defensive" }, "Defensive / rates")
        ),
        React.createElement(
          "div",
          { className: "ucits-toggle", "aria-label": "Filter sector ETFs by listing type" },
          React.createElement("button", { type: "button", "aria-pressed": vehicleView === "all", onClick: () => setSectorVehicleView("all") }, "All"),
          React.createElement("button", { type: "button", "aria-pressed": vehicleView === "us", onClick: () => setSectorVehicleView("us") }, "US-listed"),
          React.createElement("button", { type: "button", "aria-pressed": vehicleView === "ucits", onClick: () => setSectorVehicleView("ucits") }, "UCITS")
        )
      ),
      React.createElement(
        "div",
        { className: "core-function-grid sector-function-grid" },
        SECTOR_GICS_ETFS.map((item) =>
          React.createElement(
            "div",
            {
              className: `core-function sector-function ${item.tone}`,
              key: item.sector,
            },
            React.createElement(
              "div",
              null,
              React.createElement("div", { className: "satellite-title-row" }, React.createElement(SatelliteIcon, { type: item.icon }), React.createElement("h3", null, item.sector)),
              React.createElement("p", null, item.role),
              React.createElement("p", null, item.why)
            ),
            React.createElement(
              "div",
              { className: "etf-token-grid sector-token-wrap" },
              item.tickers.map((ticker) =>
                React.createElement(
                  "button",
                  {
                    className: `etf-token sector-token ${item.tone}${vehicleView !== "all" && !tickerMatchesVehicleView(ticker, vehicleView) ? " is-muted" : ""}`,
                    type: "button",
                    key: `${item.sector}-${ticker}`,
                    "aria-pressed": selectedSector === ticker,
                    disabled: !tickerMatchesVehicleView(ticker, vehicleView),
                    onClick: () => {
                      setSelectedSector(ticker);
                      scrollToMobileDetail(".satellite-detail h2");
                    },
                  },
                  ticker
                )
              )
            )
          )
        )
      ),
      React.createElement("p", { className: "data-note" }, "Sector proxies: US-listed Select Sector SPDRs and comparable USD accumulating UCITS vehicles. UCITS indices may apply concentration caps. Real Estate is currently US-listed only. Numerical data is available in Data Lab.")
    ),
    React.createElement(
      "aside",
      { className: "panel satellite-detail core-detail" },
      React.createElement("span", { className: "detail-role" }, "Selected sector"),
      React.createElement(
        "div",
        { className: `satellite-detail-head ${activeMeta.tone}` },
        React.createElement(SatelliteIcon, { type: activeMeta.icon }),
        React.createElement(
          "div",
          { className: "instrument-detail-heading" },
          React.createElement("h2", null, activeMeta.ticker),
          React.createElement(DataLabTickerLink, { ticker: activeMeta.ticker, availableTickers: dataLabTickers })
        )
      ),
      React.createElement("p", null, activeMeta.sector),
      React.createElement(
        "div",
        { className: "detail-grid" },
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Role"), React.createElement("strong", null, activeMeta.role)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "What it captures"), React.createElement("strong", null, activeMeta.why)),
        React.createElement("div", { className: "detail-box" }, React.createElement("span", null, "Limitation"), React.createElement("strong", null, activeMeta.limit))
      ),
      React.createElement("ul", { className: "satellite-list" }, activeMeta.points.map((point) => React.createElement("li", { key: point }, point)))
    )
  );
}

const ETF_SUBMODULES = [
  ["fixed", "Fixed Income"],
  ["core", "Core Equities"],
  ["sectors", "Sectors"],
  ["satellites", "US Satellites"],
  ["europe", "European Themes"],
  ["china", "China / China+1"],
  ["hedges", "Hedge"],
];

const ETF_DESTINATIONS = new Map();

const registerEtfDestination = (ticker, tab, target) => {
  const normalizedTicker = String(ticker || "").trim().toUpperCase();
  if (!normalizedTicker || ETF_DESTINATIONS.has(normalizedTicker)) return;
  ETF_DESTINATIONS.set(normalizedTicker, { tab, target });
};

FIXED_INCOME_FUNCTIONS.forEach((row) => row.tickers.forEach((ticker) => registerEtfDestination(ticker, "fixed", ticker)));
registerEtfDestination("TIP5", "fixed", "TI5A");
CORE_EQUITY_FUNCTIONS.forEach((row) => row.tickers.forEach((ticker) => registerEtfDestination(ticker, "core", ticker)));
SECTOR_GICS_ETFS.forEach((item) => item.tickers.forEach((ticker) => registerEtfDestination(ticker, "sectors", ticker)));

[
  [["SMH", "SOXX"], "satellites", "Semiconductors / AI hardware"],
  [["ITA", "PPA"], "satellites", "US defence"],
  [["CIBR", "HACK"], "satellites", "Cybersecurity"],
  [["BOTZ", "ROBO"], "satellites", "Robotics / automation"],
  [["XLE", "GRID", "PAVE", "XLU"], "satellites", "Energy / grid"],
  [["ITB", "XHB"], "satellites", "Residential construction"],
  [["PKB"], "satellites", "Construction materials and infrastructure"],
  [["SRVR", "VPN"], "satellites", "Physical data centres"],
  [["XLI", "AIRR"], "satellites", "Onshoring / reindustrialisation"],
  [["QTUM"], "satellites", "Quantum / frontier computing"],
  [["LUXU", "GLUX"], "europe", "Luxury / indirect China"],
  [["EXV4", "XDWH"], "europe", "Pharma / healthcare"],
  [["MCHI", "FXI", "KWEB", "ASHR", "KBA"], "china", "Direct China"],
  [["COPX", "PICK"], "china", "Indirect China — commodities"],
  [["INDA", "FLIN", "EWW", "VNM", "EWT", "EWY"], "china", "China+1"],
  [["EMXC", "EXCH"], "china", "EM ex-China"],
  [["GLD", "IAU", "FXF"], "hedges", "Macro hedge"],
  [["JEPI", "JEPQ", "XYLD", "QYLD"], "hedges", "Option income"],
  [["USMV", "SPLV"], "hedges", "Defensive equity / min-vol"],
  [["VIXY", "VXX", "UVXY"], "hedges", "Volatility / VIX"],
  [["SH", "PSQ", "RWM", "EUM", "SDS", "QID", "SQQQ", "SPXU"], "hedges", "Tactical directional hedge"],
  [["RSP", "EQWL", "QQEW", "USMV"], "hedges", "Deconcentration"],
  [["SPY", "QQQ"], "hedges", "Direct index options"],
].forEach(([tickers, tab, target]) => tickers.forEach((ticker) => registerEtfDestination(ticker, tab, target)));

const etfDestinationForTicker = (ticker) => ETF_DESTINATIONS.get(String(ticker || "").trim().toUpperCase()) || null;

const etfHrefForTicker = (ticker) => {
  const destination = etfDestinationForTicker(ticker);
  return destination ? `#etfs/${destination.tab}/${encodeURIComponent(destination.target)}` : null;
};

const requestedEtfDestination = () => {
  const [module, tab, encodedTarget] = window.location.hash.replace(/^#/, "").split("/").filter(Boolean);
  if (module !== "etfs" || !ETF_SUBMODULES.some(([key]) => key === tab)) return null;
  if (!encodedTarget) return { tab, target: null };
  try {
    return { tab, target: decodeURIComponent(encodedTarget) };
  } catch (_error) {
    return { tab, target: null };
  }
};

function EtfsModule() {
  const [routeDestination, setRouteDestination] = useState(() => requestedEtfDestination());
  const [activeEtfTab, setActiveEtfTab] = useState(() => routeDestination?.tab || "fixed");
  const [dataLabTickers, setDataLabTickers] = useState(() => new Set());

  useEffect(() => {
    const syncEtfRoute = () => {
      const nextDestination = requestedEtfDestination();
      if (!nextDestination) return;
      setRouteDestination(nextDestination);
      setActiveEtfTab(nextDestination.tab);
    };
    window.addEventListener("hashchange", syncEtfRoute);
    return () => window.removeEventListener("hashchange", syncEtfRoute);
  }, []);

  useEffect(() => {
    let cancelled = false;
    DataClient.load("etf-universe").then((result) => {
      if (cancelled || !result.ok) return;
      setDataLabTickers(new Set((result.data?.instruments || []).map((item) => item.ticker)));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const renderActive = () => {
    const requestedTarget = routeDestination?.tab === activeEtfTab ? routeDestination.target : null;
    if (activeEtfTab === "core") return React.createElement(CoreModule, { key: `core-${requestedTarget || "default"}`, dataLabTickers, initialEtf: requestedTarget || "VOO" });
    if (activeEtfTab === "fixed") return React.createElement(FixedIncomeModule, { key: `fixed-${requestedTarget || "default"}`, dataLabTickers, initialEtf: requestedTarget || "IB01" });
    if (activeEtfTab === "sectors") return React.createElement(SectorGicsModule, { key: `sectors-${requestedTarget || "default"}`, dataLabTickers, initialSector: requestedTarget || "XLK" });
    if (activeEtfTab === "satellites") return React.createElement(SatelliteModule, { key: `satellites-${requestedTarget || "default"}`, initialTheme: requestedTarget || "Semiconductors / AI hardware" });
    if (activeEtfTab === "europe") return React.createElement(EuropeModule, { key: `europe-${requestedTarget || "default"}`, initialTheme: requestedTarget || "European defence" });
    if (activeEtfTab === "china") return React.createElement(ChinaModule, { key: `china-${requestedTarget || "default"}`, initialTheme: requestedTarget || "Direct China" });
    return React.createElement(HedgeModule, { key: `hedges-${requestedTarget || "default"}`, initialTheme: requestedTarget || "Option income" });
  };

  return React.createElement(
    "main",
    { className: "etf-shell work-surface" },
    React.createElement(
      "nav",
      { className: "panel etf-subtabs", "aria-label": "ETF submodules" },
      ETF_SUBMODULES.map(([key, label]) =>
        React.createElement(
          "button",
          {
            key,
            type: "button",
            "aria-pressed": activeEtfTab === key,
            onClick: () => {
              setActiveEtfTab(key);
              setRouteDestination({ tab: key, target: null });
              window.history.replaceState({ module: "etfs", etfTab: key }, "", `#etfs/${key}`);
            },
          },
          label
        )
      )
    ),
    renderActive()
  );
}

window.GCEtfs = {
  EtfsModule,
  etfDestinationForTicker,
  etfHrefForTicker,
};
})();
