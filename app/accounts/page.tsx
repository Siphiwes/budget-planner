'use client';
import React, { useState, useEffect } from 'react';
import { dbService, Account, useDatabase } from '../lib/database';
import { Plus, MoreVertical, DollarSign, Building2, TrendingUp, CreditCard, PiggyBank, Shield, HandCoins, Home, AlertCircle, Eye, EyeOff } from 'lucide-react';
import AddAccountModal from '../components/addAccountModal';

export default function AccountsPage() {
  const { isReady } = useDatabase();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isReady) {
      loadAccounts();
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

  const getAccountIcon = (iconType: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'cash': <DollarSign size={24} />,
      'bank': <Building2 size={24} />,
      'trending': <TrendingUp size={24} />,
      'credit-card': <CreditCard size={24} />,
      'piggy-bank': <PiggyBank size={24} />,
      'shield': <Shield size={24} />,
      'hand-coins': <HandCoins size={24} />,
      'home': <Home size={24} />,
      'alert-circle': <AlertCircle size={24} />,
    };
    return iconMap[iconType] || <Building2 size={24} />;
  };

  const totalBalance = accounts.reduce((sum, acc) => {
    if (acc.currency === 'ZAR') return sum + acc.balance;
    return sum + (acc.balance * 18); // Simple conversion
  }, 0);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
            <p className="text-gray-600 mt-1">
              Total Balance: <span className="font-semibold">ZAR {totalBalance.toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* Left Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 space-y-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add
              </button>

              <button
                onClick={() => setShowArchived(!showArchived)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                {showArchived ? <EyeOff size={20} /> : <Eye size={20} />}
                {showArchived ? 'Hide' : 'Show'} Archived
              </button>
            </div>
          </div>

          {/* Accounts List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {accounts.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 size={40} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No accounts yet</h3>
                  <p className="text-gray-600 mb-6">
                    Get started by adding your first account
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium inline-flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add Your First Account
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {accounts.map((account) => (
                    <div
                      key={account.id}
                      className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* Account Icon */}
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: account.color }}
                        >
                          {getAccountIcon(account.icon)}
                        </div>

                        {/* Account Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{account.name}</h3>
                            {account.locked && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                Locked
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{account.icon}</p>
                        </div>

                        {/* Balance */}
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {account.currency} {account.balance.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">{account.currency}</p>
                        </div>

                        {/* Menu */}
                        <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                          <MoreVertical size={20} className="text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Account Modal */}
      <AddAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAccountAdded={loadAccounts}
      />
    </div>
  );
}