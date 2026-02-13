import { useState, useEffect } from 'react';

export type Language = 'ar' | 'en';
export type DateFormat = 'hijri' | 'gregorian' | 'both';
export type NumberFormat = 'arabic' | 'western';
export type Currency = 'SAR' | 'AED' | 'KWD' | 'QAR' | 'USD';

export interface LanguageSettings {
  language: Language;
  timezone: string;
  dateFormat: DateFormat;
  currency: Currency;
  numberFormat: NumberFormat;
  rtl: boolean;
}

const defaultSettings: LanguageSettings = {
  language: 'ar',
  timezone: 'Asia/Riyadh',
  dateFormat: 'gregorian',
  currency: 'SAR',
  numberFormat: 'western',
  rtl: true
};

export function useLanguage() {
  const [settings, setSettings] = useState<LanguageSettings>(() => {
    const saved = localStorage.getItem('languageSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('languageSettings', JSON.stringify(settings));
    
    // Apply RTL/LTR to document
    document.documentElement.dir = settings.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = settings.language;
  }, [settings]);

  const updateSettings = (newSettings: Partial<LanguageSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const formatCurrency = (amount: number) => {
    const currencySymbols = {
      SAR: 'ر.س',
      AED: 'د.إ',
      KWD: 'د.ك',
      QAR: 'ر.ق',
      USD: '$'
    };

    const formatted = new Intl.NumberFormat(settings.language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: settings.currency,
      currencyDisplay: 'symbol'
    }).format(amount);

    return formatted;
  };

  const formatNumber = (num: number) => {
    if (settings.numberFormat === 'arabic') {
      return num.toString().replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
    }
    return num.toLocaleString(settings.language === 'ar' ? 'ar-SA' : 'en-US');
  };

  const formatDate = (date: Date) => {
    const locale = settings.language === 'ar' ? 'ar-SA' : 'en-US';
    
    if (settings.dateFormat === 'hijri') {
      return new Intl.DateTimeFormat(locale + '-u-ca-islamic', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    }
    
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return {
    settings,
    updateSettings,
    formatCurrency,
    formatNumber,
    formatDate,
    isRTL: settings.rtl,
    currentLanguage: settings.language
  };
}