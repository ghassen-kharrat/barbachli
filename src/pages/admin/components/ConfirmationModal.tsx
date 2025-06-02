import React from 'react';
import { styled } from 'styled-components';
import { FaIcons } from './Icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  icon?: 'warning' | 'delete' | 'question';
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: var(--card-bg);
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  padding: 2rem;
  position: relative;
  box-shadow: var(--box-shadow);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--light-text);
  font-size: 1.2rem;
  cursor: pointer;
  
  &:hover {
    color: var(--text-color);
  }
`;

const ModalHeader = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const IconWrapper = styled.div<{ $color: string }>`
  margin: 0 auto 1rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${({ $color }) => 
    $color === 'warning' ? 'rgba(255, 152, 0, 0.1)' : 
    $color === 'delete' ? 'rgba(244, 67, 54, 0.1)' : 
    'rgba(15, 52, 96, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: ${({ $color }) => 
    $color === 'warning' ? 'var(--warning-color)' : 
    $color === 'delete' ? 'var(--error-color)' : 
    'var(--accent-color)'};
`;

const Title = styled.h3`
  margin-bottom: 0.5rem;
  color: var(--text-color);
`;

const Message = styled.p`
  color: var(--light-text);
  margin-bottom: 1.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  
  @media (max-width: 576px) {
    flex-direction: column-reverse;
  }
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
  min-width: 120px;
  
  @media (max-width: 576px) {
    width: 100%;
  }
`;

const CancelButton = styled(Button)`
  background-color: var(--card-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  
  &:hover:not(:disabled) {
    background-color: var(--light-bg);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const DeleteButton = styled(Button)`
  background-color: var(--error-color);
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: #d32f2f;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ConfirmButton = styled(Button)`
  background-color: var(--accent-color);
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: var(--primary-color);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  onCancel,
  isLoading = false,
  icon = 'warning'
}: ConfirmationModalProps) => {
  if (!isOpen) return null;
  
  return (
    <ModalOverlay onClick={onCancel}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onCancel}>
          <FaIcons.FaTimes />
        </CloseButton>
        
        <ModalHeader>
          <IconWrapper $color={icon}>
            <FaIcons.FaExclamationTriangle />
          </IconWrapper>
          <Title>{title}</Title>
        </ModalHeader>
        
        <Message>{message}</Message>
        
        <ButtonGroup>
          <CancelButton onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </CancelButton>
          {icon === 'delete' ? (
            <DeleteButton onClick={onConfirm} disabled={isLoading}>
              {isLoading ? 'Chargement...' : confirmText}
            </DeleteButton>
          ) : (
            <ConfirmButton onClick={onConfirm} disabled={isLoading}>
              {isLoading ? 'Chargement...' : confirmText}
            </ConfirmButton>
          )}
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ConfirmationModal; 