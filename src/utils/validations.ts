export const validateIFSC = (ifsc: string): boolean => {
  console.log(ifsc,"ifsc")
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifsc);
};

// You might also want to add these validation helpers:
export const validateAccountNumber = (accountNumber: string): boolean => {
  return /^\d{9,18}$/.test(accountNumber);
};

export const validateBankName = (bankName: string): boolean => {
  return bankName.trim().length >= 3 && bankName.trim().length <= 50;
};