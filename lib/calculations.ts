/**
 * Centralized calculation engine for Trip Wallet.
 * All financial computations used by dashboard, settlement, and PDF.
 */

export interface PersonWithPayments {
  dueAmount: number;
  totalPaid: number;
}

export interface CategoryWithBudget {
  initialBudget: number;
  transfersIn: number;
  transfersOut: number;
  totalSpent: number;
}

// --- Person calculations ---

export function getPersonRemaining(dueAmount: number, totalPaid: number): number {
  return Math.max(0, dueAmount - totalPaid);
}

export function getPersonPaidPercentage(dueAmount: number, totalPaid: number): number {
  if (dueAmount <= 0) return 100;
  return Math.min(100, Math.round((totalPaid / dueAmount) * 100));
}

// --- Collection calculations ---

export function getTotalExpected(people: { dueAmount: number }[]): number {
  return people.reduce((sum, p) => sum + p.dueAmount, 0);
}

export function getTotalCollected(payments: { amount: number }[]): number {
  return payments.reduce((sum, p) => sum + p.amount, 0);
}

export function getTotalPending(totalExpected: number, totalCollected: number): number {
  return Math.max(0, totalExpected - totalCollected);
}

export function getCollectionPercentage(totalExpected: number, totalCollected: number): number {
  if (totalExpected <= 0) return 100;
  return Math.min(100, Math.round((totalCollected / totalExpected) * 100));
}

// --- Category calculations ---

export function getCategoryCurrentBudget(cat: CategoryWithBudget): number {
  return cat.initialBudget + cat.transfersIn - cat.transfersOut;
}

export function getCategoryRemaining(cat: CategoryWithBudget): number {
  return getCategoryCurrentBudget(cat) - cat.totalSpent;
}

export function getCategorySpentPercentage(cat: CategoryWithBudget): number {
  const current = getCategoryCurrentBudget(cat);
  if (current <= 0) return 100;
  return Math.min(100, Math.round((cat.totalSpent / current) * 100));
}

// --- Trip-level calculations ---

export function getTotalTripBudget(categories: { initialBudget: number }[]): number {
  return categories.reduce((sum, c) => sum + c.initialBudget, 0);
}

export function getTotalExpenses(expenses: { amount: number }[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getRemainingBudget(totalBudget: number, totalExpenses: number): number {
  return totalBudget - totalExpenses;
}

export function getCashInHand(totalCollected: number, totalExpenses: number): number {
  return totalCollected - totalExpenses;
}

// --- Formatting ---

export function formatCurrency(amount: number, currency: string = "INR"): string {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
}
