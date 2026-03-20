// Tax Calculator Utility for Indian Capital Gains
// STCG: 15% (holding < 1 year)
// LTCG: 10% on gains above Rs.1,00,000 (holding > 1 year)

export const calculateTax = (gains, holdingPeriodMonths = 0) => {
  if (gains <= 0) return { tax: 0, type: 'No Tax (Loss)', rate: '0%', net: gains };

  if (holdingPeriodMonths < 12) {
    // Short Term Capital Gains
    const tax = gains * 0.15;
    return { tax, type: 'STCG', rate: '15%', net: gains - tax };
  } else {
    // Long Term Capital Gains (exemption up to Rs.1,00,000)
    const taxableGains = Math.max(0, gains - 100000);
    const tax = taxableGains * 0.10;
    return {
      tax,
      type: 'LTCG',
      rate: taxableGains > 0 ? '10%' : '0% (within exemption)',
      net: gains - tax,
      exemption: Math.min(gains, 100000),
    };
  }
};

export const formatTaxReport = (holdings) => {
  return holdings.map(h => {
    const gain = (h.currentPrice - h.avgPrice) * h.qty;
    const result = calculateTax(gain, h.holdingMonths || 0);
    return {
      symbol: h.symbol,
      gain,
      ...result,
    };
  });
};
