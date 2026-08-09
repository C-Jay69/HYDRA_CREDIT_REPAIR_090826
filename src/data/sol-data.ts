// ---------------------------------------------------------------------------
// CreditShield AI — Statute of Limitations (SOL) Data & Calculator
// Source: State statutes, NCLC, and applicable case law (as of 2024).
// ---------------------------------------------------------------------------

/** Represents a single state's SOL information. */
export type SolEntry = {
  /** Two-letter state abbreviation */
  state: string;
  /** Human-readable SOL range (e.g. '3-5') */
  years: string;
  /** Per-debt-type breakdown */
  debtTypes: {
    type: 'credit_card' | 'written_contract' | 'oral_contract' | 'open_account';
    years: string;
  }[];
};

/** Canadian province SOL entry. */
export type CanadaSolEntry = {
  province: string;
  /** Abbreviation */
  abbr: string;
  years: string;
  /** Wage garnishment protection percentage (null if not specified) */
  wageGarnishmentProtection: number | null;
  debtTypes: {
    type: 'credit_card' | 'written_contract' | 'oral_contract' | 'open_account';
    years: string;
  }[];
};

/** Result of an SOL expiration calculation. */
export type SolExpirationResult = {
  expired: boolean;
  expirationDate: string;
  years: string;
  /** The numeric years used for calculation (lower bound of range) */
  yearsCalculated: number;
};

// ---------------------------------------------------------------------------
// US SOL Data — All 50 States
// ---------------------------------------------------------------------------

