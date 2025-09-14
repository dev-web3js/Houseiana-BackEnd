export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', isDefault: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' }
];

export const DEFAULT_LANGUAGE = 'en';

export const RTL_LANGUAGES = ['ar', 'ur'];

export const REGIONAL_LANGUAGE_PREFERENCES = {
  // Middle East
  'QA': ['ar', 'en'],
  'AE': ['ar', 'en'],
  'SA': ['ar', 'en'],
  'KW': ['ar', 'en'],
  'BH': ['ar', 'en'],
  'OM': ['ar', 'en'],
  'EG': ['ar', 'en'],
  'JO': ['ar', 'en'],
  'LB': ['ar', 'en'],
  'SY': ['ar', 'en'],
  'IQ': ['ar', 'en'],
  'MA': ['ar', 'fr', 'en'],
  'TN': ['ar', 'fr', 'en'],
  'DZ': ['ar', 'fr', 'en'],
  
  // Europe
  'GB': ['en'],
  'IE': ['en'],
  'US': ['en'],
  'CA': ['en', 'fr'],
  'AU': ['en'],
  'NZ': ['en'],
  'FR': ['fr', 'en'],
  'DE': ['de', 'en'],
  'IT': ['it', 'en'],
  'ES': ['es', 'en'],
  'PT': ['pt', 'en'],
  'NL': ['nl', 'en'],
  'SE': ['sv', 'en'],
  'NO': ['no', 'en'],
  'DK': ['da', 'en'],
  'FI': ['fi', 'en'],
  'PL': ['pl', 'en'],
  'RU': ['ru', 'en'],
  'TR': ['tr', 'en'],
  
  // Asia
  'CN': ['zh', 'en'],
  'JP': ['ja', 'en'],
  'KR': ['ko', 'en'],
  'IN': ['hi', 'en'],
  'PK': ['ur', 'en'],
  'BD': ['bn', 'en'],
  'ID': ['id', 'en'],
  'MY': ['ms', 'en'],
  'TH': ['th', 'en'],
  'VN': ['vi', 'en'],
  'PH': ['tl', 'en']
};

export const getLanguagesByRegion = (countryCode) => {
  return REGIONAL_LANGUAGE_PREFERENCES[countryCode] || [DEFAULT_LANGUAGE];
};

export const isRTL = (languageCode) => {
  return RTL_LANGUAGES.includes(languageCode);
};

export const getLanguageInfo = (code) => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code) || SUPPORTED_LANGUAGES[0];
};