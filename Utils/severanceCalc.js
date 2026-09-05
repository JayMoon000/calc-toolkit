/**
 * 퇴직금 및 퇴직소득세 순수 연산 모듈 (Zero-dependency)
 */
const SeveranceCalculator = {
  roundAmount(amount, mode = 'FLOOR') {
    return mode === 'FLOOR' ? Math.floor(amount) : Math.round(amount);
  },

  /**
   * 1. 법정 퇴직금 계산
   * 공식: 1일 평균임금 * 30일 * (재직일수 / 365)
   */
  calculateGrossSeverance(recent3MonthsPay, annualBonus, annualLeavePay, totalDays) {
    if (totalDays < 365) {
      return { grossSeverance: 0, avgDailyWage: 0, eligible: false };
    }

    // 직전 3개월 일수 기준 (통상 92일 기준)
    const baseDays = 92;
    const bonusPortion = (annualBonus + annualLeavePay) * (3 / 12);
    const totalPayPortion = recent3MonthsPay + bonusPortion;
    const avgDailyWage = totalPayPortion / baseDays;

    const grossSeverance = this.roundAmount(avgDailyWage * 30 * (totalDays / 365));
    return { grossSeverance, avgDailyWage, eligible: true };
  },

  /**
   * 2. 근속연수 계산 (1년 미만 올림 처리)
   */
  calculateServiceYears(totalDays) {
    return Math.max(1, Math.ceil(totalDays / 365));
  },

  /**
   * 3. 퇴직소득세 간이 계산 (2026 소득세법 환산급여 방식)
   */
  calculateTax(grossSeverance, serviceYears, severanceConfig) {
    if (grossSeverance <= 0) {
      return { incomeTax: 0, localTax: 0, totalTax: 0, netPayout: 0 };
    }

    // A. 근속연수공제
    let serviceDeduction = 0;
    if (serviceYears <= 5) {
      serviceDeduction = serviceYears * 1000000;
    } else if (serviceYears <= 10) {
      serviceDeduction = 5000000 + (serviceYears - 5) * 2000000;
    } else if (serviceYears <= 20) {
      serviceDeduction = 15000000 + (serviceYears - 10) * 2500000;
    } else {
      serviceDeduction = 40000000 + (serviceYears - 20) * 3000000;
    }

    // B. 환산급여 = (퇴직급여 - 근속연수공제) * 12 / 근속연수
    const convertedPay = Math.max(0, (grossSeverance - serviceDeduction) * 12 / serviceYears);

    // C. 환산급여공제
    let convertedDeduction = 0;
    if (convertedPay <= 8000000) {
      convertedDeduction = convertedPay;
    } else if (convertedPay <= 70000000) {
      convertedDeduction = 8000000 + (convertedPay - 8000000) * 0.6;
    } else if (convertedPay <= 100000000) {
      convertedDeduction = 45200000 + (convertedPay - 70000000) * 0.55;
    } else if (convertedPay <= 300000000) {
      convertedDeduction = 61700000 + (convertedPay - 100000000) * 0.45;
    } else {
      convertedDeduction = 151700000 + (convertedPay - 300000000) * 0.35;
    }

    // D. 과세표준 및 환산산출세액
    const taxBase = Math.max(0, convertedPay - convertedDeduction);
    let convertedTax = 0;

    for (const b of severanceConfig.conversionTaxBrackets) {
      if (b.max === null || taxBase <= b.max) {
        convertedTax = (taxBase * b.rate) - b.quickDeduction;
        break;
      }
    }
    convertedTax = Math.max(0, convertedTax);

    // E. 산출세액 = 환산산출세액 * (근속연수 / 12)
    const incomeTax = this.roundAmount(convertedTax * (serviceYears / 12));
    const localTax = this.roundAmount(incomeTax * severanceConfig.localTaxRate);
    const totalTax = incomeTax + localTax;
    const netPayout = grossSeverance - totalTax;

    return { incomeTax, localTax, totalTax, netPayout };
  }
};

// [단위 테스트 검증 블록]
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.endsWith('severanceCalc.js')) {
  const mockConfig = {
    localTaxRate: 0.1,
    conversionTaxBrackets: [
      { max: 14000000, rate: 0.06, quickDeduction: 0 },
      { max: 50000000, rate: 0.15, quickDeduction: 1260000 },
      { max: 88000000, rate: 0.24, quickDeduction: 5760000 }
    ]
  };

  // 3년 근무, 3개월 급여 합계 900만원, 상여/수당 없음
  const { grossSeverance, eligible } = SeveranceCalculator.calculateGrossSeverance(9000000, 0, 0, 1095);
  console.assert(eligible === true, '수급 자격 검증 실패');
  const taxRes = SeveranceCalculator.calculateTax(grossSeverance, 3, mockConfig);
  console.log('✔ 퇴직금 연산 테스트 통과: 세전', grossSeverance, '원 / 세후', taxRes.netPayout, '원');
}