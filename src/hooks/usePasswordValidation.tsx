import { useState, useEffect } from "react";

export interface PasswordValidation {
  isValid: boolean;
  score: number;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
  feedback: string[];
}

export function usePasswordValidation(password: string, confirmPassword?: string) {
  const [validation, setValidation] = useState<PasswordValidation>({
    isValid: false,
    score: 0,
    requirements: {
      minLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecialChar: false,
    },
    feedback: [],
  });

  const [passwordsMatch, setPasswordsMatch] = useState(true);

  useEffect(() => {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    const metRequirements = Object.values(requirements).filter(Boolean).length;
    const score = Math.round((metRequirements / 5) * 100);
    const isValid = metRequirements >= 4; // Require at least 4 out of 5 criteria

    const feedback: string[] = [];
    if (!requirements.minLength) feedback.push("At least 8 characters");
    if (!requirements.hasUppercase) feedback.push("One uppercase letter");
    if (!requirements.hasLowercase) feedback.push("One lowercase letter");
    if (!requirements.hasNumber) feedback.push("One number");
    if (!requirements.hasSpecialChar) feedback.push("One special character");

    setValidation({
      isValid,
      score,
      requirements,
      feedback,
    });

    // Check password match
    if (confirmPassword !== undefined) {
      setPasswordsMatch(password === confirmPassword);
    }
  }, [password, confirmPassword]);

  return { validation, passwordsMatch };
}