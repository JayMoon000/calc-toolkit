/**
 * 퇴직금 및 퇴직소득세 산출 엔진 (Zero-dependency Pure Function)
 */
const SeveranceCalculator = {
  // 기본 법정 퇴직금 산출: 1일 평균임금 * 30일 * (재직일수 / 365)
  calculateStatutorySeverance(avgDailyWage, totalDays) {
    if (totalDays < 365 || avgDailyWage <= 0) return 0;
    return Math.floor(avgDailyWage * 30 * (totalDays / 365));
  },

  // 근속연수 계산 (1년 미만 절상 원칙)
  getServiceYears(totalDays) {
    return Math.max(1, Math.ceil(totalDays / 365));
  },

  // 근속연수공제 산출 (2026년 기준)
  getServiceYearDeduction(years, rules) {
    if (years <= 5) return years * 1000000;
    if (years <= 10) return 5000000 + (years - 5) * 2000000;
    if (years <= 20) return 15000000 + (years - 10) * 2500000;
    return 40000000 + (years - 20) * 3000000;
  },

  // 환산급여 공제 산출
  getConvertedSalaryDeduction(convertedSalary) {
    if (convertedSalary <= 8000000) return convertedSalary;
    if (convertedSalary <= 70000000) return 8000000 + (convertedSalary - 8000000) * 0.6;
    if (convertedSalary <= 100000000) return 45200000 + (convertedSalary - 70000000) * 0.55;
    if (convertedSalary <= 300000000) return 61700000 + (convertedSalary - 100000000) * 0.45;
    return 151700000 + (convertedSalary - 300000000) * 0.35;
  },

  // 기본세율 적용
  calculateTaxByBrackets(taxBase, brackets) {
    const bracket = brackets.find(b => taxBase <= b.limit);
    return Math.floor(taxBase * bracket.rate - bracket.quickDeduction);
  },

  // 최종 종합 연산
  calculateFull(severanceAmount, serviceYears, config) {
    if (severanceAmount <= 0) {
      return { severanceAmount: 0, totalTax: 0, netPay: 0, effectiveTaxRate: 0 };
    }

    // 1. 근속연수공제
    const serviceDeduction = this.getServiceYearDeduction(serviceYears, config.serviceYearDeduction);
    const afterServiceDeduction = Math.max(0, severanceAmount - serviceDeduction);

    // 2. 환산급여: (퇴직소득공제 후 금액 / 근속연수) * 12
    const convertedSalary = Math.floor((afterServiceDeduction / serviceYears) * 12);

    // 3. 환산급여공제
    const convertedDeduction = this.getConvertedSalaryDeduction(convertedSalary);

    // 4. 퇴직소득 과세표준
    const taxBase = Math.max(0, convertedSalary - convertedDeduction);

    // 5. 환산산출세액
    const convertedTax = this.calculateTaxByBrackets(taxBase, config.incomeTaxBrackets);

    // 6. 퇴직소득 산출세액: (환산산출세액 / 12) * 근속연수
    const calculatedTax = Math.max(0, Math.floor((convertedTax / 12) * serviceYears));

    // 7. 지방소득세(10%) 포함 총 세금
    const localTax = Math.floor(calculatedTax * config.localTaxRate);
    const totalTax = calculatedTax + localTax;
    const netPay = severanceAmount - totalTax;
    const effectiveTaxRate = Number(((totalTax / severanceAmount) * 100).toFixed(2));

    return {
      severanceAmount,
      serviceYears,
      serviceDeduction,
      taxBase,
      calculatedTax,
      localTax,
      totalTax,
      netPay,
      effectiveTaxRate
    };
  }
};

// [단독 실행 및 검증 케이스]
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.endsWith('severanceCalc.js')) {
  const sampleConfig = {
    incomeTaxBrackets: [
      { limit: 14000000, rate: 0.06, quickDeduction: 0 },
      { limit: 50000000, rate: 0.15, quickDeduction: 1260000 },
      { limit: 88000000, rate: 0.24, quickDeduction: 5760000 },
      { limit: Infinity, rate: 0.35, quickDeduction: 15440000 }
    ],
    localTaxRate: 0.1
  };

  // 테스트: 10년 근속, 퇴직금 5,000만 원 케이스
  const res = SeveranceCalculator.calculateFull(50000000, 10, sampleConfig);
  console.assert(res.netPay > 48000000, '퇴직금 실수령액 연산 오차 발생');
  console.log('✔ 퇴직금 & 퇴직소득세 순수 연산 엔진 검증 완료');
}