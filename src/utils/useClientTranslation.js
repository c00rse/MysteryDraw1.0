import { translations } from "../data/translations";

export const useClientTranslation = () => {
    const isBrowser = typeof window !== "undefined";
    
    // Jeśli nie ma prefixu, domyślnie 'en'
    let locale = 'en';
    
    if (isBrowser) {
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        const firstSegment = pathSegments[0];
        
        if (firstSegment && (firstSegment === 'pl' || firstSegment === 'en')) {
            locale = firstSegment;
        }
    }

    // Funkcja t('klucz')
    const t = (key) => {
        return translations[locale][key] || key;
    };

    return { t, locale };
};