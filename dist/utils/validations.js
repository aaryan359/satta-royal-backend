"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBankName = exports.validateAccountNumber = exports.validateIFSC = void 0;
const validateIFSC = (ifsc) => {
    console.log(ifsc, "ifsc");
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc);
};
exports.validateIFSC = validateIFSC;
// You might also want to add these validation helpers:
const validateAccountNumber = (accountNumber) => {
    return /^\d{9,18}$/.test(accountNumber);
};
exports.validateAccountNumber = validateAccountNumber;
const validateBankName = (bankName) => {
    return bankName.trim().length >= 3 && bankName.trim().length <= 50;
};
exports.validateBankName = validateBankName;
