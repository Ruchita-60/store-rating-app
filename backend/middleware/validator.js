// Email validation regex (RFC 5322 compatible standard)
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

// Name validation: 20 to 60 characters
export const isValidName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 20 && trimmed.length <= 60;
};

// Address validation: Maximum 400 characters
export const isValidAddress = (address) => {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  return trimmed.length > 0 && trimmed.length <= 400;
};

// Password validation: 8–16 characters, at least one uppercase letter and one special character
export const isValidPassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  if (password.length < 8 || password.length > 16) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);
  return hasUppercase && hasSpecialChar;
};

// Rating validation: Integer between 1 and 5
export const isValidRating = (rating) => {
  const num = Number(rating);
  return Number.isInteger(num) && num >= 1 && num <= 5;
};

// Middleware for user registration & creation
export const validateUserRegistration = (req, res, next) => {
  const { name, email, password, address, role } = req.body;
  const errors = [];

  if (!isValidName(name)) {
    errors.push('Name must be between 20 and 60 characters.');
  }

  if (!isValidEmail(email)) {
    errors.push('Invalid email format. Please provide a valid email address.');
  }

  if (!isValidPassword(password)) {
    errors.push('Password must be 8–16 characters long, contain at least one uppercase letter and one special character.');
  }

  if (!isValidAddress(address)) {
    errors.push('Address is required and must not exceed 400 characters.');
  }

  if (role && !['admin', 'user', 'store_owner'].includes(role)) {
    errors.push('Role must be one of: admin, user, store_owner.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0] });
  }

  next();
};

// Middleware for password change
export const validatePasswordChange = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const errors = [];

  if (!currentPassword) {
    errors.push('Current password is required.');
  }

  if (!isValidPassword(newPassword)) {
    errors.push('New password must be 8–16 characters long, contain at least one uppercase letter and one special character.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0] });
  }

  next();
};

// Middleware for store creation
export const validateStoreCreation = (req, res, next) => {
  const { name, email, address } = req.body;
  const errors = [];

  if (!isValidName(name)) {
    errors.push('Store name must be between 20 and 60 characters.');
  }

  if (!isValidEmail(email)) {
    errors.push('Invalid store email format.');
  }

  if (!isValidAddress(address)) {
    errors.push('Store address is required and must not exceed 400 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0] });
  }

  next();
};

// Middleware for rating submission
export const validateRating = (req, res, next) => {
  const { rating } = req.body;

  if (!isValidRating(rating)) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be an integer between 1 and 5.',
    });
  }

  next();
};
