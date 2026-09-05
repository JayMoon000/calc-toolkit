/**
 * 근로소득 4대보험 및 실수령액 순수 연산 모듈 (Zero-dependency)
 */
const SalaryCalculator = {
  roundAmount(amount, mode = 'FLOOR') {
    return mode === 'FLOOR' ? Math.floor(amount) : Math.round(amount);
  },

  /**
   * 월 급여 실수령액 계산
   * @param {number} annualSalary - 연봉 (원)
   * @param {number} nonTaxableMonthly - 월 비과세액 (기본 식대 20만원 등)
   * @param {number} dependents - 부양가족 수 (본인 포함)
   * @param {object} config - rates.json의 salary 설정 객체
   */
  calculateMonthly(annualSalary, nonTaxableMonthly, dependents = 1, config) {
    const monthlyGross = this.roundAmount(annualSalary / 12);
    const taxableIncome = Math.max(0, monthlyGross - nonTaxableMonthly);

    // 1. 국민연금 (상·하한액 적용, 근로자 부담분 4.5%)
    let pensionBase = Math.max(config.nationalPension.minMonthlyIncome, taxableIncome);
    pensionBase = Math.min(config.nationalPension.maxMonthlyIncome, pensionBase);
    const nationalPension = this.roundAmount(pensionBase * config.nationalPension.rate);

    // 2. 건강보험 (근로자 부담분 3.545%)
    const healthInsurance = this.roundAmount(taxableIncome * config.healthInsurance.rate);

    // 3. 장기요양보험 (건강보험료의 12.95%)
    const longTermCare = this.roundAmount(healthInsurance * config.longTermCare.rateOnHealth);

    // 4. 고용보험 (근로자 부담분 0.9%)
    const employmentInsurance = this.roundAmount(taxableIncome * config.employmentInsurance.rate);

    // 5. 4대보험 합계
    const totalInsurance = nationalPension + healthInsurance + longTermCare + employmentInsurance;

    // 6. 근로소득세 (국세청 간이세액표 근사 다항식 로직)
    const incomeTax = this.estimateIncomeTax(taxableIncome, dependents);
    const localIncomeTax = this.roundAmount(incomeTax * config.localIncomeTaxRate);
    const totalTax = incomeTax + localIncomeTax;

    // 7. 총 공제액 및 세후 월 실수령액
    const totalDeductions = totalInsurance + totalTax;
    const netMonthlyPay = monthlyGross - totalDeductions;

    return {
      annualSalary,
      monthlyGross,
      nonTaxableMonthly,
      deductions: {
        nationalPension,
        healthInsurance,
        longTermCare,
        employmentInsurance,
        totalInsurance,
        incomeTax,
        localIncomeTax,
        totalTax,
        totalDeductions
      },
      netMonthlyPay,
      netAnnualPay: netMonthlyPay * 12
    };
  },

  /**
   * 근로소득세 간이세액 근사치 산출 함수
   */
  estimateIncomeTax(taxable, dependents = 1) {
    if (taxable <= 1060000) return 0;
    
    // 간이 과세표준 환산 (부양가족 기본 공제 1인당 완화)
    const adjusted = Math.max(0, taxable - (dependents - 1) * 100000);
    let tax = 0;

    if (adjusted <= 3000000) {
      tax = (adjusted - 1060000) * 0.04;
    } else if (adjusted <= 5000000) {
      tax = 77600 + (adjusted - 3000000) * 0.12;
    } else if (adjusted <= 8000000) {
      tax = 317600 + (adjusted - 5000000) * 0.20;
    } else {
      tax = 917600 + (adjusted - 8000000) * 0.30;
    }

    return this.roundAmount(Math.max(0, tax));
  }
};

// [단위 테스트 검증 블록]
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.endsWith('salaryCalc.js')) {
  const mockSalaryConfig = {
    nationalPension: { rate: 0.045, minMonthlyIncome: 390000, maxMonthlyIncome: 6170000 },
    healthInsurance: { rate: 0.03545 },
    longTermCare: { rateOnHealth: 0.1295 },
    employmentInsurance: { rate: 0.009 },
    localIncomeTaxRate: 0.1
  };

  // 연봉 4,800만 원 (월 400만 원, 비과세 20만 원, 본인 1인)
  const res = SalaryCalculator.calculateMonthly(48000000, 200000, 1, mockSalaryConfig);
  console.assert(res.monthlyGross === 4000000, '월 기본급 계산 실패');
  console.assert(res.deductions.totalInsurance > 0, '4대보험 연산 실패');
  console.log('✔ 연봉 4,800만 원 테스트 통과: 세후 월', res.netMonthlyPay.toLocaleString(), '원 수령');
}