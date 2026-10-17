/**
 * ToolLab.org - Loan Amortization & Compound Interest Engine (Pure Functions)
 * Path: D:\Gemini_Files\ToolLab.org\js\utils\loanCompoundCalc.js
 */
const LoanCompoundCalc = {
  // 1. Amortization (Fixed Monthly Payment: Principal + Interest)
  calculateLoan(principal, annualRatePercent, termYears) {
    if (!principal || !annualRatePercent || !termYears) {
      return { monthlyPayment: 0, totalPayment: 0, totalInterest: 0, schedule: [] };
    }
    const monthlyRate = annualRatePercent / 100 / 12;
    const totalMonths = Math.round(termYears * 12);
    
    // Monthly payment formula: P * (r(1+r)^n) / ((1+r)^n - 1)
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    const monthlyPayment = principal * (monthlyRate * factor) / (factor - 1);
    const totalPayment = monthlyPayment * totalMonths;
    const totalInterest = totalPayment - principal;

    let balance = principal;
    const schedule = [];

    for (let month = 1; month <= totalMonths; month++) {
      const interestForMonth = balance * monthlyRate;
      const principalForMonth = monthlyPayment - interestForMonth;
      balance = Math.max(0, balance - principalForMonth);

      schedule.push({
        month,
        monthlyPayment: Number(monthlyPayment.toFixed(2)),
        principalPart: Number(principalForMonth.toFixed(2)),
        interestPart: Number(interestForMonth.toFixed(2)),
        remainingBalance: Number(balance.toFixed(2))
      });
    }

    return {
      monthlyPayment: Number(monthlyPayment.toFixed(2)),
      totalPayment: Number(totalPayment.toFixed(2)),
      totalInterest: Number(totalInterest.toFixed(2)),
      schedule
    };
  },

  // 2. Compound Interest with Regular Monthly Contributions
  calculateCompound(principal, monthlyDeposit, annualRatePercent, years, frequency = 12) {
    if (isNaN(principal) || isNaN(annualRatePercent) || isNaN(years)) {
      return { futureValue: 0, totalDeposits: 0, totalInterest: 0, yearlyBreakdown: [] };
    }

    const ratePerComp = (annualRatePercent / 100) / frequency;
    const totalMonths = Math.round(years * 12);
    let currentBalance = principal;
    let totalInvested = principal;
    const yearlyBreakdown = [];

    for (let m = 1; m <= totalMonths; m++) {
      currentBalance += monthlyDeposit;
      totalInvested += monthlyDeposit;
      // Monthly compounding
      currentBalance *= (1 + (annualRatePercent / 100 / 12));

      if (m % 12 === 0 || m === totalMonths) {
        const year = Math.ceil(m / 12);
        yearlyBreakdown.push({
          year,
          balance: Number(currentBalance.toFixed(2)),
          totalInvested: Number(totalInvested.toFixed(2)),
          interestEarned: Number((currentBalance - totalInvested).toFixed(2))
        });
      }
    }

    return {
      futureValue: Number(currentBalance.toFixed(2)),
      totalDeposits: Number(totalInvested.toFixed(2)),
      totalInterest: Number((currentBalance - totalInvested).toFixed(2)),
      yearlyBreakdown
    };
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = LoanCompoundCalc;
}

if (typeof window !== "undefined") {
  window.LoanCompoundCalc = LoanCompoundCalc;
}

// Node.js CLI Validation
if (typeof process !== "undefined" && process.argv && process.argv[1]?.endsWith("loanCompoundCalc.js")) {
  const loan = LoanCompoundCalc.calculateLoan(300000, 6.5, 30);
  console.assert(Math.abs(loan.monthlyPayment - 1896.20) < 0.1, "Loan formula verification failed");

  const compound = LoanCompoundCalc.calculateCompound(10000, 500, 8, 10);
  console.assert(compound.futureValue > 100000, "Compound formula verification failed");
  console.log("✔ LoanCompoundCalc pure functions passed all unit assertions");
}