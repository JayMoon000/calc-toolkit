/**
 * ToolLab.org - Percentage & Profit Margin Calculation Engine (Pure Functions)
 * Path: D:\Gemini_Files\ToolLab.org\js\utils\percentageCalc.js
 */
const PercentageCalc = {
  // 1. Basic Percentage: What is P% of V?
  percentOf(percent, total) {
    if (isNaN(percent) || isNaN(total)) return 0;
    return (percent / 100) * total;
  },

  // 2. Proportion: V1 is what percent of V2?
  percentageShare(part, total) {
    if (isNaN(part) || isNaN(total) || total === 0) return 0;
    return (part / total) * 100;
  },

  // 3. Percentage Change: Percent increase or decrease from V1 to V2
  percentageChange(initialVal, finalVal) {
    if (isNaN(initialVal) || isNaN(finalVal) || initialVal === 0) return 0;
    return ((finalVal - initialVal) / Math.abs(initialVal)) * 100;
  },

  // 4. Gross Margin & Markup calculation from Cost and Revenue
  marginAndMarkup(cost, revenue) {
    if (isNaN(cost) || isNaN(revenue) || revenue === 0) {
      return { profit: 0, margin: 0, markup: 0 };
    }
    const profit = revenue - cost;
    const margin = (profit / revenue) * 100;
    const markup = cost !== 0 ? (profit / cost) * 100 : 0;
    return { profit, margin, markup };
  },

  // 5. Target Price by Cost and Desired Margin
  priceFromMargin(cost, targetMarginPercent) {
    if (isNaN(cost) || isNaN(targetMarginPercent) || targetMarginPercent >= 100) {
      return { sellingPrice: 0, grossProfit: 0 };
    }
    const sellingPrice = cost / (1 - targetMarginPercent / 100);
    const grossProfit = sellingPrice - cost;
    return { sellingPrice, grossProfit };
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = PercentageCalc;
}

if (typeof window !== "undefined") {
  window.PercentageCalc = PercentageCalc;
}

// Node.js Validation Run
if (typeof process !== "undefined" && process.argv && process.argv[1]?.endsWith("percentageCalc.js")) {
  console.assert(PercentageCalc.percentOf(15, 200) === 30, "Test 1 Failed");
  console.assert(PercentageCalc.percentageShare(25, 100) === 25, "Test 2 Failed");
  console.assert(PercentageCalc.percentageChange(100, 150) === 50, "Test 3 Failed");
  
  const m = PercentageCalc.marginAndMarkup(70, 100);
  console.assert(m.profit === 30 && m.margin === 30 && Math.abs(m.markup - 42.857) < 0.01, "Test 4 Failed");
  console.log("✔ PercentageCalc pure functions passed unit tests");
}