/**
 * 예·적금 만기 이자 및 실수령액 산출 엔진 (Zero-dependency Pure Function)
 */
const SavingsCalculator = {
  /**
   * @param {Object} params
   * @param {string} params.type - 'deposit' (정기예금) | 'savings' (정기적금)
   * @param {number} params.amount - 예치원금(예금) 또는 월 납입액(적금)
   * @param {number} params.periodMonths - 가입 기간(개월)
   * @param {number} params.annualRate - 연이율 (단위: %)
   * @param {string} params.interestType - 'simple' (단리) | 'compound' (월복리)
   * @param {string} params.taxType - 'general' (15.4%) | 'preferential' (1.4%) | 'nonTaxable' (0%)
   * @param {Object} config - config/rates.json 의 savings 블록
   */
  calculate(params, config) {
    const { type, amount, periodMonths, annualRate, interestType = 'simple', taxType = 'general' } = params;

    if (!amount || amount <= 0 || !periodMonths || periodMonths <= 0 || !annualRate || annualRate <= 0) {
      return {
        principal: 0,
        grossInterest: 0,
        taxAmount: 0,
        netInterest: 0,
        totalNetPayout: 0
      };
    }

    const r = annualRate / 100;
    let principal = 0;
    let grossInterest = 0;

    if (type === 'deposit') {
      // 1. 정기예금 (목돈 굴리기)
      principal = amount;
      if (interestType === 'simple') {
        grossInterest = principal * r * (periodMonths / 12);
      } else {
        // 월복리: 원금 * (1 + r/12)^개월수 - 원금
        const monthlyRate = r / 12;
        grossInterest = principal * Math.pow(1 + monthlyRate, periodMonths) - principal;
      }
    } else {
      // 2. 정기적금 (목돈 모으기)
      principal = amount * periodMonths;
      if (interestType === 'simple') {
        // 적금 단리 공식: 월납입액 * r/12 * [n * (n + 1) / 2]
        grossInterest = amount * (r / 12) * ((periodMonths * (periodMonths + 1)) / 2);
      } else {
        // 적금 월복리 공식: 매월 납입금별 복리 합산
        const monthlyRate = r / 12;
        let sum = 0;
        for (let i = 1; i <= periodMonths; i++) {
          sum += amount * Math.pow(1 + monthlyRate, i);
        }
        grossInterest = sum - principal;
      }
    }

    grossInterest = Math.floor(grossInterest);

    // 이자소득세 계산
    const taxRate = config.taxRates[taxType]?.total ?? 0.154;
    const taxAmount = Math.floor(grossInterest * taxRate);
    const netInterest = grossInterest - taxAmount;
    const totalNetPayout = principal + netInterest;

    return {
      principal,
      grossInterest,
      taxAmount,
      netInterest,
      totalNetPayout
    };
  }
};

// [단위 테스트 검증 블록]
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.endsWith('savingsCalc.js')) {
  const mockConfig = {
    taxRates: {
      general: { total: 0.154 },
      preferential: { total: 0.014 },
      nonTaxable: { total: 0.0 }
    }
  };

  // 1. 정기예금 1,000만 원, 12개월, 3.5%, 단리, 일반과세(15.4%)
  const dep = SavingsCalculator.calculate({
    type: 'deposit',
    amount: 10000000,
    periodMonths: 12,
    annualRate: 3.5,
    interestType: 'simple',
    taxType: 'general'
  }, mockConfig);

  console.assert(dep.grossInterest === 350000, `예금 세전이자 오류: ${dep.grossInterest}`);
  console.assert(dep.taxAmount === 53900, `예금 이자소득세 오류: ${dep.taxAmount}`);
  console.assert(dep.netInterest === 296100, `예금 세후이자 오류: ${dep.netInterest}`);

  // 2. 정기적금 월 100만 원, 12개월, 4.0%, 단리, 일반과세(15.4%)
  // 세전이자 = 1,000,000 * 0.04/12 * 78 = 260,000원
  const sav = SavingsCalculator.calculate({
    type: 'savings',
    amount: 1000000,
    periodMonths: 12,
    annualRate: 4.0,
    interestType: 'simple',
    taxType: 'general'
  }, mockConfig);

  console.assert(sav.grossInterest === 260000, `적금 세전이자 오류: ${sav.grossInterest}`);
  console.assert(sav.taxAmount === 40040, `적금 이자과세 오류: ${sav.taxAmount}`);
  console.log('✔ 예·적금 계산기 순수 연산 엔진 단위 검증 통과');
}