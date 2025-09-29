import { strengthIndicator, hasNumber, hasMixed, hasSpecial } from './password-strength';

// Form validation

const isRequired = (value) => value.trim() !== '';
const minLength = (value, len) => value.length >= len;
const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(value);

// Login form validation
export const validateLoginForm = (input, password) => {
  const errors = {};

  const inputTrim = input.trim();
  const passwordTrim = password.trim();

  if (!isRequired(inputTrim)) errors.input = 'Username or Email is required';
  if (!isRequired(passwordTrim)) errors.password = 'Password is required';

  if (Object.keys(errors).length === 0) return false;
  return errors;
};

// Register form validation
export const validateRegisterForm = (formData) => {
  const errors = {};

  // Business name
  if (!isRequired(formData.businessName)) {
    errors.businessName = 'Business name is required';
  } else if (!minLength(formData.businessName, 2)) {
    errors.businessName = 'Business name must be at least 2 characters';
  }

  // First name
  if (!isRequired(formData.firstName)) {
    errors.firstName = 'First name is required';
  } else if (!minLength(formData.firstName, 2)) {
    errors.firstName = 'First name must be at least 2 characters';
  }

  // Last name
  if (!isRequired(formData.lastName)) {
    errors.lastName = 'Last name is required';
  } else if (!minLength(formData.lastName, 2)) {
    errors.lastName = 'Last name must be at least 2 characters';
  }

  // Username
  if (!isRequired(formData.username)) {
    errors.username = 'Username is required';
  } else if (!minLength(formData.username, 3)) {
    errors.username = 'Username must be at least 3 characters';
  }

  // Email
  if (!isRequired(formData.email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Invalid email address';
  }

  // Password
  const password = formData.password || '';
  if (!password.trim()) {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else {
    const strength = strengthIndicator(password);

    if (!hasMixed(password)) {
      errors.password = 'Password must contain uppercase and lowercase letters';
    } else if (!hasNumber(password)) {
      errors.password = 'Password must contain a number';
    } else if (!hasSpecial(password)) {
      errors.password = 'Password must contain a special character';
    } else if (strength < 4) {
      errors.password = 'Password is too weak';
    }
  }

  return Object.keys(errors).length === 0 ? false : errors;
};
