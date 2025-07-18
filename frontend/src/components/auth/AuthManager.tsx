'use client';

import React, { useState, useEffect } from 'react';
import { LoginModal } from './LoginModal';
import { RegisterModal } from './RegisterModal';

export type AuthMode = 'login' | 'register';

interface AuthManagerProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export const AuthManager: React.FC<AuthManagerProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}) => {
  const [currentMode, setCurrentMode] = useState<AuthMode>(initialMode);
  const [prefilledEmail, setPrefilledEmail] = useState<string>('');

  // Reset state when modal opens with new initial mode
  useEffect(() => {
    if (isOpen) {
      setCurrentMode(initialMode);
      setPrefilledEmail('');
    }
  }, [isOpen, initialMode]);

  // Handle switch from login to register
  const handleSwitchToRegister = () => {
    setCurrentMode('register');
    setPrefilledEmail('');
  };

  // Handle switch from register to login
  const handleSwitchToLogin = () => {
    setCurrentMode('login');
    setPrefilledEmail('');
  };

  // Handle successful registration
  const handleRegistrationSuccess = (email: string) => {
    setPrefilledEmail(email);
    setCurrentMode('login');
    
    // Don't close the modal - just switch to login mode
    // This allows user to immediately login after registration
  };

  // Handle modal close
  const handleClose = () => {
    setPrefilledEmail('');
    onClose();
  };

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  return (
    <>
      <LoginModal
        isOpen={isOpen && currentMode === 'login'}
        onClose={handleClose}
        onSwitchToRegister={handleSwitchToRegister}
        prefilledEmail={prefilledEmail}
      />
      
      <RegisterModal
        isOpen={isOpen && currentMode === 'register'}
        onClose={handleClose}
        onSwitchToLogin={handleSwitchToLogin}
        onRegistrationSuccess={handleRegistrationSuccess}
      />
    </>
  );
};

// Export the AuthManager as default and also named export
export default AuthManager; 