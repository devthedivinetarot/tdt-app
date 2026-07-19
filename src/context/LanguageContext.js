import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

const STORAGE_KEY = 'divinetarot.language';
const LanguageContext = createContext({ lang: 'hinglish', setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('hinglish');

  // Load saved language on start
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setLangState(saved);
          i18n.changeLanguage(saved);
        }
      } catch (e) {
        // ignore — fall back to default
      }
    })();
  }, []);

  const setLang = async (code) => {
    setLangState(code);
    i18n.changeLanguage(code);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, code);
    } catch (e) {
      // ignore persistence errors
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
