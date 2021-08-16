export const Messages = {
  INPUT_VALIDATION_FAILED: 'Input data validation failed',
  REQUIRED_VALUE_MISSING: 'Required value is missing',
  UNKNOWN_ERROR: 'Something went wrong',
  USER_EXISTS: 'User with this email already registered',
  USER_NOT_FOUND: 'User with this id not found in database',
  USER_VALIDATION_FILED: (errors) => `User data validation failed with errors: ${errors.join(', ')}`,
};
