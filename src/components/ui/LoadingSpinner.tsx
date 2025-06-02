import React from 'react';
import { styled, keyframes } from 'styled-components';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const SpinnerContainer = styled.div<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Spinner = styled.div<{ $size: number; $color: string }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border: ${({ $size }) => Math.max(2, $size / 10)}px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: ${({ $size }) => Math.max(2, $size / 10)}px solid ${({ $color }) => $color};
  animation: ${spin} 1s linear infinite;
`;

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 40, 
  color = '#e94560' 
}) => {
  return (
    <SpinnerContainer $size={size}>
      <Spinner $size={size} $color={color} />
    </SpinnerContainer>
  );
};

export default LoadingSpinner; 