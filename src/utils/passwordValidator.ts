export interface PasswordRequirement {
  id: 'length' | 'number' | 'uppercase';
  labelSwahili: string;
  labelEnglish: string;
  isMet: boolean;
}

export interface PasswordValidationResult {
  hasMinLength: boolean;
  hasNumber: boolean;
  hasUppercase: boolean;
  isValid: boolean;
  passedCount: number;
  totalRequirements: number;
  strength: 'empty' | 'weak' | 'medium' | 'strong';
  strengthPercentage: number;
  strengthLabelSwahili: string;
  strengthLabelEnglish: string;
  requirements: PasswordRequirement[];
  errorMessage?: string;
}

/**
 * Validates password complexity against:
 * 1. Minimum 8 characters
 * 2. At least one number (0-9)
 * 3. At least one uppercase letter (A-Z)
 */
export function validatePasswordComplexity(password: string): PasswordValidationResult {
  const val = password || '';
  const hasMinLength = val.length >= 8;
  const hasNumber = /\d/.test(val);
  const hasUppercase = /[A-Z]/.test(val);

  const requirements: PasswordRequirement[] = [
    {
      id: 'length',
      labelSwahili: 'Angalau herufi 8 (Minimum 8 characters)',
      labelEnglish: 'At least 8 characters',
      isMet: hasMinLength,
    },
    {
      id: 'number',
      labelSwahili: 'Angalau namba moja: 0-9 (At least 1 number)',
      labelEnglish: 'At least one number (0-9)',
      isMet: hasNumber,
    },
    {
      id: 'uppercase',
      labelSwahili: 'Angalau herufi kubwa moja: A-Z (At least 1 uppercase letter)',
      labelEnglish: 'At least one uppercase letter (A-Z)',
      isMet: hasUppercase,
    },
  ];

  const passedCount = (hasMinLength ? 1 : 0) + (hasNumber ? 1 : 0) + (hasUppercase ? 1 : 0);
  const isValid = hasMinLength && hasNumber && hasUppercase;

  let strength: 'empty' | 'weak' | 'medium' | 'strong' = 'empty';
  let strengthPercentage = 0;
  let strengthLabelSwahili = 'Haijaingizwa';
  let strengthLabelEnglish = 'Empty';

  if (val.length === 0) {
    strength = 'empty';
    strengthPercentage = 0;
    strengthLabelSwahili = 'Weka nenosiri';
    strengthLabelEnglish = 'Enter password';
  } else if (passedCount === 1) {
    strength = 'weak';
    strengthPercentage = 33;
    strengthLabelSwahili = 'Dhaifu';
    strengthLabelEnglish = 'Weak';
  } else if (passedCount === 2) {
    strength = 'medium';
    strengthPercentage = 66;
    strengthLabelSwahili = 'Wastani';
    strengthLabelEnglish = 'Medium';
  } else {
    strength = 'strong';
    strengthPercentage = 100;
    strengthLabelSwahili = 'Imara & Salama';
    strengthLabelEnglish = 'Strong & Secure';
  }

  let errorMessage: string | undefined;
  if (!isValid && val.length > 0) {
    const missing: string[] = [];
    if (!hasMinLength) missing.push('angalau herufi 8');
    if (!hasNumber) missing.push('namba moja (0-9)');
    if (!hasUppercase) missing.push('herufi kubwa moja (A-Z)');
    errorMessage = `Nenosiri halijakidhi vigezo vyote: Linahitaji ${missing.join(', ')}.`;
  }

  return {
    hasMinLength,
    hasNumber,
    hasUppercase,
    isValid,
    passedCount,
    totalRequirements: 3,
    strength,
    strengthPercentage,
    strengthLabelSwahili,
    strengthLabelEnglish,
    requirements,
    errorMessage,
  };
}
