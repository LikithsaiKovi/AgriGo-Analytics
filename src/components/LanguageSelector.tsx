import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'floating';
  className?: string;
}

export function LanguageSelector({ variant = 'default', className = '' }: LanguageSelectorProps) {
  const { currentLanguage, setLanguage, t, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (languageCode: string) => {
    setLanguage(languageCode);
    setIsOpen(false);
  };

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 px-1 sm:px-2 gap-1 text-xs"
        >
          <span className="text-sm">{currentLang.flag}</span>
          <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>

        {isOpen && (
          <Card className="absolute top-full left-0 mt-1 w-48 z-50 shadow-lg border">
            <CardContent className="p-1">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">
                {t('language.select')}
              </div>
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-accent transition-colors ${
                    currentLanguage === language.code ? 'bg-accent' : ''
                  }`}
                >
                  <span className="text-sm">{language.flag}</span>
                  <span className="flex-1 text-left">{language.nativeName}</span>
                  {currentLanguage === language.code && (
                    <Check className="h-3 w-3 text-primary" />
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className={`fixed top-4 right-4 z-50 ${className}`}>
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-10 px-3 gap-2 shadow-lg"
          >
            <Globe className="h-4 w-4" />
            <span className="text-sm">{currentLang.nativeName}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>

          {isOpen && (
            <Card className="absolute top-full right-0 mt-2 w-64 z-50 shadow-xl border">
              <CardContent className="p-2">
                <div className="text-sm font-medium text-muted-foreground px-2 py-2 mb-1">
                  {t('language.select')}
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageSelect(language.code)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-accent transition-colors ${
                        currentLanguage === language.code ? 'bg-accent' : ''
                      }`}
                    >
                      <span className="text-lg">{language.flag}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{language.nativeName}</div>
                        <div className="text-xs text-muted-foreground">{language.name}</div>
                      </div>
                      {currentLanguage === language.code && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-4 gap-2"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm">{currentLang.nativeName}</span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 mt-2 w-64 z-50 shadow-lg border">
          <CardContent className="p-2">
            <div className="text-sm font-medium text-muted-foreground px-2 py-2 mb-1">
              {t('language.select')}
            </div>
            <div className="max-h-60 overflow-y-auto">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-accent transition-colors ${
                    currentLanguage === language.code ? 'bg-accent' : ''
                  }`}
                >
                  <span className="text-lg">{language.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-xs text-muted-foreground">{language.name}</div>
                  </div>
                  {currentLanguage === language.code && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
