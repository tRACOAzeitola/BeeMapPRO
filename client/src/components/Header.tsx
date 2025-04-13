import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import { ModeToggle } from './mode-toggle';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl text-yellow-500">BeeMap</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link to="/como-funciona" className="transition-colors hover:text-foreground/80 text-foreground/60">
              {t('common.howItWorks')}
            </Link>
            <Link to="/beneficios" className="transition-colors hover:text-foreground/80 text-foreground/60">
              {t('common.benefits')}
            </Link>
            <Link to="/precos" className="transition-colors hover:text-foreground/80 text-foreground/60">
              {t('common.pricing')}
            </Link>
            <Link to="/sobre" className="transition-colors hover:text-foreground/80 text-foreground/60">
              {t('common.about')}
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center">
            <LanguageSelector />
            <ModeToggle />
          </div>
          <Link
            to="/app"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 px-4 rounded-md transition-colors"
          >
            {t('common.accessApp')}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header; 