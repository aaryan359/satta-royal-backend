"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const Market_model_1 = __importDefault(require("../models/Market.model"));
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
class MarketController {
}
_a = MarketController;
/**
 * Get current market result
 */
MarketController.GetResult = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const market = yield Market_model_1.default.findOne({}).sort({ result_declared_at: -1 });
        console.log("market is", market);
        if (!market) {
            return ApiResponse_1.default.error(res, {
                message: 'No result available',
                statusCode: 500,
            });
        }
        ApiResponse_1.default.success(res, {
            data: {
                market: market.name,
                currentResult: market.current_winning_value,
                declaredAt: market.result_declared_at,
            },
            statusCode: 201,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * Get result history
 */
MarketController.GetResultHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit = 10 } = req.query;
        const market = yield Market_model_1.default.findOne({
            name: req.params.marketName,
        })
            .select('result_history')
            .limit(Number(limit));
        if (!market) {
            return ApiResponse_1.default.error(res, {
                message: 'Market not found',
            });
        }
        ApiResponse_1.default.success(res, {
            data: market.result_history.reverse(),
            statusCode: 201,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = MarketController;
