"use client";
import React, { useMemo } from "react";
import { Box, Typography, Divider, Paper } from "@mui/material";
import { FaChartLine, FaTrophy, FaCoins, FaPercentage } from "react-icons/fa";

const BettingStats = ({ history }) => {
    const stats = useMemo(() => {
        if (!history || history.length === 0) return null;

        const toNumber = (value) => {
            const parsed = typeof value === "number" ? value : parseFloat(value ?? 0);
            return Number.isFinite(parsed) ? parsed : 0;
        };

        const totalWagered = history.reduce(
            (sum, bet) => sum + toNumber(bet.amount ?? bet.betAmount),
            0
        );
        const totalPayout = history.reduce(
            (sum, bet) => sum + toNumber(bet.payout),
            0
        );
        const winCount = history.reduce((sum, bet) => {
            if (typeof bet.win === "boolean") {
                return sum + (bet.win ? 1 : 0);
            }

            return sum + (toNumber(bet.payout) > 0 ? 1 : 0);
        }, 0);

        const winRate = history.length > 0 ? ((winCount / history.length) * 100).toFixed(1) : "0.0";
        const netProfit = totalPayout - totalWagered;
        const avgBet = history.length > 0 ? (totalWagered / history.length).toFixed(4) : "0.0000";
        const maxWin = Math.max(0, ...history.map((bet) => toNumber(bet.payout))).toFixed(4);

        return { winRate, netProfit, avgBet, maxWin };
    }, [history]);

    if (!stats) return null;

    return (
        <Box sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                    <FaChartLine /> Performance Stats
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3 }}>
                    <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block' }}>Win Rate</Typography>
                        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FaPercentage style={{ fontSize: '0.8rem' }} /> {stats.winRate}%
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block' }}>Net Profit</Typography>
                        <Typography variant="h5" sx={{ color: stats.netProfit >= 0 ? '#4caf50' : '#f44336', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FaCoins style={{ fontSize: '0.8rem' }} /> {stats.netProfit.toFixed(4)}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block' }}>Avg Bet</Typography>
                        <Typography variant="h5">
                            {stats.avgBet}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block' }}>Max Win</Typography>
                        <Typography variant="h5" sx={{ color: '#ffc107', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FaTrophy style={{ fontSize: '0.8rem' }} /> {stats.maxWin}
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default BettingStats;
