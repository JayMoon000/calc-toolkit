/**
 * 2026 시급 & 주휴수당 연산 엔진 (Zero-dependency Pure Function)
 */
const HourlyCalculator = {
  calculate(params, config) {
    const {
      wage = 0,
      dailyHours = 0,
      workDays = 0,
      extendedHours = 0,
      taxOption = 'none'
    } = params;

    if (wage <= 0 || dailyHours <= 0 || workDays <= 0) {
      return {
        basicHours: 0,
        holidayHours: 0,
        totalPaidWeeklyHours: 0,
        weeklyGross: 0,
        monthlyGross: 0,
        deduction: 0,
        monthlyNet: 0,
        isHolidayEligible: false
      };
    }

    const basicHours = dailyHours * workDays;
    const isHolidayEligible = basicHours >= config.standardWeeklyHours;
    const holidayHours = isHolidayEligible ? Math.min(8, (basicHours / 40) * 8) : 0;
    const totalPaidWeeklyHours = basicHours + holidayHours + (extendedHours * 1.5);

    const weeklyGross = Math.floor(totalPaidWeeklyHours * wage);
    const monthlyGross = Math.floor(weeklyGross * config.monthlyAvgWeeks);

    let deduction = 0;
    if (taxOption === 'freelancer') {
      deduction = Math.floor(monthlyGross * config.freelancerRate);
    } else if (taxOption === 'insurance') {
      deduction = Math.floor(monthlyGross * config.insuranceRate);
    }

    const monthlyNet = monthlyGross - deduction;

    return {
      basicHours,
      holidayHours: Number(holidayHours.toFixed(1)),
      totalPaidWeeklyHours: Number(totalPaidWeeklyHours.toFixed(1)),
      weeklyGross,
      monthlyGross,
      deduction,
      monthlyNet,
      isHolidayEligible
    };
  }
};

// [단위 테스트 검증 블록]
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.endsWith('hourlyCalc.js')) {
  const mockConfig = {
    minHourlyWage: 10030,
    standardWeeklyHours: 15,
    freelancerRate: 0.033,
    insuranceRate: 0.09395,
    monthlyAvgWeeks: 4.34524
  };

  // 주 5일, 8시간(주 40시간 -> 주휴 8시간), 최저시급 10,030원 테스트
  const res = HourlyCalculator.calculate({
    wage: 10030,
    dailyHours: 8,
    workDays: 5,
    extendedHours: 0,
    taxOption: 'none'
  }, mockConfig);

  console.assert(res.isHolidayEligible === true, '주휴수당 자격 판정 실패');
  console.assert(res.holidayHours === 8, '주휴 8시간 연산 오류');
  console.assert(res.weeklyGross === 481440, `주급 연산 오류: ${res.weeklyGross}`);
  console.log('✔ hourlyCalc.js 순수 연산 엔진 단위 테스트 통과');
}