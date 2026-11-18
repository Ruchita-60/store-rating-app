export const validateName = (name) => {
  if (!name || typeof name !== 'string') return 'Name is required.';
  const len = name.trim().length;
  if (len < 20) return `Name must be at least 20 characters long (currently ${len}).`;
  if (len > 60) return `Name cannot exceed 60 characters (currently ${len}).`;
  return null;
};

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return 'Email is required.';
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) return 'Please enter a valid email address.';
  return null;
};

export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return 'Password is required.';
  if (password.length < 8 || password.length > 16) {
    return `Password must be 8–16 characters long (currently ${password.length}).`;
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter (A-Z).';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&*...).';
  }
  return null;
};

export const validateAddress = (address) => {
  if (!address || typeof address !== 'string') return 'Address is required.';
  const len = address.trim().length;
  if (len === 0) return 'Address is required.';
  if (len > 400) return `Address cannot exceed 400 characters (currently ${len}).`;
  return null;
};

export const validateRating = (rating) => {
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return 'Rating must be an integer between 1 and 5.';
  }
  return null;
};