export const US_SOL_DATA: SolEntry[] = [
  {
    state: 'AL',
    years: '3',
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '6' },
      { type: 'open_account', years: '3' },
      { type: 'credit_card', years: '3' },
    ],
  },
  {
    state: 'AK',
    years: '3',
    debtTypes: [
      { type: 'written_contract', years: '3' },
      { type: 'oral_contract', years: '3' },
      { type: 'open_account', years: '3' },
      { type: 'credit_card', years: '3' },
    ],
  },
  {
    state: 'AZ',
    years: '6',
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '3' },
      { type: 'open_account', years: '3' },
      { type: 'credit_card', years: '6' },
    ],
  },
  {
    state: 'AR',
    years: '3-5',
    debtTypes: [
      { type: 'written_contract', years: '5' },
      { type: 'oral_contract', years: '3' },
      { type: 'open_account', years: '3' },
      { type: 'credit_card', years: '3-5' },
    ],
  },
  {
    state: 'CA',
    years: '4',
    debtTypes: [
      { type: 'written_contract', years: '4' },
      { type: 'oral_contract', years: '2' },
      { type: 'open_account', years: '4' },
      { type: 'credit_card', years: '4' },
    ],
  },
  {
    state: 'CO',
    years: '6',
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '6' },
      { type: 'open_account', years: '6' },
      { type: 'credit_card', years: '6' },
    ],
  },
  {
    state: 'CT',
    years: '3-6',
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '3' },
      { type: 'open_account', years: '3' },
      { type: 'credit_card', years: '3-6' },
    ],
  },
  {
    state: 'DE',
    years: '3',
    debtTypes: [
      { type: 'written_contract', years: '3' },
      { type: 'oral_contract', years: '3' },
      { type: 'open_account', years: '3' },
      { type: 'credit_card', years: '3' },
    ],
  },
  {
    state: 'FL',
    years: '4-5',
    debtTypes: [
      { type: 'written_contract', years: '5' },
      { type: 'oral_contract', years: '4' },
      { type: 'open_account', years: '4' },
      { type: 'credit_card', years: '4-5' },
    ],
  },
  {
    state: 'GA',
    years: '4-6',
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '4' },
      { type: 'open_account', years: '4' },
      { type: 'credit_card', years: '4-6' },
    ],
  },
  {
    state: 'HI',
    years: '6',
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '6' },
      { type: 'open_account', years: '6' },
      { type: 'credit_card', years: '6' },
    ],
  },
  {
    state: 'ID',
    years: '4-5',
    debtTypes: [
      { type: 'written_contract', years: '5' },
      { type: 'oral_contract', years: '4' },
      { type: 'open_account', years: '4' },
      { type: 'credit_card', years: '4-5' },
    ],
  },
  {
    state: 'IL',
    years: '5-10',
    debtTypes: [
      { type: 'written_contract', years: '10' },
      { type: 'oral_contract', years: '5' },
      { type: 'open_account', years: '5' },
      { type: 'credit_card', years: '5-10' },
    ],
  },
  {
    state: 'IN',
    years: '6-10',
    debtTypes: [
      { type: 'written_contract', years: '10' },
      { type: 'oral_contract', years: '6' },
      { type: 'open_account', years: '6' },
      { type: 'credit_card', years: '6-10' },
    ],
  },
  {
    state: 'IA',
    years: '5-10',
    debtTypes: [
      { type: 'written_contract', years: '10' },
      { type: 'oral_contract', years: '5' },
      { type: 'open_account', years: '5' },
      { type: 'credit_card', years: '5-10' },
    ],
  },
  {
    state: 'KS',
    years: '3-5',
    debtTypes: [
      { type: 'written_contract', years: '5' },
      { type: 'oral_contract', years: '3' },
      { type: 'open_account', years: '3' },
      { type: 'credit_card', years: '3-5' },
    ],
  },
  {
    state: 'KY',
    years: '5-10',
    debtTypes: [
      { type: 'written_contract', years: '10' },
      { type: 'oral_contract', years: '5' },
      { type: 'open_account', years: '5' },
      { type: 'credit_card', years: '5-10' },
    ],
  },
  {
    state: 'LA',
    years: '3',
    debtTypes: [
      { type: 'written_contract', years: '10' },
      { type: 'oral_contract', years: '10' },
      { type: 'open_account', years: '3' },
      { type: 'credit_card', years: '3' },
    ],
  },
  {
    state: 'ME',
    years: '6',
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '6' },
      { type: 'open_account', years: '6' },
      { type: 'credit_card', years: '6' },
    ],
  },
  {
    state: 'MD',
    years: '3',
    debtTypes: [
      { type: 'written_contract', years: '3' },
      { type: 'oral_contract', years: '3' },
      { type: 'open_account', years: '3' },
      { type: 'credit_card', years: '3' },
    ],
  },
  {
    state: 'MA',
    years: '6',
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '6' },
      { type: 'open_account', years: '6' },
      { type: 'credit_card', years: '6' },
    ],
  },
  {
    state: 'MI',
    years: '6',
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '6' },
      { type: 'open_account', years: '6' },
      { type: 'credit_card', years: '6' },
    ],
  },
  {
    state: 'MN',
    years: '6',
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '6' },
      { type: 'open_account', years: '6' },
      { type: 'credit_card', years: '6' },
    ],
  },
  {
    state: 'MS',
    years: '3',
    debtTypes: [
      { type: 'written_contract', years: '3' },
      { type: 'oral_contract', years: '3' },
      { type: 'open_account', years: '3' },
      { type: 'credit_card', years: '3' },
    ],
  },
  {
    state: 'MO',
    years: '5-10',
    debtTypes: [
      { type: 'written_contract', years: '10' },
      { type: 'oral_contract', years: '5' },
      { type: 'open_account', years: '5' },
      { type: 'credit_card', years: '5-10' },
    ],
  },
  {
    state: 'MT',
    years: '3-8',
    debtTypes: [
      { type: 'written_contract', years: '8' },
      { type: 'oral_contract', years: '3' },
      { type: 'open_account', years: '5' },
      { type: 'credit_card', years: '3-8' },
    ],
  },
  {
    state: 'NE',
    years: '4-5',
    debtTypes: [
      { type: 'written_contract', years: '5' },
      { type: 'oral_contract', years: '4' },
      { type: 'open_account', years: '4' },
      { type: 'credit_card', years: '4-5' },
    ],
  },
  {
    state: 'NV',
    years: '4-6',
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '4' },
      { type: 'open_account', years: '4' },
      { type: 'credit_card', years: '4-6' },
    ],
  },
  {
    state: 'NH',
    years: '3',
    debtTypes: [
      { type: 'written_contract', years: '3' },
      { type: 'oral_contract', years: '3' },
      { type: 'open_account', years: '3' },
      { type: 'credit_card', years: '3' },
    ],
  },
  {
    state: 'NJ',
    years: '6',
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '6' },
      { type: 'open_account', years: '6' },
      { type: 'credit_card', years: '6' },
    ],
  },
  {
    state: 'NM',
    years: '4',
    debtTypes: [
      { type: 'written_contract', years: '4' },
      { type: 'oral_contract', years: '4' },
      { type: 'open_account', years: '4' },
      { type: 'credit_card', years: '4' },
    ],
  },
  {
    state: 'NY',
    years: '6',
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '6' },
      { type: 'open_account', years: '6' },
      { type: 'credit_card', years: '6' },
    ],
  },
  {
    state: 'ND',
    years: '6',
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '6' },
      { type: 'open_account', years: '6' },
      { type: 'credit_card', years: '6' },
    ],
  },
  {
    state: 'OH',
    years: '6',
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '6' },
      { type: 'open_account', years: '6' },
      { type: 'credit_card', years: '6' },
    ],
  },
  {
    state: 'OK',
    years: '3-5',
    debtTypes: [
      { type: 'written_contract', years: '5' },
      { type: 'oral_contract', years: '3' },
      { type: 'open_account', years: '3' },
      { type: 'credit_card', years: '3-5' },
    ],
  },
  {
    state: 'OR',
    years: '6',
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '6' },
      { type: 'open_account', years: '6' },
      { type: 'credit_card', years: '6' },
    ],
  },
  {
    state: 'PA',
    years: '4',
    debtTypes: [
      { type: 'written_contract', years: '4' },
      { type: 'oral_contract', years: '4' },
      { type: 'open_account', years: '4' },
      { type: 'credit_card', years: '4' },
    ],
  },
  {
    state: 'RI',
    years: '10',
    debtTypes: [
      { type: 'written_contract', years: '10' },
      { type: 'oral_contract', years: '10' },
      { type: 'open_account', years: '10' },
      { type: 'credit_card', years: '10' },
    ],
  },
  {
    state: 'SC',
    years: '3',
    debtTypes: [
      { type: 'written_contract', years: '3' },
      { type: 'oral_contract', years: '3' },
      { type: 'open_account', years: '3' },
      { type: 'credit_card', years: '3' },
    ],
  },
  {
    state: 'SD',
    years: '6',
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '6' },
      { type: 'open_account', years: '6' },
      { type: 'credit_card', years: '6' },
    ],
  },
  {
    state: 'TN',
    years: '6',
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '6' },
      { type: 'open_account', years: '6' },
      { type: 'credit_card', years: '6' },
    ],
  },
  {
    state: 'TX',
    years: '4',
    debtTypes: [
      { type: 'written_contract', years: '4' },
      { type: 'oral_contract', years: '4' },
      { type: 'open_account', years: '4' },
      { type: 'credit_card', years: '4' },
    ],
  },
  {
    state: 'UT',
    years: '6',
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '4' },
      { type: 'open_account', years: '4' },
      { type: 'credit_card', years: '6' },
    ],
  },
  {
    state: 'VT',
    years: '6',
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '6' },
      { type: 'open_account', years: '6' },
      { type: 'credit_card', years: '6' },
    ],
  },
  {
    state: 'VA',
    years: '3-5',
    debtTypes: [
      { type: 'written_contract', years: '5' },
      { type: 'oral_contract', years: '3' },
      { type: 'open_account', years: '3' },
      { type: 'credit_card', years: '3-5' },
    ],
  },
  {
    state: 'WA',
    years: '6',
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '3' },
      { type: 'open_account', years: '3' },
      { type: 'credit_card', years: '6' },
    ],
  },
  {
    state: 'WV',
    years: '10',
    debtTypes: [
      { type: 'written_contract', years: '10' },
      { type: 'oral_contract', years: '10' },
      { type: 'open_account', years: '10' },
      { type: 'credit_card', years: '10' },
    ],
  },
  {
    state: 'WI',
    years: '6',
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '6' },
      { type: 'open_account', years: '6' },
      { type: 'credit_card', years: '6' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Canada SOL Data — Provinces & Territories
// ---------------------------------------------------------------------------

export const CANADA_SOL_DATA: CanadaSolEntry[] = [
  {
    province: 'Alberta',
    abbr: 'AB',
    years: '2',
    wageGarnishmentProtection: 75,
    debtTypes: [
      { type: 'written_contract', years: '2' },
      { type: 'oral_contract', years: '2' },
      { type: 'open_account', years: '2' },
      { type: 'credit_card', years: '2' },
    ],
  },
  {
    province: 'British Columbia',
    abbr: 'BC',
    years: '2',
    wageGarnishmentProtection: 70,
    debtTypes: [
      { type: 'written_contract', years: '2' },
      { type: 'oral_contract', years: '2' },
      { type: 'open_account', years: '2' },
      { type: 'credit_card', years: '2' },
    ],
  },
  {
    province: 'Manitoba',
    abbr: 'MB',
    years: '2-6',
    wageGarnishmentProtection: 70,
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '2' },
      { type: 'open_account', years: '2' },
      { type: 'credit_card', years: '2-6' },
    ],
  },
  {
    province: 'New Brunswick',
    abbr: 'NB',
    years: '2',
    wageGarnishmentProtection: 65,
    debtTypes: [
      { type: 'written_contract', years: '2' },
      { type: 'oral_contract', years: '2' },
      { type: 'open_account', years: '2' },
      { type: 'credit_card', years: '2' },
    ],
  },
  {
    province: 'Newfoundland and Labrador',
    abbr: 'NL',
    years: '2-6',
    wageGarnishmentProtection: 65,
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '2' },
      { type: 'open_account', years: '2' },
      { type: 'credit_card', years: '2-6' },
    ],
  },
  {
    province: 'Nova Scotia',
    abbr: 'NS',
    years: '2-6',
    wageGarnishmentProtection: 70,
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '2' },
      { type: 'open_account', years: '2' },
      { type: 'credit_card', years: '2-6' },
    ],
  },
  {
    province: 'Ontario',
    abbr: 'ON',
    years: '2',
    wageGarnishmentProtection: 50,
    debtTypes: [
      { type: 'written_contract', years: '2' },
      { type: 'oral_contract', years: '2' },
      { type: 'open_account', years: '2' },
      { type: 'credit_card', years: '2' },
    ],
  },
  {
    province: 'Prince Edward Island',
    abbr: 'PE',
    years: '2-6',
    wageGarnishmentProtection: 60,
    debtTypes: [
      { type: 'written_contract', years: '6' },
      { type: 'oral_contract', years: '2' },
      { type: 'open_account', years: '2' },
      { type: 'credit_card', years: '2-6' },
    ],
  },
  {
    province: 'Quebec',
    abbr: 'QC',
    years: '3',
    wageGarnishmentProtection: 30,
    debtTypes: [
      { type: 'written_contract', years: '3' },
      { type: 'oral_contract', years: '3' },
      { type: 'open_account', years: '3' },
      { type: 'credit_card', years: '3' },
    ],
  },
  {
    province: 'Saskatchewan',
    abbr: 'SK',
    years: '2',
    wageGarnishmentProtection: 60,
    debtTypes: [
      { type: 'written_contract', years: '2' },
      { type: 'oral_contract', years: '2' },
      { type: 'open_account', years: '2' },
      { type: 'credit_card', years: '2' },
    ],
  },
];

