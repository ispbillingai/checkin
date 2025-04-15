
// Generate a random PIN code of specified length
export const generatePinCode = (length = 5) => {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
};
