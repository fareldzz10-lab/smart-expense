export const formatCurrency = (amount: number): string => {
  const currency = typeof window !== 'undefined' ? localStorage.getItem('currency') || 'IDR' : 'IDR';
  
  const localeMap: Record<string, string> = {
    'IDR': 'id-ID',
    'USD': 'en-US',
    'EUR': 'de-DE',
    'GBP': 'en-GB',
    'JPY': 'ja-JP'
  };

  const locale = localeMap[currency] || 'id-ID';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};