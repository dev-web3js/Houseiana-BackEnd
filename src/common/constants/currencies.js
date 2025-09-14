export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', isDefault: true },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' }
];

export const DEFAULT_CURRENCY = 'USD';

export const CURRENCY_REGIONS = {
  'USD': ['US', 'UM', 'VG', 'BQ', 'EC', 'SV', 'GU', 'HT', 'MH', 'FM', 'MP', 'PW', 'PA', 'PR', 'TL', 'TC', 'VI', 'ZW'],
  'EUR': ['AD', 'AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'MC', 'ME', 'NL', 'PT', 'SM', 'SK', 'SI', 'ES', 'VA'],
  'GBP': ['GB', 'IM', 'JE', 'GG'],
  'QAR': ['QA'],
  'AUD': ['AU', 'CX', 'CC', 'HM', 'KI', 'NR', 'NF', 'TV'],
  'CAD': ['CA'],
  'AED': ['AE'],
  'SAR': ['SA'],
  'KWD': ['KW'],
  'BHD': ['BH'],
  'OMR': ['OM'],
  'EGP': ['EG'],
  'INR': ['IN', 'BT'],
  'PKR': ['PK'],
  'PHP': ['PH'],
  'JPY': ['JP'],
  'CHF': ['CH', 'LI'],
  'SEK': ['SE'],
  'NOK': ['NO', 'SJ', 'BV'],
  'DKK': ['DK', 'FO', 'GL']
};

export const getCurrencyByRegion = (countryCode) => {
  for (const [currency, countries] of Object.entries(CURRENCY_REGIONS)) {
    if (countries.includes(countryCode)) {
      return currency;
    }
  }
  return DEFAULT_CURRENCY;
};

export const getCurrencyInfo = (code) => {
  return SUPPORTED_CURRENCIES.find(currency => currency.code === code) || SUPPORTED_CURRENCIES[0];
};