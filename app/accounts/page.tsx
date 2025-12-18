"use client";
import React, { useState, useEffect } from 'react';
import { dbService, Account, Transaction, useDatabase } from '../lib/database';
import { Plus, MoreVertical, DollarSign, Building2, TrendingUp, CreditCard, PiggyBank, Shield, HandCoins, Home, AlertCircle, Eye, EyeOff, ChevronLeft, X, GripVertical, Check } from 'lucide-react';

// Add Account Modal Component
const AddAccountModal: React.FC<{ isOpen: boolean; onClose: () => void; onAccountAdded: () => void }> = ({ isOpen, onClose, onAccountAdded }) => {
  const [step, setStep] = useState('method');
  const [method, setMethod] = useState<string | null>(null);
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('General');
  const [initialValue, setInitialValue] = useState('0');
  const [currency, setCurrency] = useState('ZAR');
  const [selectedColor, setSelectedColor] = useState('#ef4444');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ACCOUNT_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#78716c'
  ];

  const CURRENCIES = ['ZAR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'];

  const handleMethodSelect = (selectedMethod: string) => {
    setMethod(selectedMethod);
    setStep('form');
  };

  const handleSubmit = async () => {
    if (!accountName) return;
    
    setIsSubmitting(true);

    try {
      const iconMap = {
        'Cash': 'cash',
        'Credit Card': 'credit-card',
        'General': 'bank',
        'Savings': 'piggy-bank',
        'Insurance': 'shield',
        'Investment': 'trending',
        'Loan': 'hand-coins',
        'Mortgage': 'home',
        'Overdraft': 'alert-circle'
      };

      const icon = iconMap[accountType as keyof typeof iconMap] ?? 'bank';

      const newAccount = {
        name: accountName,
        accountNumber: accountNumber,
        balance: parseFloat(initialValue) || 0,
        currency: currency,
        color: selectedColor,
        icon,
        locked: accountType === 'Investment',
      };

      await dbService.addAccount(newAccount);
      try { window.localStorage.removeItem('bp-db-user-reset'); } catch (_) {}

      setAccountName('');
      setAccountNumber('');
      setAccountType('General');
      setInitialValue('0');
      setCurrency('ZAR');
      setSelectedColor(ACCOUNT_COLORS[0]);
      setStep('method');
      setMethod(null);
      
      onAccountAdded();
      onClose();
    } catch (error) {
      console.error('Failed to add account:', error);
      alert('Failed to add account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold">Add Account</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {step === 'method' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button onClick={() => handleMethodSelect('bank-sync')} className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 size={32} className="text-blue-600" />
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">Bank Sync</h3>
                <p className="text-sm text-gray-600">Connect your bank accounts and synchronize your transactions automatically.</p>
              </button>

              <button onClick={() => handleMethodSelect('manual')} className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <HandCoins size={32} className="text-blue-600" />
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">Manual Input</h3>
                <p className="text-sm text-gray-600">Update your account manually. You can connect your bank or import later.</p>
              </button>

              <button onClick={() => handleMethodSelect('imports')} className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign size={32} className="text-blue-600" />
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">Imports</h3>
                <p className="text-sm text-gray-600">Upload your transaction history by importing CSV, Excel, OFX or other files.</p>
              </button>

              <button onClick={() => handleMethodSelect('investments')} className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp size={32} className="text-blue-600" />
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">Investments</h3>
                <p className="text-sm text-gray-600">Create a tracking account to monitor your stock & ETF portfolio with automatic asset price updates.</p>
              </button>
            </div>
          )}

          {step === 'form' && (
            <div className="space-y-6">
              <div className="mb-4">
                <button onClick={() => setStep('method')} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  ← Back to method selection
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Name *</label>
                <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., My Savings Account" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account Number (Optional)</label>
                <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., 1234567890" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Type *</label>
                <select value={accountType} onChange={(e) => setAccountType(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="General">General</option>
                  <option value="Savings">Savings</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Investment">Investment</option>
                  <option value="Loan">Loan</option>
                  <option value="Mortgage">Mortgage</option>
                  <option value="Overdraft">Overdraft</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Initial Value</label>
                  <input type="number" step="0.01" value={initialValue} onChange={(e) => setInitialValue(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="0.00" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {CURRENCIES.map(curr => <option key={curr} value={curr}>{curr}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Account Color *</label>
                <div className="grid grid-cols-9 gap-2">
                  {ACCOUNT_COLORS.map(color => (
                    <button key={color} type="button" onClick={() => setSelectedColor(color)} className="w-10 h-10 rounded-lg transition-all hover:scale-110 relative" style={{ backgroundColor: color }}>
                      {selectedColor === color && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check size={20} className="text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={onClose} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                <button onClick={handleSubmit} disabled={isSubmitting || !accountName} className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Adding...' : 'Add Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Account Detail Modal
const AccountDetailModal: React.FC<{ account: Account; onClose: () => void; onUpdate: () => void; onDelete: () => void }> = ({ account, onClose, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'records'>('balance');
  const [isEditing, setIsEditing] = useState(false);
  const [editedAccount, setEditedAccount] = useState<Account>(account);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  
  useEffect(() => {
    if (account && activeTab === 'records') {
      loadTransactions();
    }
  }, [account, activeTab]);

  const loadTransactions = async () => {
    try {
      const allTransactions = await dbService.getAllTransactions();
      const accountTransactions = allTransactions.filter(t => t.accountId === account.id);
      setTransactions(accountTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (account.id == null) {
        console.error('Account id is missing');
        return;
      }
      await dbService.updateAccount(account.id, editedAccount);
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update account:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        if (account.id == null) {
          console.error('Account id is missing');
          return;
        }
        await dbService.deleteAccount(account.id);
        onDelete();
        onClose();
      } catch (error) {
        console.error('Failed to delete account:', error);
      }
    }
  };

  const getAccountIcon = (iconType: string) => {
    const iconMap = {
      'cash': DollarSign,
      'bank': Building2,
      'trending': TrendingUp,
      'credit-card': CreditCard,
      'piggy-bank': PiggyBank,
      'shield': Shield,
      'hand-coins': HandCoins,
      'home': Home,
      'alert-circle': AlertCircle,
    };
    const Icon = (iconMap as Record<string, any>)[iconType] || Building2;
    return <Icon size={48} />;
  };

  if (!account) return null;

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onClose} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ChevronLeft size={24} />
            <span className="text-2xl font-bold">Account Detail</span>
          </button>
          <div className="flex gap-3">
            {!isEditing ? (
              <>
                <button onClick={() => setShowEditModal(true)} className="px-6 py-2 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors font-medium">Edit</button>
                <button onClick={handleDelete} className="px-6 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-medium">Delete</button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                <button onClick={handleSave} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">Save</button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: account.color }}>
              {getAccountIcon(account.icon)}
            </div>
            <div>
              {isEditing ? (
                <input type="text" value={editedAccount.name} onChange={(e) => setEditedAccount({...editedAccount, name: e.target.value})} className="text-xl font-bold mb-1 px-2 py-1 border border-gray-300 rounded" />
              ) : (
                <>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-xl font-bold">{account.name}</p>
                </>
              )}
              <p className="text-sm text-gray-500 mt-2">Type</p>
              <p className="text-gray-900">{account.icon.replace('-', ' ')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <div className="flex">
              <button onClick={() => setActiveTab('balance')} className={`px-6 py-4 font-medium ${activeTab === 'balance' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}>Balance</button>
              <button onClick={() => setActiveTab('records')} className={`px-6 py-4 font-medium ${activeTab === 'records' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}>Records</button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'balance' && (
              <div>
                <div className="mb-6">
                  <p className="text-sm text-gray-500">Today</p>
                  <p className="text-3xl font-bold">{account.currency} {account.balance.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-1">vs previous period → 0%</p>
                </div>
                <div className="h-96 flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-gray-400">Balance trend chart will appear here</p>
                </div>
              </div>
            )}

            {activeTab === 'records' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-lg font-semibold">Found {transactions.length} records</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Edit</button>
                    <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Export</button>
                    <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Delete</button>
                  </div>
                </div>

                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No records found for this account</div>
                  ) : (
                    transactions.map(transaction => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <input type="checkbox" className="w-4 h-4" />
                          <div>
                            <p className="font-medium">{transaction.description || 'Unknown'}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: account.color }} />
                              <span>{account.name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {transaction.amount < 0 ? '-' : '+'}ZAR {Math.abs(transaction.amount).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Accounts Page
export default function AccountsPage() {
  const { isReady } = useDatabase();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isReady) loadAccounts();
  }, [isReady]);

  const loadAccounts = async () => {
    try {
      const dbAccounts = await dbService.getAllAccounts();
      setAccounts(dbAccounts as Account[]);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm('This will permanently delete all local data for Budget Planner. Continue?')) return;
    setIsResetting(true);
    try {
      await dbService.clearAllData();
      try {
        // Mark that the user intentionally reset the DB so we don't auto-reseed defaults
        window.localStorage.setItem('bp-db-user-reset', 'true');
        window.localStorage.removeItem('bp-db-seeded');
      } catch (_) {}
      await loadAccounts();
      setSelectedAccount(null);
      alert('Database reset complete.');
    } catch (err) {
      console.error('Failed to reset database:', err);
      alert('Failed to reset database. See console for details.');
    } finally {
      setIsResetting(false);
    }
  };

  const getAccountIcon = (iconType: string) => {
    const iconMap = {
      'cash': DollarSign,
      'bank': Building2,
      'trending': TrendingUp,
      'credit-card': CreditCard,
      'piggy-bank': PiggyBank,
      'shield': Shield,
      'hand-coins': HandCoins,
      'home': Home,
      'alert-circle': AlertCircle,
    };

    // Edit Account Modal Component
    const EditAccountModal: React.FC<{ account: Account; onClose: () => void; onSave: (account: Account) => void }> = ({ account, onClose, onSave }) => {
      const [editedAccount, setEditedAccount] = useState<Account>(account);
      const [selectedColor, setSelectedColor] = useState(account.color);

      const ACCOUNT_COLORS = [
        '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
        '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
        '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#78716c'
      ];

      const CURRENCIES = ['ZAR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'];

      const accountTypes = [
        { value: 'bank', label: 'Checking account', icon: 'bank' },
        { value: 'cash', label: 'Cash', icon: 'cash' },
        { value: 'piggy-bank', label: 'Savings', icon: 'piggy-bank' },
        { value: 'credit-card', label: 'Credit Card', icon: 'credit-card' },
        { value: 'trending', label: 'Investment account', icon: 'trending' },
        { value: 'shield', label: 'Insurance', icon: 'shield' },
        { value: 'hand-coins', label: 'Loan', icon: 'hand-coins' },
        { value: 'home', label: 'Mortgage', icon: 'home' },
        { value: 'alert-circle', label: 'Overdraft', icon: 'alert-circle' },
      ];

      const handleSave = () => {
        onSave({ ...editedAccount, color: selectedColor });
      };

      return (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4" style={{ backgroundColor: 'transparent' }}>
          <div className="backdrop-blur-sm bg-white/80 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Edit Account</h2>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={editedAccount.name}
                    onChange={(e) => setEditedAccount({ ...editedAccount, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="relative">
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2">
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: selectedColor }} />
                      <span className="text-sm text-gray-600">{selectedColor}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-9 gap-1 p-2 border border-gray-200 rounded-lg bg-gray-50">
                      {ACCOUNT_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className="w-8 h-8 rounded transition-all hover:scale-110 relative"
                          style={{ backgroundColor: color }}
                        >
                          {selectedColor === color && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check size={16} className="text-white" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account type</label>
                <select
                  value={editedAccount.icon}
                  onChange={(e) => setEditedAccount({ ...editedAccount, icon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {accountTypes.map(type => (
                    <option key={type.value} value={type.icon}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Initial Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editedAccount.balance}
                    onChange={(e) => setEditedAccount({ ...editedAccount, balance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    value={editedAccount.currency}
                    onChange={(e) => setEditedAccount({ ...editedAccount, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {CURRENCIES.map(curr => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editedAccount.locked || false}
                    onChange={(e) => setEditedAccount({ ...editedAccount, locked: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Exclude from statistics</span>
                  <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center text-gray-500 text-xs">i</div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Archive</span>
                  <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center text-gray-500 text-xs">i</div>
                </label>
              </div>

              <button
                onClick={handleSave}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      );
    };
    const Icon = (iconMap as Record<string, any>)[iconType] || Building2;
    return <Icon size={24} />;
  };

  const totalBalance = accounts.reduce((sum, acc) => {
    if (acc.currency === 'ZAR') return sum + acc.balance;
    return sum + (acc.balance * 18);
  }, 0);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newAccounts = [...accounts];
    const draggedAccount = newAccounts[draggedIndex];
    newAccounts.splice(draggedIndex, 1);
    newAccounts.splice(index, 0, draggedAccount);
    
    setAccounts(newAccounts);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getAccountTypeLabel = (icon: string) => {
    const typeMap = {
      'cash': 'Cash',
      'bank': 'Checking account',
      'trending': 'Investment account',
      'credit-card': 'Credit Card',
      'piggy-bank': 'Savings',
      'shield': 'Insurance',
      'hand-coins': 'Loan',
      'home': 'Mortgage',
      'alert-circle': 'Overdraft',
    };
    return (typeMap as Record<string, string>)[icon] || 'General';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
            <p className="text-gray-600 mt-1">Total Balance: <span className="font-semibold">ZAR {totalBalance.toFixed(2)}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 space-y-4">
              <button onClick={() => setIsModalOpen(true)} className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2">
                <Plus size={20} />
                Add
              </button>

              <button onClick={() => setShowArchived(!showArchived)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2">
                {showArchived ? <EyeOff size={20} /> : <Eye size={20} />}
                {showArchived ? 'Hide' : 'Show'} Archived
              </button>

              <button onClick={handleResetDatabase} disabled={isResetting} className="w-full px-4 py-3 bg-red-50 border border-red-300 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center justify-center gap-2">
                {isResetting ? (
                  <svg className="animate-spin h-5 w-5 text-red-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                ) : (
                  <svg viewBox="0 0 20 20" className="h-5 w-5"><path fill="currentColor" d="M10 2a8 8 0 100 16 8 8 0 000-16zM6 9h8v2H6V9z" /></svg>
                )}
                Reset DB
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {accounts.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 size={40} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No accounts yet</h3>
                  <p className="text-gray-600 mb-6">Get started by adding your first account</p>
                  <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium inline-flex items-center gap-2">
                    <Plus size={20} />
                    Add Your First Account
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {accounts.map((account, index) => (
                    <div key={account.id} draggable onDragStart={() => handleDragStart(index)} onDragOver={(e) => handleDragOver(e, index)} onDragEnd={handleDragEnd} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4 cursor-move">
                      <GripVertical size={20} className="text-gray-400" />
                      
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: account.color }}>
                        {getAccountIcon(account.icon)}
                      </div>

                      <div className="flex-1 cursor-pointer" onClick={() => setSelectedAccount(account)}>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{account.name}</h3>
                          {account.locked && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">Locked</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{getAccountTypeLabel(account.icon)}</p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{account.currency} {account.balance.toFixed(2)}</p>
                      </div>

                      <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                        <MoreVertical size={20} className="text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAccountAdded={loadAccounts} />

      {selectedAccount && (
        <AccountDetailModal account={selectedAccount} onClose={() => setSelectedAccount(null)} onUpdate={loadAccounts} onDelete={loadAccounts} />
      )}
    </div>
  );
}