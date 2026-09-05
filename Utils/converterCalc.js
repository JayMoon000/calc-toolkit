/**
 * 다목적 단위 환산 엔진 (Zero-dependency)
 */
const UnitConverter = {
  /**
   * 일반 비율 기반 단위 변환
   */
  convertRatio(val, fromUnit, toUnit, rates) {
    if (isNaN(val) || val === null) return 0;
    const fromRate = rates[fromUnit];
    const toRate = rates[toUnit];
    if (!fromRate || !toRate) return 0;

    // 기준(Base) 단위 환산 후 대상 단위로 변환
    const baseValue = val * fromRate;
    const converted = baseValue / toRate;
    return Number(converted.toFixed(6));
  },

  /**
   * 온도 변환 (섭씨, 화씨, 켈빈)
   */
  convertTemperature(val, fromUnit, toUnit) {
    if (isNaN(val)) return 0;
    let celsius = 0;

    if (fromUnit === 'C') celsius = val;
    else if (fromUnit === 'F') celsius = (val - 32) * (5 / 9);
    else if (fromUnit === 'K') celsius = val - 273.15;

    let result = celsius;
    if (toUnit === 'C') result = celsius;
    else if (toUnit === 'F') result = celsius * (9 / 5) + 32;
    else if (toUnit === 'K') result = celsius + 273.15;

    return Number(result.toFixed(2));
  },

  /**
   * 카테고리 통합 디스패처
   */
  convert(category, val, fromUnit, toUnit, ratesConfig) {
    if (category === 'temperature') {
      return this.convertTemperature(val, fromUnit, toUnit);
    }
    const catData = ratesConfig.categories[category];
    if (!catData) return 0;
    return this.convertRatio(val, fromUnit, toUnit, catData.rates);
  }
};

// [단위 테스트 검증 블록]
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.endsWith('converterCalc.js')) {
  const mockConfig = {
    categories: {
      area: { rates: { m2: 1, pyeong: 3.305785, sqft: 0.092903 } },
      length: { rates: { m: 1, ft: 0.3048, in: 0.0254 } }
    }
  };

  // 1. 34평 -> m2 검증
  const m2Result = UnitConverter.convert('area', 34, 'pyeong', 'm2', mockConfig);
  console.assert(Math.round(m2Result) === 112, '평 -> m2 환산 실패');

  // 2. 6피트 -> m 검증
  const ftResult = UnitConverter.convert('length', 6, 'ft', 'm', mockConfig);
  console.assert(ftResult === 1.8288, '피트 -> m 환산 실패');

  // 3. 화씨 100도 -> 섭씨 검증
  const tempResult = UnitConverter.convertTemperature(100, 'F', 'C');
  console.assert(tempResult === 37.78, '화씨 -> 섭씨 환산 실패');

  console.log('✔ 단위 변환기 핵심 알고리즘 3종 검증 통과');
}