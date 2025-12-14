'use client';
import { dbService, Account, Transaction, useDatabase } from '../lib/database';
import { useEffect } from 'react';
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Plus, MoreVertical, Trash2, Lock, DollarSign, Building2, TrendingUp, ChevronLeft, ChevronRight, Receipt } from 'lucide-react';

export default function Dashboard() {
  const { isReady } = useDatabase();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timePeriod, setTimePeriod] = useState('This month');

  // Load data from database
  useEffect(() => {
    if (isReady) {
      loadAccounts();
      loadTransactions();
    }
  }, [isReady]);

  const loadAccounts = async () => {
    try {
      const dbAccounts = await dbService.getAllAccounts();
      setAccounts(dbAccounts);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const dbTransactions = await dbService.getAllTransactions();
      setTransactions(dbTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  // Calculate balance trend data
  const getBalanceTrendData = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    const data = [];
    for (let day = 1; day <= daysInMonth; day += 5) {
      const date = new Date(now.getFullYear(), now.getMonth(), day);
      data.push({
        date: `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`,
        balance: totalBalance
      });
    }
    return data;
  };

  // Get recent transactions for display
  const getRecentTransactions = () => {
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(trans => {
        const account = accounts.find(acc => acc.id === trans.accountId);
        return {
          ...trans,
          accountName: account?.name || 'Unknown',
        };
      });
  };

  const totalBalance = accounts.reduce((sum, acc) => {
    if (acc.currency === 'ZAR') return sum + acc.balance;
    return sum + (acc.balance * 18); // Simple USD to ZAR conversion
  }, 0);

  const getAccountIcon = (iconType: string) => {
    switch(iconType) {
      case 'cash':
        return <DollarSign size={32} />;
      case 'bank':
        return <Building2 size={32} />;
      case 'trending':
        return <TrendingUp size={32} />;
      default:
        return <DollarSign size={32} />;
    }
  };

  const GaugeChart = ({ label, value, max = 600 }: { label: string; value: number; max?: number }) => {
    const percentage = (value / max) * 100;
    const rotation = -90 + (percentage * 1.8);
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <path
              d="M 10 50 A 40 40 0 1 1 90 50"
              fill="none"
              stroke="#fee2e2"
              strokeWidth="8"
            />
            <path
              d="M 10 50 A 40 40 0 1 1 90 50"
              fill="none"
              stroke={percentage < 33 ? '#ef4444' : percentage < 66 ? '#f59e0b' : '#10b981'}
              strokeWidth="8"
              strokeDasharray={`${percentage * 1.26} 126`}
              strokeLinecap="round"
            />
          </svg>
          <div 
            className="absolute top-1/2 left-1/2 w-0.5 h-10 bg-gray-700 origin-bottom"
            style={{ 
              transform: `translate(-50%, -100%) rotate(${rotation}deg)`,
              transformOrigin: 'bottom center'
            }}
          />
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-gray-700 rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-sm text-gray-500 mt-2">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    );
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const balanceTrendData = getBalanceTrendData();
  const recentTransactions = getRecentTransactions();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Accounts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="rounded-lg p-4 text-white relative cursor-pointer hover:opacity-90 transition-opacity"
              style={{ backgroundColor: account.color }}
            >
              {account.locked && (
                <Lock size={16} className="absolute top-3 right-3" />
              )}
              <div className="flex items-center gap-3">
                {getAccountIcon(account.icon)}
                <div>
                  <p className="text-sm font-medium">{account.name}</p>
                  <p className="text-lg font-bold">
                    {account.currency} {account.balance.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          <button className="rounded-lg border-2 border-dashed border-gray-300 bg-white hover:bg-gray-50 h-24 flex flex-col items-center justify-center gap-2 text-gray-400 transition-colors">
            <Plus size={20} />
            <span className="text-sm">Add Account</span>
          </button>
        </div>

        {/* Time Period Selector */}
        <div className="flex items-center justify-between">
          <div></div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded transition-colors">
              <ChevronLeft size={20} />
            </button>
            <select 
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option>This month</option>
              <option>Last month</option>
              <option>This year</option>
            </select>
            <button className="p-2 hover:bg-gray-100 rounded transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors">
            <Plus size={16} />
            Add Card
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dashboard Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Dashboard</h2>
              <div className="flex gap-2">
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <MoreVertical size={16} />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <GaugeChart label="BALANCE" value={Math.round(totalBalance)} />
              <GaugeChart label="CASH FLOW" value={0} />
              <GaugeChart label="SPENDING" value={0} />
            </div>
          </div>

          {/* Balance Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Balance Trend</h2>
              <div className="flex gap-2">
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <MoreVertical size={16} />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">THIS MONTH</p>
            <div className="flex items-center justify-between mb-4">
              <p className="text-2xl font-bold">ZAR {totalBalance.toFixed(2)}</p>
              <p className="text-sm text-gray-500">vs previous period → 0%</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={balanceTrendData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fill="url(#colorBalance)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Balance by Currencies */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Balance by Currencies</h2>
              <div className="flex gap-2">
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <MoreVertical size={16} />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm">South African Rand</p>
                <p className="text-sm font-semibold">ZAR {totalBalance.toFixed(2)}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-cyan-500 h-3 rounded-full transition-all"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Cash Flow */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Cash Flow</h2>
              <div className="flex gap-2">
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <MoreVertical size={16} />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">THIS MONTH</p>
            <div className="flex items-center justify-between mb-6">
              <p className="text-2xl font-bold">ZAR 0.00</p>
              <p className="text-sm text-gray-500">vs previous period ← 0%</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm">Income</p>
              <p className="text-sm font-semibold">ZAR 0.00</p>
            </div>
          </div>

          {/* Last Records */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Last Records</h2>
              <div className="flex gap-2">
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <MoreVertical size={16} />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No transactions yet</p>
                <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Add Transaction
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xl text-gray-500">?</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{record.description}</p>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <p className="text-xs text-gray-500">{record.accountName}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${record.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {record.amount < 0 ? '-' : '+'}ZAR {Math.abs(record.amount).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                      {record.hasReceipt && (
                        <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded flex items-center">
                          <Receipt size={14} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}