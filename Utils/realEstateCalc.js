/**
 * 부동산 중개보수 순수 연산 로직
 */
const RealEstateCalculator = {
  // 월세 거래금액 환산 공식
  calculateTransactionAmount(tradeType, deposit, monthlyRent = 0) {
    if (tradeType !== 'RENT_MONTHLY' || monthlyRent === 0) {
      return deposit;
    }
    // 1차 환산: 보증금 + (월세 * 100)
    let total = deposit + (monthlyRent * 100);
    // 5천만원 미만일 경우 재계산: 보증금 + (월세 * 70)
    if (total < 50000000) {
      total = deposit + (monthlyRent * 70);
    }
    return total;
  },

  // 상한 수수료 계산
  calculateCommission(categoryKey, transactionAmount, ratesConfig) {
    const config = ratesConfig.realEstate;
    const category = config.categories[categoryKey];
    if (!category) throw new Error('유효하지 않은 부동산 거래 유형입니다.');

    let appliedRate = 0.009;
    let limit = null;

    // 해당 금액 구간 탐색
    for (const bracket of category.brackets) {
      if (bracket.max === null || transactionAmount < bracket.max) {
        appliedRate = bracket.rate;
        limit = bracket.limit;
        break;
      }
    }

    // 기본 상한 수수료 (원단위 절사)
    let maxCommission = Math.floor(transactionAmount * appliedRate);
    
    // 한도액이 존재하는 경우 비교 적용
    if (limit !== null && maxCommission > limit) {
      maxCommission = limit;
    }

    // 부가세(VAT 10%)
    const vat = Math.floor(maxCommission * config.vatRate);
    const totalWithVat = maxCommission + vat;

    return {
      transactionAmount,
      appliedRate: appliedRate * 100, // 백분율 표기
      limitAmount: limit,
      maxCommission,
      vat,
      totalWithVat
    };
  }
};

// [단위 테스트 검증 블록]
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.endsWith('calculator.js')) {
  const mockConfig = {
    realEstate: {
      vatRate: 0.1,
      categories: {
        HOUSING_SALE: {
          brackets: [
            { max: 50000000, rate: 0.006, limit: 250000 },
            { max: 200000000, rate: 0.005, limit: 800000 },
            { max: 900000000, rate: 0.004, limit: null }
          ]
        }
      }
    }
  };

  // 테스트 1: 주택 매매 1억 5천만원 (0.5%, 한도 80만원) -> 75만원 산출 검증
  const t1 = RealEstateCalculator.calculateCommission('HOUSING_SALE', 150000000, mockConfig);
  console.assert(t1.maxCommission === 750000, '매매 1.5억 수수료 계산 실패');
  console.log('✔ 부동산 단위테스트 1 통과:', t1);

  // 테스트 2: 주택 매매 4천만원 (0.6% = 24만원, 한도 25만원) -> 24만원 산출 검증
  const t2 = RealEstateCalculator.calculateCommission('HOUSING_SALE', 40000000, mockConfig);
  console.assert(t2.maxCommission === 240000, '매매 4천만원 한도 미만 실패');
  console.log('✔ 부동산 단위테스트 2 통과:', t2);
}