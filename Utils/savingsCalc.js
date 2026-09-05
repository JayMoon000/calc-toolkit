/**
 * 예·적금 만기 이자 및 세후 수령액 순수 연산 모듈 (Zero-dependency)
 */
const Calculator = {
  // 금액 절사 처리 (국내 세법 원칙: 원 단위 미만 절사)
  roundAmount(amount, mode = 'FLOOR') {
    return mode === 'FLOOR' ? Math.floor(amount) : Math.round(amount);
  },

  // 1. 정기예금 (단리)
  depositSimple(principal, annualRate, periodMonths, taxType, ratesConfig) {
    const rateDecimal = annualRate / 100;
    const grossInterest = this.roundAmount(principal * rateDecimal * (periodMonths / 12), ratesConfig.roundingMode);
    return this.formatResult(principal, grossInterest, taxType, ratesConfig);
  },

  // 2. 정기예금 (월복리)
  depositCompound(principal, annualRate, periodMonths, taxType, ratesConfig) {
    const monthlyRate = annualRate / 100 / 12;
    const totalWithInterest = principal * Math.pow(1 + monthlyRate, periodMonths);
    const grossInterest = this.roundAmount(totalWithInterest - principal, ratesConfig.roundingMode);
    return this.formatResult(principal, grossInterest, taxType, ratesConfig);
  },

  // 3. 정기적금 (단리, 월 납입식)
  savingsSimple(monthlyDeposit, annualRate, periodMonths, taxType, ratesConfig) {
    const totalPrincipal = monthlyDeposit * periodMonths;
    const monthlyRate = annualRate / 100 / 12;
    const monthSum = (periodMonths * (periodMonths + 1)) / 2;
    const grossInterest = this.roundAmount(monthlyDeposit * monthlyRate * monthSum, ratesConfig.roundingMode);
    return this.formatResult(totalPrincipal, grossInterest, taxType, ratesConfig);
  },

  // 결과 포맷팅 및 세금 계산
  formatResult(totalPrincipal, grossInterest, taxType, ratesConfig) {
    const taxConfig = ratesConfig.taxRates[taxType] || ratesConfig.taxRates.NORMAL;
    const incomeTax = this.roundAmount(grossInterest * taxConfig.incomeTaxRate, ratesConfig.roundingMode);
    const localTax = this.roundAmount(grossInterest * taxConfig.localTaxRate, ratesConfig.roundingMode);
    const totalTax = incomeTax + localTax;
    const netInterest = grossInterest - totalTax;
    const totalPayout = totalPrincipal + netInterest;

    return {
      totalPrincipal,
      grossInterest,
      totalTax,
      incomeTax,
      localTax,
      taxLabel: taxConfig.label,
      netInterest,
      totalPayout
    };
  }
};

// [단위 테스트 검증 블록: Node.js 단독 실행 시]
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.endsWith('calculator.js')) {
  const mockConfig = {
    roundingMode: 'FLOOR',
    taxRates: {
      NORMAL: { label: '일반과세 (15.4%)', incomeTaxRate: 0.14, localTaxRate: 0.014 }
    }
  };
  // 1,000만 원, 4.0%, 12개월 단리 예금
  const test1 = Calculator.depositSimple(10000000, 4.0, 12, 'NORMAL', mockConfig);
  console.assert(test1.grossInterest === 400000, '단리 예금 세전이자 실패');
  console.assert(test1.totalTax === 61600, '단리 예금 세금 계산 실패');
  console.log('✔ 단위 테스트 완료 (단리 예금):', test1);
}