/**
 * ToolLab.org - Universal Unit Conversion Engine (Zero-dependency Pure Function)
 * Path: D:\Gemini_Files\ToolLab.org\js\utils\unitConverter.js
 */
const UNIT_DATA = {
  area: {
    labels: {
      sqft: "Square Feet (sq ft)",
      sqm: "Square Meters (m²)",
      sqin: "Square Inches (sq in)",
      sqyd: "Square Yards (sq yd)",
      acre: "Acres (ac)",
      hectare: "Hectares (ha)",
      sqkm: "Square Kilometers (km²)",
      sqmi: "Square Miles (sq mi)"
    },
    rates: {
      sqm: 1,
      sqft: 0.09290304,
      sqin: 0.00064516,
      sqyd: 0.83612736,
      acre: 4046.8564224,
      hectare: 10000,
      sqkm: 1000000,
      sqmi: 2589988.110336
    },
    defaultFrom: "sqft",
    defaultTo: "sqm",
    defaultVal: 1000
  },
  length: {
    labels: {
      m: "Meters (m)",
      cm: "Centimeters (cm)",
      mm: "Millimeters (mm)",
      inch: "Inches (in)",
      ft: "Feet (ft)",
      yd: "Yards (yd)",
      km: "Kilometers (km)",
      mi: "Miles (mi)"
    },
    rates: {
      m: 1,
      cm: 0.01,
      mm: 0.001,
      inch: 0.0254,
      ft: 0.3048,
      yd: 0.9144,
      km: 1000,
      mi: 1609.344
    },
    defaultFrom: "ft",
    defaultTo: "m",
    defaultVal: 6
  },
  weight: {
    labels: {
      kg: "Kilograms (kg)",
      g: "Grams (g)",
      mg: "Milligrams (mg)",
      lb: "Pounds (lb)",
      oz: "Ounces (oz)",
      st: "Stones (st)",
      ton: "Metric Tons (t)"
    },
    rates: {
      kg: 1,
      g: 0.001,
      mg: 0.000001,
      lb: 0.45359237,
      oz: 0.028349523125,
      st: 6.35029318,
      ton: 1000
    },
    defaultFrom: "lb",
    defaultTo: "kg",
    defaultVal: 150
  },
  volume: {
    labels: {
      l: "Liters (L)",
      ml: "Milliliters (mL)",
      gal_us: "Gallons (US liquid)",
      qt_us: "Quarts (US liquid)",
      pt_us: "Pints (US liquid)",
      floz_us: "Fluid Ounces (US fl oz)",
      cuft: "Cubic Feet (ft³)",
      cum: "Cubic Meters (m³)"
    },
    rates: {
      l: 1,
      ml: 0.001,
      gal_us: 3.785411784,
      qt_us: 0.946352946,
      pt_us: 0.473176473,
      floz_us: 0.0295735295625,
      cuft: 28.316846592,
      cum: 1000
    },
    defaultFrom: "gal_us",
    defaultTo: "l",
    defaultVal: 5
  },
  temperature: {
    labels: {
      F: "Fahrenheit (°F)",
      C: "Celsius (°C)",
      K: "Kelvin (K)"
    },
    defaultFrom: "F",
    defaultTo: "C",
    defaultVal: 72
  }
};

const UnitConverter = {
  convertRatio(val, fromUnit, toUnit, rates) {
    if (isNaN(val) || val === null) return 0;
    const fromRate = rates[fromUnit];
    const toRate = rates[toUnit];
    if (!fromRate || !toRate) return 0;

    const baseVal = val * fromRate;
    return baseVal / toRate;
  },

  convertTemperature(val, fromUnit, toUnit) {
    if (isNaN(val) || val === null) return 0;
    let celsius = 0;
    if (fromUnit === "C") celsius = val;
    else if (fromUnit === "F") celsius = (val - 32) * (5 / 9);
    else if (fromUnit === "K") celsius = val - 273.15;

    let result = celsius;
    if (toUnit === "C") result = celsius;
    else if (toUnit === "F") result = celsius * (9 / 5) + 32;
    else if (toUnit === "K") result = celsius + 273.15;

    return result;
  },

  convert(cat, val, fromUnit, toUnit) {
    if (cat === "temperature") {
      return this.convertTemperature(val, fromUnit, toUnit);
    }
    const rates = UNIT_DATA[cat]?.rates;
    if (!rates) return 0;
    return this.convertRatio(val, fromUnit, toUnit, rates);
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { UnitConverter, UNIT_DATA };
}

if (typeof window !== "undefined") {
  window.UnitConverter = UnitConverter;
  window.UNIT_DATA = UNIT_DATA;
}

if (typeof process !== "undefined" && process.argv && process.argv[1]?.endsWith("unitConverter.js")) {
  const sqftToSqm = UnitConverter.convert("area", 1000, "sqft", "sqm");
  console.assert(Math.abs(sqftToSqm - 92.903) < 0.01, "Area conversion test failed");

  const fToC = UnitConverter.convert("temperature", 72, "F", "C");
  console.assert(Math.abs(fToC - 22.22) < 0.05, "Temperature conversion test failed");
  console.log("✔ UnitConverter pure engine validation passed");
}