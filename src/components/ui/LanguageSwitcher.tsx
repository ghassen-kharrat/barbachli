import React, { useState, useRef, useEffect } from 'react';
import { styled } from 'styled-components';
import { useLanguage, Language } from '../../provider/LanguageProvider';
import { FaChevronDown, FaGlobe } from 'react-icons/fa';

// Styled components
const SwitcherContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const DropdownButton = styled.button`
  background-color: transparent;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--secondary-color);
  }
`;

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  width: 150px;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  z-index: 1000;
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  overflow: hidden;
  
  /* RTL support */
  [dir="rtl"] & {
    right: auto;
    left: 0;
  }
`;

const LanguageOption = styled.button<{ $active: boolean }>`
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  background-color: ${({ $active }) => $active ? 'var(--light-bg)' : 'transparent'};
  color: var(--text-color);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--light-bg);
  }
  
  /* RTL support */
  [dir="rtl"] & {
    text-align: right;
  }
`;

const ActiveIndicator = styled.span`
  color: var(--secondary-color);
  font-weight: bold;
`;

const LanguageFlag = styled.span`
  margin-right: 0.5rem;
  
  /* RTL support */
  [dir="rtl"] & {
    margin-right: 0;
    margin-left: 0.5rem;
  }
`;

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };
  
  const getLanguageLabel = () => {
    switch (language) {
      case 'fr':
        return 'FR';
      case 'ar':
        return 'العربية';
      default:
        return 'FR';
    }
  };
  
  return (
    <SwitcherContainer ref={dropdownRef}>
      <DropdownButton onClick={() => setIsOpen(!isOpen)}>
        {React.createElement(FaGlobe)}
        {getLanguageLabel()}
        {React.createElement(FaChevronDown, { style: { fontSize: '0.7rem' } })}
      </DropdownButton>
      
      <DropdownMenu $isOpen={isOpen}>
        <LanguageOption
        $active={language === 'fr'}
        onClick={() => handleLanguageChange('fr')}
      >
          <span>Français</span>
          {language === 'fr' && <ActiveIndicator>✓</ActiveIndicator>}
        </LanguageOption>
        <LanguageOption
        $active={language === 'ar'}
        onClick={() => handleLanguageChange('ar')}
      >
          <span>العربية</span>
          {language === 'ar' && <ActiveIndicator>✓</ActiveIndicator>}
        </LanguageOption>
      </DropdownMenu>
    </SwitcherContainer>
  );
};

export default LanguageSwitcher; 