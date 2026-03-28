// Tax slab engine — FY 2025-26

// New regime slabs
export function calcNewRegime(taxableIncome) {
  const slabs = [
    { limit: 300000,   rate: 0    },
    { limit: 700000,   rate: 0.05 },
    { limit: 1000000,  rate: 0.10 },
    { limit: 1200000,  rate: 0.15 },
    { limit: 1500000,  rate: 0.20 },
    { limit: Infinity, rate: 0.30 },
  ];
  let tax = 0, prev = 0;
  for (const slab of slabs) {
    if (taxableIncome <= prev) break;
    tax += (Math.min(taxableIncome, slab.limit) - prev) * slab.rate;
    prev = slab.limit;
  }
  return tax;
}

// Old regime slabs
export function calcOldRegime(taxableIncome) {
  const slabs = [
    { limit: 250000,   rate: 0    },
    { limit: 500000,   rate: 0.05 },
    { limit: 1000000,  rate: 0.20 },
    { limit: Infinity, rate: 0.30 },
  ];
  let tax = 0, prev = 0;
  for (const slab of slabs) {
    if (taxableIncome <= prev) break;
    tax += (Math.min(taxableIncome, slab.limit) - prev) * slab.rate;
    prev = slab.limit;
  }
  return tax;
}

// 4% cess add karo
export function addCess(tax) {
  return tax + tax * 0.04;
}

// Deductions calculate karo
export function calcDeductions({ section80C = 0, section80D = 0, hra = 0, other = 0 }) {
  return {
    section80C: Math.min(section80C, 150000), // Max 1.5L
    section80D: Math.min(section80D, 25000),  // Max 25K
    hra,
    other,
    standardDeduction: 75000,
    total: Math.min(section80C, 150000) + Math.min(section80D, 25000) + hra + other + 75000,
  };
}
