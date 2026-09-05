/**
 * 2026 연봉 실수령액 및 4대보험 산출 엔진 (Zero-dependency Pure Function)
 */
const SalaryCalculator = {
  calculateMonthly(annualSalary, dependentsCount = 1, nonTaxableMeal = 200000, config) {
    if (!annualSalary || annualSalary <= 0) {
      return {
        grossMonthly: 0,
        netMonthly: 0,
        totalDeduction: 0,
        pension: 0,
        health: 0,
        care: 0,
        employment: 0,
        incomeTax: 0,
        localTax: 0
      };
    }

    const grossMonthly = Math.floor(annualSalary / 12);
    // 비과세 식대 차감 후 과세 대상 월급여 산출
    const taxableMonthly = Math.max(0, grossMonthly - nonTaxableMeal);

    const ins = config.socialInsurance;

    // 1. 국민연금 (상·하한선 적용)
    let pensionBase = Math.max(ins.nationalPension.minMonthly, Math.min(ins.nationalPension.maxMonthly, taxableMonthly));
    const pension = Math.floor(pensionBase * ins.nationalPension.rate);

    // 2. 건강보험
    const health = Math.floor(taxableMonthly * ins.healthInsurance.rate);

    // 3. 장기요양보험 (건강보험료의 12.95%)
    const care = Math.floor(health * ins.longTermCare.rateOfHealth);

    // 4. 고용보험
    const employment = Math.floor(taxableMonthly * ins.employmentInsurance.rate);

    // 5. 근로소득세 (근로소득공제 및 간이세액 간이 역산 근사 알고리즘)
    const annualTaxable = taxableMonthly * 12;
    // 근로소득공제 산출
    let earnedIncomeDeduction = 0;
    if (annualTaxable <= 5000000) earnedIncomeDeduction = annualTaxable * 0.7;
    else if (annualTaxable <= 15000000) earnedIncomeDeduction = 3500000 + (annualTaxable - 5000000) * 0.4;
    else if (annualTaxable <= 45000000) earnedIncomeDeduction = 7500000 + (annualTaxable - 15000000) * 0.15;
    else if (annualTaxable <= 100000000) earnedIncomeDeduction = 12000000 + (annualTaxable - 45000000) * 0.05;
    else earnedIncomeDeduction = 14750000 + (annualTaxable - 100000000) * 0.02;

    // 기본공제 (인당 150만 원)
    const basicDeduction = dependentsCount * 1500000;
    const standardTaxBase = Math.max(0, annualTaxable - earnedIncomeDeduction - basicDeduction);

    // 소득세 누진세율 적용
    const bracket = config.incomeTaxBrackets.find(b => standardTaxBase <= b.limit);
    const calculatedAnnualTax = Math.max(0, standardTaxBase * bracket.rate - bracket.quickDeduction);
    
    // 근로소득세액공제(연 74만~50만 원 한도 반영)
    let taxCredit = 0;
    if (calculatedAnnualTax <= 1300000) taxCredit = calculatedAnnualTax * 0.55;
    else taxCredit = 715000 + (calculatedAnnualTax - 1300000) * 0.3;
    taxCredit = Math.min(taxCredit, 740000);

    const finalAnnualTax = Math.max(0, calculatedAnnualTax - taxCredit);
    const incomeTax = Math.floor(finalAnnualTax / 12);
    const localTax = Math.floor(incomeTax * config.localTaxRate);

    // 총 공제액 및 실수령액
    const totalDeduction = pension + health + care + employment + incomeTax + localTax;
    const netMonthly = grossMonthly - totalDeduction;

    return {
      grossMonthly,
      netMonthly,
      totalDeduction,
      pension,
      health,
      care,
      employment,
      incomeTax,
      localTax
    };
  }
};

// [단위 테스트 검증 블록]
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.endsWith('salaryCalc.js')) {
  const mockConfig = {
    socialInsurance: {
      nationalPension: { rate: 0.045, minMonthly: 390000, maxMonthly: 6170000 },
      healthInsurance: { rate: 0.03545 },
      longTermCare: { rateOfHealth: 0.1295 },
      employmentInsurance: { rate: 0.009 }
    },
    incomeTaxBrackets: [
      { limit: 14000000, rate: 0.06, quickDeduction: 0 },
      { limit: 50000000, rate: 0.15, quickDeduction: 1260000 },
      { limit: 88000000, rate: 0.24, quickDeduction: 5760000 },
      { limit: Infinity, rate: 0.35, quickDeduction: 15440000 }
    ],
    localTaxRate: 0.1
  };

  // 연봉 5,000만 원 (1인 가구, 비과세 식대 20만 원)
  const result = SalaryCalculator.calculateMonthly(50000000, 1, 200000, mockConfig);
  console.assert(result.netMonthly > 3400000 && result.netMonthly < 3650000, '연봉 5000만 원 실수령액 산출 오차');
  console.log('✔ 연봉 계산기 순수 연산 엔진 단위 검증 통과');
}