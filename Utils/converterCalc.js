/**
 * 단위 변환 순수 연산 모듈 (Zero-dependency)
 */
const UnitConverter = {
  /**
   * 단위 변환 함수
   * @param {number} value - 변환 대상 수치
   * @param {string} category - area | length | weight | volume
   * @param {string} fromUnit - 출발 단위 키
   * @param {string} toUnit - 도착 단위 키
   * @param {object} unitsConfig - rates.json의 units 객체
   */
  convert(value, category, fromUnit, toUnit, unitsConfig) {
    if (isNaN(value) || value === null || value === '') {
      return 0;
    }
    const catData = unitsConfig[category];
    if (!catData) throw new Error(`존재하지 않는 카테고리: ${category}`);

    const fromRatio = catData.rates[fromUnit]?.ratio;
    const toRatio = catData.rates[toUnit]?.ratio;

    if (!fromRatio || !toRatio) throw new Error('유효하지 않은 단위 키입니다.');

    // 1단계: 기준 단위(baseUnit)로 표준화
    const baseValue = value / fromRatio;
    // 2단계: 목표 단위로 변환
    const convertedValue = baseValue * toRatio;

    // 소수점 6자리 반올림 (부동소수점 오차 정돈)
    return parseFloat(convertedValue.toFixed(6));
  },

  /**
   * 해당 카테고리의 모든 단위 변환 결과를 일괄 산출
   */
  convertAll(value, category, fromUnit, unitsConfig) {
    const catData = unitsConfig[category];
    const results = {};
    for (const [unitKey, unitInfo] of Object.entries(catData.rates)) {
      results[unitKey] = {
        label: unitInfo.label,
        value: this.convert(value, category, fromUnit, unitKey, unitsConfig)
      };
    }
    return results;
  }
};

// [단위 테스트 검증 블록: Node.js 단독 실행 시]
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.endsWith('converterCalc.js')) {
  const mockUnits = {
    area: {
      rates: {
        m2: { ratio: 1.0 },
        pyeong: { ratio: 0.3025 }
      }
    }
  };

  // 84㎡ -> 평 변환 (84 * 0.3025 = 25.41평)
  const test1 = UnitConverter.convert(84, 'area', 'm2', 'pyeong', mockUnits);
  console.assert(test1 === 25.41, '84㎡ 평수 변환 실패');
  console.log('✔ 단위 테스트 통과: 84㎡ =', test1, '평');
}