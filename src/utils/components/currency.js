export function formatCurrency(number) {
  const roundedNumber = Math.round(number * 100) / 100;
  const hasDecimal = roundedNumber % 1 !== 0;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: hasDecimal ? 2 : 0,
    maximumFractionDigits: hasDecimal ? 2 : 0,
  }).format(roundedNumber);
}
