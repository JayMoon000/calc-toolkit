// File: assets/js/core/finance.js
// Action: 금융 계산 순수 연산 엔진 (UI 무관)

/**
 * 복리 계산 (월복리 기본)
 * @param {number} principal - 초기 원금
 * @param {number} monthlyDeposit - 매월 납입액
 * @param {number} annualRate - 연이자율 (예: 5% -> 5)
 * @param {number} years - 투자 기간 (년)
 */
export function calculateCompoundInterest(principal, monthlyDeposit, annualRate, years) {
  const months = years * 12;
  const monthlyRate = (annualRate / 100) / 12;
  
  let futureValuePrincipal = principal * Math.pow(1 + monthlyRate, months);
  let futureValueDeposits = 0;
  
  if (monthlyRate > 0) {
    futureValueDeposits = monthlyDeposit * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  } else {
    futureValueDeposits = monthlyDeposit * months;
  }
  
  const totalAmount = Math.round(futureValuePrincipal + futureValueDeposits);
  const totalPrincipal = principal + (monthlyDeposit * months);
  const totalInterest = totalAmount - totalPrincipal;
  
  return {
    totalAmount,
    totalPrincipal,
    totalInterest
  };
}

/**
 * 대출 상환 계산 (원리금균등분할)
 * @param {number} loanAmount - 대출 원금
 * @param {number} annualRate - 연이자율 (%)
 * @param {number} termMonths - 대출 기간 (개월)
 */
export function calculateAmortization(loanAmount, annualRate, termMonths) {
  const monthlyRate = (annualRate / 100) / 12;
  
  if (monthlyRate === 0) {
    const monthlyPayment = Math.round(loanAmount / termMonths);
    return {
      monthlyPayment,
      totalPayment: loanAmount,
      totalInterest: 0
    };
  }
  
  const factor = Math.pow(1 + monthlyRate, termMonths);
  const monthlyPayment = Math.round((loanAmount * monthlyRate * factor) / (factor - 1));
  const totalPayment = monthlyPayment * termMonths;
  const totalInterest = totalPayment - loanAmount;
  
  return {
    monthlyPayment,
    totalPayment,
    totalInterest
  };
}