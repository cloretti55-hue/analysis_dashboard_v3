(function () {
const { useEffect, useState } = React;
const { themeFromHash } = window.GCCommon;

const hashParts = () =>
  window.location.hash.replace(/^#/, "").split("/").filter(Boolean);

const TECH_CYCLES = [
  {
    cycle: "Railways",
    capex: ["Very high", "capex-very"],
    excess: ["High", "risk-high"],
    destruction: ["Very high", "risk-very"],
    winners: ["High", "winner-high"],
    lesson: "Real infrastructure; capital destroyed.",
  },
  {
    cycle: "Electrification",
    capex: ["High", "capex-high"],
    excess: ["Medium", "risk-mid"],
    destruction: ["Medium", "risk-mid"],
    winners: ["High", "winner-high"],
    lesson: "Scale captures value.",
  },
  {
    cycle: "Dotcom",
    capex: ["Very high", "capex-very"],
    excess: ["Very high", "risk-very"],
    destruction: ["Very high", "risk-very"],
    winners: ["Very high", "winner-very"],
    lesson: "Right thesis; wrong price.",
  },
  {
    cycle: "Current AI cycle",
    capex: ["Very high", "capex-very"],
    excess: ["Forming", "unknown"],
    destruction: ["Still incomplete", "unknown"],
    winners: ["Undetermined", "unknown"],
    lesson: "Winners are still being selected.",
  },
];

const CYCLE_DETAILS = {
  Railways: {
    anatomy:
      "The investment was real: tracks, land, bridges, locomotives and concessions. In the US, excess lines, railway debt and projects built ahead of demand contributed to crises such as those of 1873 and 1893. The infrastructure remained; many shareholders and creditors failed. Value migrated to consolidated networks, critical routes and operators with logistical scale.",
    lesson: "Real infrastructure does not guarantee returns for every investor.",
  },
  Electrification: {
    anatomy:
      "CAPEX created power plants, transmission networks, urban distribution, electric motors and industrial equipment. Competition among standards, local utilities and manufacturers eliminated operators without scale. Leadership remained with those controlling equipment, networks and distribution: General Electric, Westinghouse and large regulated utilities.",
    lesson: "Value does not come from infrastructure alone; it emerges when infrastructure becomes recurring use and economic scale.",
  },
  Dotcom: {
    anatomy:
      "The internet thesis was correct, but capital arrived too early and at excessive prices. Between 1999 and 2002, there was excess fibre, telecoms capacity, servers, portals and unprofitable e-commerce. WorldCom and Global Crossing symbolised infrastructure capital destruction; Amazon, Google, Microsoft and Apple survived, scaled and monetised.",
    lesson: "A correct thesis can destroy capital when price, timing and monetisation are wrong.",
  },
  "Current AI cycle": {
    anatomy:
      "The CAPEX is real: GPUs, HBM, networking, data centres, power, cooling, cloud and foundation models. Initial value capture appears in Nvidia, TSMC, ASML, Broadcom, hyperscalers, electrical equipment and data centres. The risk is not that AI is false; it is paying for perfect success before final application-layer monetisation.",
    lesson: "The cycle is real, but the final winners are still being selected.",
  },
};

const AI_STACK = [
  ["Power / Grid", "Physical demand: utilities, transmission and equipment.", "money-now", "visible CAPEX flow"],
  ["Data centres / Cooling", "Critical infrastructure: Vertiv, Eaton, Schneider, Equinix.", "money-now", "visible CAPEX flow"],
  ["Chips / HBM / Networking", "Technology bottleneck: Nvidia, TSMC, Broadcom, ASML.", "money-flow", "accelerating capture"],
  ["Cloud / Hyperscalers", "Scale and distribution: Microsoft, Amazon, Google, Oracle.", "money-forming", "monetisation forming"],
  ["Applications", "Final monetisation: software, agents and vertical applications.", "money-future", "evidence still incomplete"],
];

const TECH_TIMELINE = [
  ["1", "Narrative", ""],
  ["2", "CAPEX", "current-zone"],
  ["3", "Excess", "current-zone"],
  ["4", "Failure / selection", ""],
  ["5", "Concentration of gains", ""],
];

const GOVERNMENT_STACK = [
  ["Semiconductors", "CHIPS Act / Intel", "Reindustrialisation and chip sovereignty."],
  ["Quantum / supercomputing", "IBM, National Quantum Initiative, DOE labs", "The next frontier in computing, cryptography and defence."],
  ["Data centres / power", "FERC, DOE, federal land, grid", "AI requires electricity, connections and permits."],
  ["Defence / national security", "Pentagon, cloud, military AI, cyber", "Government demand for dual-use technologies."],
  ["Basic research", "NSF, DARPA, DOE, universities", "The state funds the scientific foundation before private monetisation."],
];

const THEME_BRIEFINGS = [
  {
    key: "gold-commodities",
    date: "04/08",
    label: "Gold and commodities",
    title: "Gold, central banks and the role of commodities",
    summary: "Gold as a monetary reserve, central banks as a source of structural demand, investors as the marginal driver and commodities with different economic functions. Compelling current stories and market narratives do not necessarily translate into favourable investment outcomes.",
    tags: ["Gold", "Commodities", "Central banks"],
    images: [
      {
        src: "assets/themes/equities-vs-commodities.png",
        title: "Equities vs commodities: pricing drivers",
        comment: "Equities tend to price growth, earnings and cash generation; commodities reflect scarcity, supply, demand, inventories and shocks. This distinction helps explain why the two asset classes serve different portfolio functions.",
      },
      {
        src: "assets/themes/gold-central-banks-2022-2026.png",
        title: "Gold and central banks: official demand",
        comment: "Official demand for gold has remained historically high since 2022. The analysis distinguishes reported purchases, undisclosed activity and the limits of attributing the entire global total to specific countries.",
      },
      {
        src: "assets/themes/gold-supply-demand-price-2025-2026.png",
        title: "Supply, demand and price formation",
        comment: "In 2025, the marginal impulse came more from investors, especially ETFs, while central banks purchased less than in 2024 but continued to support a structural floor for the market.",
      },
      {
        src: "assets/themes/gold-vs-commodities-functions.png",
        title: "Gold vs other commodities: economic function",
        comment: "Not every commodity is a hedge. Gold mainly responds to monetary and systemic risks; energy, industrial metals and agricultural commodities protect against different shocks and may perform poorly in recessions.",
      },
      {
        src: "assets/themes/gold-vs-commodities-etfs.png",
        title: "Commodities through ETFs: implementation",
        comment: "Physical exposure, futures and producer equities are not equivalent. To track a commodity, the vehicle must capture the physical or futures price; when investing in companies, the exposure also includes operational and equity risk.",
      },
      {
        src: "assets/themes/gold-silver-ratio2.png",
        title: "Gold vs silver: what the ratio measures",
        comment: "The Gold/Silver Ratio indicates relative leadership and market regime; it is not a fixed valuation benchmark. Its average depends on the observation window, fundamentals and the statistical stability of the relationship.",
      },
      {
        src: "assets/themes/commodities-specialized-etfs.png",
        title: "Commodities: specialised ETFs",
        comment: "Beyond the main commodities, there are niches such as platinum, palladium, natural gas, uranium, lithium, rare earths, iron ore, livestock and water. The analysis distinguishes physical exposure, futures and theme-related equities.",
      },
      {
        src: "assets/themes/commodities-sp500-10y.png",
        title: "Commodities and the S&P 500: relative performance",
        layout: "compact",
        comment: "The chart compares commodities, the S&P 500 and CPI on a base-100 logarithmic scale. The central message is that commodities do not move as a single block: correlation, volatility and regime matter more than the asset-class label.",
      },
      {
        src: "assets/themes/commodities-correlation-matrix-2016-2026.png",
        title: "Correlation matrix: commodities and the S&P 500",
        layout: "compact",
        comment: "The matrix shows weekly correlations among gold, silver, oil, copper, agriculture, broad commodities and the S&P 500. It reinforces that diversification depends on relationships among assets, not merely the name of the asset class.",
      },
      {
        src: "assets/themes/rare-earths-strategic-resource.png",
        title: "Rare earths: strategic resources and value-chain concentration",
        layout: "tall",
        comment: "Rare earths are critical inputs for magnets, clean energy, electronics and defence, while mining and especially processing remain highly concentrated in China. Their strategic importance can support a powerful market narrative, but scarcity, policy attention and geopolitical relevance do not by themselves determine investment returns.",
      },
    ],
  },
  {
    key: "ai-stress",
    date: "27/07",
    label: "AI Stress",
    title: "Big Tech, AI and capital stress",
    summary: "AI CAPEX, off-balance-sheet commitments and free cash flow: the risk is real, but it must be separated from narrative exaggeration.",
    tags: ["AI", "CAPEX", "FCF"],
    images: [
      {
        src: "assets/themes/ai-stress-overview.png",
        title: "Big Tech, AI and hidden liabilities",
        comment: "The analysis separates contractual commitments, financial debt and economic risk. The central point is that CAPEX and future obligations increase pressure but do not automatically imply a balance-sheet crisis.",
      },
      {
        src: "assets/themes/ai-stress-google.png",
        title: "Alphabet: negative FCF in Q2 2026",
        comment: "Negative FCF resulted from CAPEX exceeding operating cash generation in the quarter. Operations remained strong; the relevant change is the migration toward a more capital-intensive model.",
      },
      {
        src: "assets/themes/ai-stress-beignet.png",
        title: "Project Beignet: a more aggressive structure",
        comment: "The case illustrates how joint ventures, leases, residual guarantees and special-purpose-entity debt can move part of the formal debt outside the consolidated balance sheet while preserving material economic exposure for Big Tech.",
      },
      {
        src: "assets/themes/ai-stress-fcf-cash.png",
        title: "Big Tech: FCF, cash and AI CAPEX",
        comment: "The comparison shows that CAPEX pressure does not affect every company in the same way. The relevant distinction is among temporary cash burn, aggressive reinvestment and remaining liquidity strength.",
      },
    ],
  },
  {
    key: "global-public-debt",
    date: "27/07",
    label: "Global public debt",
    title: "Global public debt: stock, cost and growth",
    summary: "The analysis shifts the focus from debt-to-GDP to carrying cost: when the implicit interest rate exceeds nominal growth, the nature of fiscal pressure changes.",
    tags: ["Macro", "Debt", "r - g"],
    images: [
      {
        src: "assets/themes/global-public-debt-r-g.png",
        title: "Debt, implicit interest rate and nominal growth",
        comment: "The central point is not only the size of the debt, but the relationship between financing costs and nominal growth. Countries with r below g have more room for stabilisation; when r exceeds g, fiscal adjustment becomes more demanding.",
      },
    ],
  },
  {
    key: "ai-ecosystem",
    date: "20/07",
    label: "AI ecosystem",
    title: "AI and semiconductor ecosystem",
    summary: "An extension of the cycle thesis: gross fixed capital formation, CAPEX, hyperscalers, data centres, chips, memory and physical AI infrastructure.",
    tags: ["AI", "Semiconductors", "Infrastructure"],
    images: [
      {
        src: "assets/themes/ai-capex-fbcf.png",
        title: "Gross fixed capital formation as a starting point",
        comment: "The chart starts with gross fixed capital formation relative to GDP to show when the economy turns narrative into real investment. AI enters this analysis as a new physical-capital cycle: data centres, power, chips and infrastructure before final monetisation in applications.",
      },
      {
        src: "assets/themes/ai-ecosystem.png",
        title: "Architecture of the AI ecosystem",
        comment: "Demand begins in the model and application layer, but flows down to hyperscalers, data-centre operators, servers, chips, foundries and memory.",
      },
      {
        src: "assets/themes/semiconductor-ecosystem.png",
        title: "Semiconductors as a critical value chain",
        comment: "AI depends on a specialised chain: design, IP, manufacturing, advanced packaging, memory and system assembly. It is not only Nvidia.",
      },
    ],
  },
  {
    key: "corporate-revenue",
    date: "26/06",
    label: "US economy",
    title: "Corporate revenue as a portrait of the US economy",
    summary: "The map of the largest US corporate revenues depicts a post-industrial economy: healthcare, online consumption, technology, energy, finance and logistics.",
    tags: ["Revenue", "US", "Sectors"],
    images: [
      {
        src: "assets/themes/us-largest-companies-2025-original.png",
        title: "Corporate revenue as a portrait of the US economy",
        layout: "tall",
        comment: "The chart shows the economic foundation into which new cycles fit: a gradually ageing population, online consumption, healthcare at scale, technology as everyday infrastructure, national logistics, energy and deep financial markets. Data: Fortune via 50Pros; visual reference: Voronoi / Visual Capitalist; original visual.",
      },
    ],
  },
  {
    key: "tech-cycles",
    date: "26/06",
    label: "Technology cycle",
    title: "Technology Cycle Matrix",
    summary: "Railways, electrification, dotcom and AI: CAPEX comes first, followed by excess, selection and concentration of gains.",
    tags: ["AI", "CAPEX", "Semiconductors"],
  },
];

function TechCycleModule() {
  const [selectedCycle, setSelectedCycle] = useState("Railways");
  const cycleDetail = CYCLE_DETAILS[selectedCycle] || CYCLE_DETAILS.Railways;
  const intensity = (entry) =>
    React.createElement("span", { className: `intensity ${entry[1]}` }, entry[0]);

  return React.createElement(
    "main",
    { className: "tech-layout" },
    React.createElement(
      "section",
      { className: "tech-main" },
      React.createElement(
        "article",
        { className: "panel source-card" },
        React.createElement(
          "div",
          { className: "section-head" },
          React.createElement(
            "div",
            null,
            React.createElement("span", { className: "control-title" }, "Cycle matrix"),
            React.createElement("h2", null, "Real innovation does not prevent capital destruction")
          )
        ),
        React.createElement(
          "div",
          { className: "cycle-table-wrap" },
          React.createElement(
            "table",
            { className: "cycle-table" },
            React.createElement(
              "thead",
              null,
              React.createElement(
                "tr",
                null,
                React.createElement("th", null, "Cycle"),
                React.createElement("th", null, "Initial CAPEX"),
                React.createElement("th", null, "Excess / bubble"),
                React.createElement("th", null, "Capital destruction"),
                React.createElement("th", null, "Final winners"),
                React.createElement("th", null, "Lesson for AI")
              )
            ),
            React.createElement(
              "tbody",
              null,
              TECH_CYCLES.map((row) =>
                React.createElement(
                  "tr",
                  { key: row.cycle, className: selectedCycle === row.cycle ? "is-selected" : undefined, onClick: () => setSelectedCycle(row.cycle) },
                  React.createElement("td", null, row.cycle),
                  React.createElement("td", null, intensity(row.capex)),
                  React.createElement("td", null, intensity(row.excess)),
                  React.createElement("td", null, intensity(row.destruction)),
                  React.createElement("td", null, intensity(row.winners)),
                  React.createElement("td", { className: "lesson-cell" }, row.lesson)
                )
              )
            )
          )
        ),
        React.createElement(
          "div",
          { className: "cycle-detail" },
          React.createElement("span", { className: "control-title" }, "Cycle anatomy"),
          React.createElement("h3", null, selectedCycle),
          React.createElement("p", null, cycleDetail.anatomy),
          React.createElement("p", { className: "cycle-lesson" }, `Lesson for AI: ${cycleDetail.lesson}`)
        )
      ),
      React.createElement(
        "article",
        { className: "panel source-card" },
        React.createElement(
          "div",
          { className: "section-head" },
          React.createElement(
            "div",
            null,
            React.createElement("span", { className: "control-title" }, "Economic flow"),
            React.createElement("h2", null, "Capital enters through infrastructure before appearing in final monetisation")
          )
        ),
        React.createElement(
          "div",
          { className: "stack-frame" },
          React.createElement(
            "div",
            { className: "stack-arrow", "aria-label": "Read from infrastructure to monetisation" }
          ),
          React.createElement(
            "div",
            { className: "ai-stack" },
            AI_STACK.map((layer) =>
              React.createElement(
                "div",
                { className: `stack-layer ${layer[2]}`, key: layer[0] },
                React.createElement("strong", null, layer[0]),
                React.createElement("span", null, layer[1]),
                React.createElement("div", { className: "money-tag" }, layer[3])
              )
            )
          )
        )
      )
    ),
    React.createElement(
      "section",
      { className: "panel source-card" },
      React.createElement(
        "div",
        { className: "section-head" },
        React.createElement(
          "div",
          null,
          React.createElement("span", { className: "control-title" }, "Timeline"),
          React.createElement("h2", null, "Where we are in the AI cycle")
        )
      ),
      React.createElement(
        "div",
        { className: "timeline" },
        TECH_TIMELINE.map((step) =>
          React.createElement(
            "div",
            {
              className: `timeline-step ${step[2]}`,
              key: step[0],
              "aria-current": step[2] ? "step" : undefined,
            },
            React.createElement("span", null, step[0]),
            React.createElement("strong", null, step[1])
          )
        )
      ),
      React.createElement(
        "p",
        { className: "timeline-note" },
        "AI is in the zone between accelerating CAPEX and the formation of excess, before the winners have been fully selected."
      )
    ),
    React.createElement(
      "section",
      { className: "panel source-card" },
      React.createElement(
        "div",
        { className: "section-head" },
        React.createElement(
          "div",
          null,
          React.createElement("span", { className: "control-title" }, "Strategic state"),
          React.createElement("h2", null, "Where government appears")
        )
      ),
      React.createElement(
        "div",
        { className: "cycle-table-wrap" },
        React.createElement(
          "table",
          { className: "policy-table" },
          React.createElement(
            "thead",
            null,
            React.createElement(
              "tr",
              null,
              React.createElement("th", null, "Where it appears"),
              React.createElement("th", null, "Example"),
              React.createElement("th", null, "Why it matters")
            )
          ),
          React.createElement(
            "tbody",
            null,
            GOVERNMENT_STACK.map((row) =>
              React.createElement(
                "tr",
                { key: row[0] },
                React.createElement("td", null, row[0]),
                React.createElement("td", null, row[1]),
                React.createElement("td", null, row[2])
              )
            )
          )
        )
      )
    )
  );
}

function ThemesModule() {
  const imageZoomLevels = [0.5, 0.6, 0.8, 1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.5];
  const [selectedTheme, setSelectedTheme] = useState(() => themeFromHash() || THEME_BRIEFINGS[0].key);
  const [expandedImage, setExpandedImage] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);
  const activeTheme = THEME_BRIEFINGS.find((item) => item.key === selectedTheme) || THEME_BRIEFINGS[0];

  useEffect(() => {
    const syncThemeFromHistory = () => {
      const parts = hashParts();
      const nextTheme = parts[0] === "tech" ? parts[1] : null;
      const nextThemeRecord = THEME_BRIEFINGS.find((item) => item.key === nextTheme) || THEME_BRIEFINGS[0];
      setSelectedTheme(nextThemeRecord.key);

      const imageMatch = /^image-(\d+)$/.exec(parts[2] || "");
      const imageIndex = imageMatch ? Number(imageMatch[1]) : -1;
      setExpandedImage(nextThemeRecord.images?.[imageIndex] || null);
      setImageZoom(1);
    };

    window.addEventListener("popstate", syncThemeFromHistory);
    return () => window.removeEventListener("popstate", syncThemeFromHistory);
  }, []);

  useEffect(() => {
    if (!expandedImage) return undefined;

    const body = document.body;
    const root = document.documentElement;
    const previousBodyStyles = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };
    const previousRootOverflow = root.style.overflow;
    const scrollbarWidth = window.innerWidth - root.clientWidth;

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyStyles.overflow;
      body.style.paddingRight = previousBodyStyles.paddingRight;
    };
  }, [expandedImage]);

  const selectTheme = (key) => {
    setSelectedTheme(key);
    setExpandedImage(null);
    setImageZoom(1);
    window.history.pushState({ module: "tech", theme: key }, "", `#tech/${key}`);
  };

  const openImage = (image, index) => {
    setExpandedImage(image);
    setImageZoom(1);
    window.history.pushState({ module: "tech", theme: activeTheme.key, image: index }, "", `#tech/${activeTheme.key}/image-${index}`);
  };

  const closeImage = () => {
    if (hashParts()[2]?.startsWith("image-")) {
      window.history.back();
      return;
    }
    setExpandedImage(null);
    setImageZoom(1);
  };

  const adjustImageZoom = (direction) => {
    setImageZoom((value) => {
      const currentIndex = imageZoomLevels.findIndex((level) => Math.abs(level - value) < 0.001);
      const nextIndex = Math.min(
        imageZoomLevels.length - 1,
        Math.max(0, currentIndex + direction)
      );
      return imageZoomLevels[nextIndex];
    });
  };

  return React.createElement(
    React.Fragment,
      null,
      React.createElement(
        "main",
        { className: "themes-layout" },
        React.createElement(
          "aside",
          { className: "panel themes-feed" },
          React.createElement(
            "div",
            { className: "section-head" },
            React.createElement(
              "div",
              null,
              React.createElement("span", { className: "control-title" }, "Library"),
              React.createElement("h2", null, "Thematic pages")
            )
          ),
          THEME_BRIEFINGS.map((item) =>
            React.createElement(
              "button",
              {
                className: "theme-news-card",
                type: "button",
                key: item.key,
                "aria-pressed": activeTheme.key === item.key,
                onClick: () => selectTheme(item.key),
              },
              React.createElement("small", null, item.date),
              React.createElement("h3", null, item.title),
              React.createElement("p", null, item.summary),
              React.createElement(
                "div",
                { className: "theme-news-meta" },
                item.tags.map((tag) => React.createElement("span", { key: tag }, tag))
              )
            )
          )
        ),
        React.createElement(
          "section",
          { className: "themes-preview" },
          React.createElement(
            "article",
            { className: "panel themes-preview-head" },
            React.createElement("span", { className: "control-title" }, activeTheme.label),
            React.createElement("h2", null, activeTheme.title),
            React.createElement("p", null, activeTheme.summary),
            activeTheme.pdf
              ? React.createElement(
                  "div",
                  { className: "theme-file-actions" },
                  React.createElement(
                    "a",
                    { href: activeTheme.pdf.href, target: "_blank", rel: "noreferrer" },
                    activeTheme.pdf.label
                  )
                )
              : null
          ),
          activeTheme.images
            ? React.createElement(
                "div",
                { className: "theme-image-gallery" },
                activeTheme.images.map((image, index) =>
                  React.createElement(
                    "button",
                    {
                      className: `panel theme-image-card ${image.layout === "tall" ? "is-tall" : ""} ${image.layout === "compact" ? "is-compact" : ""}`,
                      key: image.src,
                      type: "button",
                      onClick: () => openImage(image, index),
                    },
                    React.createElement("img", { src: image.src, alt: image.title }),
                    React.createElement(
                      "div",
                      { className: "theme-image-caption" },
                      React.createElement("strong", null, image.title),
                      React.createElement("p", null, image.comment)
                    )
                  )
                )
              )
            : null,
          activeTheme.key === "tech-cycles" ? React.createElement(TechCycleModule) : null
        )
      ),
      expandedImage
        ? React.createElement(
            "div",
            { className: "image-lightbox", role: "dialog", "aria-modal": true, onClick: closeImage },
            React.createElement(
              "div",
              { className: "image-lightbox-inner", onClick: (event) => event.stopPropagation() },
              React.createElement(
                "div",
                { className: "image-lightbox-stage" },
                React.createElement("img", {
                  src: expandedImage.src,
                  alt: expandedImage.title,
                  "data-zoomed": imageZoom > 1,
                  style: { width: `${imageZoom * 100}%` },
                })
              ),
              React.createElement(
                "div",
                { className: "image-lightbox-caption" },
                React.createElement(
                  "div",
                  null,
                  React.createElement("strong", null, expandedImage.title),
                  React.createElement("span", null, expandedImage.comment)
                ),
                React.createElement(
                  "div",
                  { className: "image-lightbox-actions" },
                  React.createElement(
                    "div",
                    { className: "image-zoom-controls", "aria-label": "Image zoom controls" },
                    React.createElement("button", { type: "button", onClick: () => adjustImageZoom(-1), disabled: imageZoom <= 0.5 }, "-"),
                    React.createElement("span", null, `${Math.round(imageZoom * 100)}%`),
                    React.createElement("button", { type: "button", onClick: () => adjustImageZoom(1), disabled: imageZoom >= 2.5 }, "+"),
                    React.createElement("button", { type: "button", onClick: () => setImageZoom(1) }, "100%")
                  ),
                  React.createElement("button", { type: "button", onClick: closeImage }, "Close")
                )
              )
            )
          )
        : null
  );
}


window.GCThemes = {
  ThemesModule,
};
})();
