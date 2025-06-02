import React from 'react';
import { styled } from 'styled-components';
import { useTheme } from '../../provider/ThemeProvider';

const ToggleContainer = styled.button<{ $theme: string }>`
  background: none;
  border: none;
  width: 50px;
  height: 26px;
  border-radius: 30px;
  padding: 0;
  position: relative;
  background-color: ${({ $theme }) => $theme === 'dark' ? 'var(--border-color)' : 'var(--light-bg)'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-around;

  &:focus {
    outline: none;
  }
`;

const ToggleCircle = styled.div<{ $position: string }>`
  position: absolute;
  left: ${({ $position }) => $position === 'left' ? '3px' : '26px'};
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--card-bg);
  transition: left 0.3s ease;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
`;

const MoonIcon = styled.span`
  font-size: 14px;
  color: var(--warning-color);
`;

const SunIcon = styled.span`
  font-size: 14px;
  color: var(--warning-color);
`;

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <ToggleContainer onClick={toggleTheme} $theme={theme}>
      <MoonIcon>🌙</MoonIcon>
      <SunIcon>☀️</SunIcon>
      <ToggleCircle $position={theme === 'dark' ? 'right' : 'left'} />
    </ToggleContainer>
  );
};

export default ThemeToggle; 