export const SUPPORTED_REGIONS = [
  // North America
  { code: 'US', name: 'United States', continent: 'North America', currency: 'USD', languages: ['en'] },
  { code: 'CA', name: 'Canada', continent: 'North America', currency: 'CAD', languages: ['en', 'fr'] },
  
  // Europe
  { code: 'GB', name: 'United Kingdom', continent: 'Europe', currency: 'GBP', languages: ['en'] },
  { code: 'FR', name: 'France', continent: 'Europe', currency: 'EUR', languages: ['fr'] },
  { code: 'DE', name: 'Germany', continent: 'Europe', currency: 'EUR', languages: ['de'] },
  { code: 'IT', name: 'Italy', continent: 'Europe', currency: 'EUR', languages: ['it'] },
  { code: 'ES', name: 'Spain', continent: 'Europe', currency: 'EUR', languages: ['es'] },
  { code: 'PT', name: 'Portugal', continent: 'Europe', currency: 'EUR', languages: ['pt'] },
  { code: 'NL', name: 'Netherlands', continent: 'Europe', currency: 'EUR', languages: ['nl'] },
  { code: 'SE', name: 'Sweden', continent: 'Europe', currency: 'SEK', languages: ['sv'] },
  { code: 'NO', name: 'Norway', continent: 'Europe', currency: 'NOK', languages: ['no'] },
  { code: 'DK', name: 'Denmark', continent: 'Europe', currency: 'DKK', languages: ['da'] },
  { code: 'FI', name: 'Finland', continent: 'Europe', currency: 'EUR', languages: ['fi'] },
  { code: 'CH', name: 'Switzerland', continent: 'Europe', currency: 'CHF', languages: ['de', 'fr', 'it'] },
  { code: 'AT', name: 'Austria', continent: 'Europe', currency: 'EUR', languages: ['de'] },
  { code: 'BE', name: 'Belgium', continent: 'Europe', currency: 'EUR', languages: ['nl', 'fr'] },
  { code: 'IE', name: 'Ireland', continent: 'Europe', currency: 'EUR', languages: ['en'] },
  { code: 'PL', name: 'Poland', continent: 'Europe', currency: 'PLN', languages: ['pl'] },
  
  // Middle East (Priority regions)
  { code: 'QA', name: 'Qatar', continent: 'Asia', currency: 'QAR', languages: ['ar', 'en'] },
  { code: 'AE', name: 'United Arab Emirates', continent: 'Asia', currency: 'AED', languages: ['ar', 'en'] },
  { code: 'SA', name: 'Saudi Arabia', continent: 'Asia', currency: 'SAR', languages: ['ar', 'en'] },
  { code: 'KW', name: 'Kuwait', continent: 'Asia', currency: 'KWD', languages: ['ar', 'en'] },
  { code: 'BH', name: 'Bahrain', continent: 'Asia', currency: 'BHD', languages: ['ar', 'en'] },
  { code: 'OM', name: 'Oman', continent: 'Asia', currency: 'OMR', languages: ['ar', 'en'] },
  { code: 'EG', name: 'Egypt', continent: 'Africa', currency: 'EGP', languages: ['ar', 'en'] },
  { code: 'JO', name: 'Jordan', continent: 'Asia', currency: 'JOD', languages: ['ar', 'en'] },
  { code: 'LB', name: 'Lebanon', continent: 'Asia', currency: 'LBP', languages: ['ar', 'en'] },
  
  // Asia Pacific
  { code: 'AU', name: 'Australia', continent: 'Oceania', currency: 'AUD', languages: ['en'] },
  { code: 'NZ', name: 'New Zealand', continent: 'Oceania', currency: 'NZD', languages: ['en'] },
  { code: 'JP', name: 'Japan', continent: 'Asia', currency: 'JPY', languages: ['ja'] },
  { code: 'KR', name: 'South Korea', continent: 'Asia', currency: 'KRW', languages: ['ko'] },
  { code: 'SG', name: 'Singapore', continent: 'Asia', currency: 'SGD', languages: ['en'] },
  { code: 'HK', name: 'Hong Kong', continent: 'Asia', currency: 'HKD', languages: ['zh', 'en'] },
  { code: 'IN', name: 'India', continent: 'Asia', currency: 'INR', languages: ['hi', 'en'] },
  { code: 'PH', name: 'Philippines', continent: 'Asia', currency: 'PHP', languages: ['tl', 'en'] },
  { code: 'MY', name: 'Malaysia', continent: 'Asia', currency: 'MYR', languages: ['ms', 'en'] },
  { code: 'TH', name: 'Thailand', continent: 'Asia', currency: 'THB', languages: ['th'] },
  { code: 'ID', name: 'Indonesia', continent: 'Asia', currency: 'IDR', languages: ['id'] },
  
  // South America
  { code: 'BR', name: 'Brazil', continent: 'South America', currency: 'BRL', languages: ['pt'] },
  { code: 'AR', name: 'Argentina', continent: 'South America', currency: 'ARS', languages: ['es'] },
  { code: 'MX', name: 'Mexico', continent: 'North America', currency: 'MXN', languages: ['es'] },
  { code: 'CL', name: 'Chile', continent: 'South America', currency: 'CLP', languages: ['es'] },
  { code: 'CO', name: 'Colombia', continent: 'South America', currency: 'COP', languages: ['es'] }
];

export const PRIORITY_REGIONS = ['QA', 'AE', 'SA', 'KW', 'BH', 'OM', 'US', 'GB', 'DE', 'FR', 'AU', 'CA'];

export const getRegionInfo = (countryCode) => {
  return SUPPORTED_REGIONS.find(region => region.code === countryCode);
};

export const getRegionsByContinent = (continent) => {
  return SUPPORTED_REGIONS.filter(region => region.continent === continent);
};

export const isPriorityRegion = (countryCode) => {
  return PRIORITY_REGIONS.includes(countryCode);
};

export const TAX_REGIONS = {
  // VAT regions
  'VAT': ['GB', 'IE', 'FR', 'DE', 'IT', 'ES', 'PT', 'NL', 'BE', 'AT', 'SE', 'DK', 'FI', 'PL', 'QA', 'AE', 'SA', 'EG'],
  
  // GST regions
  'GST': ['AU', 'NZ', 'IN', 'CA', 'SG'],
  
  // Sales tax regions
  'SALES_TAX': ['US'],
  
  // No tax regions
  'NO_TAX': ['BH', 'KW', 'OM'],
  
  // Custom tax regions
  'CUSTOM': ['JP', 'KR', 'CH', 'NO', 'BR', 'MX']
};

export const getTaxType = (countryCode) => {
  for (const [taxType, countries] of Object.entries(TAX_REGIONS)) {
    if (countries.includes(countryCode)) {
      return taxType;
    }
  }
  return 'CUSTOM';
};