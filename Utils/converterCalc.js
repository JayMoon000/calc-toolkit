/**
 * 다목적 단위 환산 엔진 (Zero-dependency Pure Function)
 */
const UnitConverter = {
  // 선형 배율 기반 변환 (m, pyeong, kg, lb 등)
  convertRatio(val, fromUnit, toUnit, rates) {
    if (isNaN(val) || val === null) return 0;
    const fromRate = rates[fromUnit];
    const toRate = rates[toUnit];
    if (!fromRate || !toRate) return 0;

    const baseVal = val * fromRate;
    const result = baseVal / toRate;
    return Number(result.toFixed(6));
  },

  // 온도 환산 (C, F, K)
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
  }
};

// [단위 테스트 검증 블록]
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.endsWith('converterCalc.js')) {
  const areaRates = { m2: 1, pyeong: 3.305785 };
  // 84㎡ -> 평수 검증 (약 25.41평)
  const pyeong = UnitConverter.convertRatio(84, 'm2', 'pyeong', areaRates);
  console.assert(Math.abs(pyeong - 25.41) < 0.05, '면적 변환 오차 발생');

  // 화씨 100도 -> 섭씨 37.78도 검증
  const c = UnitConverter.convertTemperature(100, 'F', 'C');
  console.assert(c === 37.78, '온도 변환 오차 발생');
  console.log('✔ 단위 변환기 순수 연산 엔진 단위 검증 통과');
}