// ---------------------------------------------------------------------------
// SOL Expiration Calculator
// ---------------------------------------------------------------------------

/**
 * Parse a years string (e.g. '3', '3-5', '10') into the lower-bound number.
 * For range values, we use the lower bound (more conservative for the consumer,
 * meaning the SOL expires earlier).
 */
function parseYears(yearsStr: string): number {
  const cleaned = yearsStr.trim();
  if (cleaned.includes('-')) {
    return parseInt(cleaned.split('-')[0], 10);
  }
  return parseInt(cleaned, 10);
}

/**
 * Look up a state's SOL data by two-letter abbreviation.
 */
export function getStateSolData(stateCode: string): SolEntry | undefined {
  const normalized = stateCode.toUpperCase().trim();
  return US_SOL_DATA.find((s) => s.state === normalized);
}

/**
 * Look up a province's SOL data by two-letter abbreviation.
 */
export function getProvinceSolData(provinceCode: string): CanadaSolEntry | undefined {
  const normalized = provinceCode.toUpperCase().trim();
  return CANADA_SOL_DATA.find((p) => p.abbr === normalized);
}

/**
 * Calculate whether the statute of limitations has expired for a given debt.
 *
 * @param lastPaymentDate - ISO date string of the last payment or activity (e.g. '2020-06-15')
 * @param state          - Two-letter US state abbreviation (e.g. 'CA')
 * @param debtType       - Type of debt: 'credit_card' | 'written_contract' | 'oral_contract' | 'open_account'
 * @returns An object with expired status, expiration date, and years string
 */
export function calculateSolExpiration(
  lastPaymentDate: string,
  state: string,
  debtType: string
): SolExpirationResult {
  const stateData = getStateSolData(state);

  if (!stateData) {
    return {
      expired: false,
      expirationDate: 'Unknown',
      years: 'Unknown',
      yearsCalculated: 0,
    };
  }

  // Find the specific debt type, falling back to the general 'credit_card' entry
  const typeEntry = stateData.debtTypes.find(
    (d) => d.type === debtType
  );

  const yearsStr = typeEntry?.years ?? stateData.years;
  const years = parseYears(yearsStr);

  // Calculate expiration date by adding years to the last payment date
  const lastPayment = new Date(lastPaymentDate);
  const expiration = new Date(lastPayment);
  expiration.setFullYear(expiration.getFullYear() + years);

  const now = new Date();
  const expired = now > expiration;

  return {
    expired,
    expirationDate: expiration.toISOString().split('T')[0],
    years: yearsStr,
    yearsCalculated: years,
  };
}

/**
 * Format a date string for letter output (e.g. 'June 15, 2020').
 */
export function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
