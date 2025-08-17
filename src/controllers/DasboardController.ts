import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import ApiResponse from '../utils/ApiResponse';
import MarketModel from '../models/Market.model';
import BetModel from '../models/Bet.model';
import TransactionModel from '../models/Transaction.model';

class DashboardController {
    static getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Calculate date ranges
            const currentDate = new Date();
            const last30Days = new Date();
            last30Days.setDate(last30Days.getDate() - 30);
            
            const previousPeriodStart = new Date(last30Days);
            previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);

            // 1. Total Revenue
            const [totalRevenue, prevTotalRevenue] = await Promise.all([
                BetModel.aggregate([
                    { $match: { bet_placed_at: { $gte: last30Days } } },
                    { $group: { _id: null, total: { $sum: "$amount" } } }
                ]),
                BetModel.aggregate([
                    { $match: { bet_placed_at: { $gte: previousPeriodStart, $lt: last30Days } } },
                    { $group: { _id: null, total: { $sum: "$amount" } } }
                ])
            ]);

            const revenue = totalRevenue[0]?.total || 0;
            const prevRevenue = prevTotalRevenue[0]?.total || 0;
            const revenueChange = prevRevenue > 0 
                ? ((revenue - prevRevenue) / prevRevenue) * 100 
                : revenue > 0 ? 100 : 0;

            // 2. Active Users
            const [activeUsers, prevActiveUsers] = await Promise.all([
                BetModel.distinct('user', { bet_placed_at: { $gte: last30Days } }),
                BetModel.distinct('user', { bet_placed_at: { $gte: previousPeriodStart, $lt: last30Days } })
            ]);

            const activeUsersCount = activeUsers.length;
            const prevActiveUsersCount = prevActiveUsers.length;
            const activeUsersChange = prevActiveUsersCount > 0 
                ? ((activeUsersCount - prevActiveUsersCount) / prevActiveUsersCount) * 100 
                : activeUsersCount > 0 ? 100 : 0;

            // 3. Open Markets
            const openMarkets = await MarketModel.countDocuments({ status: 'open' });
            const prevOpenMarkets = await MarketModel.countDocuments({ 
                status: 'open',
                createdAt: { $lt: last30Days }
            });
            const openMarketsChange = prevOpenMarkets > 0 
                ? ((openMarkets - prevOpenMarkets) / prevOpenMarkets) * 100 
                : openMarkets > 0 ? 100 : 0;

            // 4. Betting Volume
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            const [bettingVolume, prevBettingVolume] = await Promise.all([
                BetModel.aggregate([
                    { $match: { bet_placed_at: { $gte: sevenDaysAgo } } },
                    { $group: { _id: null, total: { $sum: "$amount" } } }
                ]),
                BetModel.aggregate([
                    { 
                        $match: { 
                            bet_placed_at: { 
                                $gte: new Date(new Date(sevenDaysAgo).setDate(sevenDaysAgo.getDate() - 7)),
                                $lt: sevenDaysAgo
                            } 
                        } 
                    },
                    { $group: { _id: null, total: { $sum: "$amount" } } }
                ])
            ]);

            const volume = bettingVolume[0]?.total || 0;
            const prevVolume = prevBettingVolume[0]?.total || 0;
            const volumeChange = prevVolume > 0 
                ? ((volume - prevVolume) / prevVolume) * 100 
                : volume > 0 ? 100 : 0;

            // 5. Recent Markets
            const recentMarkets = await MarketModel.find()
                .sort({ createdAt: -1 })
                .limit(4)
                .select('name status odds');

            // 6. Recent Transactions
            const recentTransactions = await TransactionModel.find()
                .sort({ createdAt: -1 })
                .limit(4)
                .populate<{ user: { username: string } }>('user', 'username')
                .select('user type amount status');

            // 7. Top Performing Users
            const topUsers = await BetModel.aggregate([
                {
                    $match: {
                        status: { $in: ['won', 'lost'] },
                        bet_placed_at: { $gte: last30Days }
                    }
                },
                {
                    $group: {
                        _id: "$user",
                        totalBets: { $sum: 1 },
                        totalWins: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "won"] }, 1, 0]
                            }
                        },
                        totalPayout: { $sum: "$payout" },
                        totalAmount: { $sum: "$amount" }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: "$user" },
                {
                    $project: {
                        username: "$user.username",
                        totalBets: 1,
                        winRate: {
                            $multiply: [
                                { $divide: ["$totalWins", "$totalBets"] },
                                100
                            ]
                        },
                        netProfit: {
                            $subtract: ["$totalPayout", "$totalAmount"]
                        }
                    }
                },
                { $sort: { netProfit: -1 } },
                { $limit: 5 }
            ]);

            // Format the response
            const response = {
                stats: [
                    {
                        title: "Total Revenue",
                        value: `₹${revenue.toLocaleString('en-IN')}`,
                        change: parseFloat(revenueChange.toFixed(1)),
                        icon: "DollarSign"
                    },
                    {
                        title: "Active Users",
                        value: activeUsersCount.toLocaleString('en-IN'),
                        change: parseFloat(activeUsersChange.toFixed(1)),
                        icon: "Users"
                    },
                    {
                        title: "Open Markets",
                        value: openMarkets.toString(),
                        change: parseFloat(openMarketsChange.toFixed(1)),
                        icon: "BarChart3"
                    },
                    {
                        title: "Betting Volume",
                        value: `₹${volume.toLocaleString('en-IN')}`,
                        change: parseFloat(volumeChange.toFixed(1)),
                        icon: "TrendingUp"
                    }
                ],
                recentMarkets: recentMarkets.map((market:any) => ({
                    marketName: market.name,
                    status: market.status,
                    odds: market.odds
                })),
                recentTransactions: recentTransactions.map(tx => ({
                    user: tx.user?.username || 'Unknown',
                    type: tx.type,
                    amount: tx.type === 'deposit' 
                        ? `+₹${tx.amount.toLocaleString('en-IN')}` 
                        : `-₹${tx.amount.toLocaleString('en-IN')}`,
                    status: tx.status
                })),
                topUsers: topUsers.map(user => ({
                    user: user.username,
                    totalBets: user.totalBets,
                    winRate: `${user.winRate.toFixed(0)}%`,
                    netProfit: `₹${Math.max(0, user.netProfit).toLocaleString('en-IN')}`,
                    trend: user.netProfit > 0 ? "up" : "down"
                }))
            };

            return ApiResponse.success(res, {
                message: "Dashboard stats retrieved successfully",
                data: response,
                statusCode: 200
            });
        } catch (error) {
            next(error);
        }
    }
}

export default DashboardController;