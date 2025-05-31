"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethod = exports.TransactionStatus = exports.TransactionType = void 0;
// Enum for transaction types (for better type safety)
var TransactionType;
(function (TransactionType) {
    TransactionType["DEPOSIT"] = "deposit";
    TransactionType["WITHDRAWAL"] = "withdrawal";
    TransactionType["BET_DEBIT"] = "bet_debit";
    TransactionType["BET_CREDIT"] = "bet_credit";
    TransactionType["BONUS"] = "bonus";
    TransactionType["REFUND"] = "refund";
    TransactionType["COMMISSION"] = "commission";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
// Enum for transaction status
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["PROCESSING"] = "processing";
    TransactionStatus["COMPLETED"] = "completed";
    TransactionStatus["FAILED"] = "failed";
    TransactionStatus["CANCELLED"] = "cancelled";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
// Enum for payment methods
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["UPI"] = "upi";
    PaymentMethod["BANK_TRANSFER"] = "bank_transfer";
    PaymentMethod["PAYTM"] = "paytm";
    PaymentMethod["PHONEPE"] = "phonepe";
    PaymentMethod["GOOGLEPAY"] = "googlepay";
    PaymentMethod["RAZORPAY"] = "razorpay";
    PaymentMethod["CASHFREE"] = "cashfree";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
