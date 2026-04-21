# StockPredict Prediction Model (User-Friendly Guide)

This document explains **how StockPredict creates its prediction score**, what each visual uses as data, and why the output is intended to be transparent and trustworthy.

---

## 1) What the prediction score means

StockPredict produces a score from **0 to 100**.

- **75–100**: Strong Buy
- **60–74**: Buy
- **41–59**: Hold
- **26–40**: Sell
- **0–25**: Strong Sell

The score is a **heuristic signal** (decision support), not financial advice.

---

## 2) Current scoring logic (simple and explainable)

The score combines two interpretable factors:

1. **Momentum factor** (from daily % move)  
   - Uses capped daily change percent to avoid outlier distortion.
2. **Valuation factor** (from P/E ratio)  
   - Rewards lower P/E relative to a neutral anchor and penalizes extreme expensive values.

Then the model clamps to a 0–100 range.

Implementation location:
- `server/index.js` (`calculatePrediction`)

This approach is intentionally transparent and lightweight so users can inspect it directly in code.

---

## 3) Data source map for each major visual

## Dashboard cards
- **Price / change / volume / market cap / P/E**
  - Primary source: **Finnhub** quote/profile/metric endpoints.
  - Fallback behavior: cached snapshots on weekends; stale-cache serve on transient errors.

## Chart tab
- Primary source: **Finnhub candles** (`/stock/candle`).
- Fallback source: **Yahoo Finance chart API** if Finnhub has no chart points for that symbol/range.
- Tooltip displays date + open/high/low/close in a readable currency format.

## Financials tab
- Primary source: **Finnhub financial filings** (`/stock/financials-reported`).
- Fallback source: **Yahoo Finance quote summary** (TTM fields) for sparse-coverage symbols.

## Analyst tab
- Primary source: **Finnhub recommendations + price targets**.
- Fallback source: **Yahoo Finance target fields** when Finnhub target coverage is missing.

## News tab
- Source: **Finnhub company news**.

---

## 4) Why users can trust the output

1. **Traceable sources**  
   Data comes from established market data providers (Finnhub, Yahoo Finance fallback) and users can cross-check via Yahoo/Google links in the UI.

2. **Visible source metadata**  
   The app surfaces provider/fallback information in detail responses.

3. **Deterministic score logic**  
   The score formula is not a black box; it is human-readable in backend code.

4. **Caching and weekend snapshot policy**  
   Reduces API instability and avoids unnecessary refresh churn when markets are closed.

---

## 5) Important limitations

- This is **not** an execution algorithm or licensed investment advisory system.
- Coverage may vary by ticker (especially very new or less-liquid instruments).
- Fallback data can improve completeness but may still omit some fields for edge cases.

---

## 6) Research and practitioner references

The current model is deliberately simple, but it is conceptually aligned with well-known finance ideas:

1. **Fama, Eugene F., and Kenneth R. French (1992)**  
   *The Cross-Section of Expected Stock Returns.*  
   Journal of Finance, 47(2), 427–465.  
   (Foundational evidence around valuation-related factors.)

2. **Jegadeesh, Narasimhan, and Sheridan Titman (1993)**  
   *Returns to Buying Winners and Selling Losers: Implications for Stock Market Efficiency.*  
   Journal of Finance, 48(1), 65–91.  
   (Classic momentum evidence.)

3. **Asness, Clifford S., Tobias J. Moskowitz, and Lasse H. Pedersen (2013)**  
   *Value and Momentum Everywhere.*  
   Journal of Finance, 68(3), 929–985.  
   (Broader empirical support for value + momentum style signals.)

These references do **not** mean StockPredict reproduces those papers’ full econometric frameworks. They are included to explain the academic intuition behind using valuation + momentum style components.
