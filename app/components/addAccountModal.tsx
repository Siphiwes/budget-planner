'use client';
import React, { useState } from 'react';
import { X, Building2, Hand, FileUp, TrendingUp, Check } from 'lucide-react';
import { dbService, Account } from '../lib/database';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountAdded: () => void;
}

type AccountType = 'Cash' | 'Credit Card' | 'General' | 'Savings' | 'Insurance' | 'Investment' | 'Loan' | 'Mortgage' | 'Overdraft';
type AddMethod = 'bank-sync' | 'manual' | 'imports' | 'investments' | null;

const ACCOUNT_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#78716c'
];

const CURRENCIES = [
  'ZAR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'
];

export default function AddAccountModal({ isOpen, onClose, onAccountAdded }: AddAccountModalProps) {
  const [step, setStep] = useState<'method' | 'form'>('method');
  const [method, setMethod] = useState<AddMethod>(null);
  
  // Form fields
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('General');
  const [initialValue, setInitialValue] = useState('0');
  const [currency, setCurrency] = useState('ZAR');
  const [selectedColor, setSelectedColor] = useState(ACCOUNT_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMethodSelect = (selectedMethod: AddMethod) => {
    setMethod(selectedMethod);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const iconMap: Record<AccountType, string> = {
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

      const newAccount: Account = {
        name: accountName,
        balance: parseFloat(initialValue) || 0,
        currency: currency,
        color: selectedColor,
        icon: iconMap[accountType],
        locked: accountType === 'Investment',
      };

      await dbService.addAccount(newAccount);
      
      // Reset form
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

  const handleBack = () => {
    setStep('method');
    setMethod(null);
  };

  const handleCloseModal = () => {
    setStep('method');
    setMethod(null);
    setAccountName('');
    setAccountNumber('');
    setAccountType('General');
    setInitialValue('0');
    setCurrency('ZAR');
    setSelectedColor(ACCOUNT_COLORS[0]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold">Add Account</h2>
          <button
            onClick={handleCloseModal}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'method' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Bank Sync */}
              <button
                onClick={() => handleMethodSelect('bank-sync')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 size={32} className="text-blue-600" />
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">Bank Sync</h3>
                <p className="text-sm text-gray-600">
                  Connect your bank accounts and synchronize your transactions automatically.
                </p>
              </button>

              {/* Manual Input */}
              <button
                onClick={() => handleMethodSelect('manual')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Hand size={32} className="text-blue-600" />
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">Manual Input</h3>
                <p className="text-sm text-gray-600">
                  Update your account manually. You can connect your bank or import later.
                </p>
              </button>

              {/* Imports */}
              <button
                onClick={() => handleMethodSelect('imports')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileUp size={32} className="text-blue-600" />
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">Imports</h3>
                <p className="text-sm text-gray-600">
                  Upload your transaction history by importing CSV, Excel, OFX or other files.
                </p>
              </button>

              {/* Investments */}
              <button
                onClick={() => handleMethodSelect('investments')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp size={32} className="text-blue-600" />
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">Investments</h3>
                <p className="text-sm text-gray-600">
                  Create a tracking account to monitor your stock & ETF portfolio with automatic asset price updates.
                </p>
              </button>
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  ← Back to method selection
                </button>
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name *
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., My Savings Account"
                  required
                />
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Account Number (Optional)
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 1234567890"
                />
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type *
                </label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as AccountType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
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

              {/* Initial Value and Currency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={initialValue}
                    onChange={(e) => setInitialValue(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {CURRENCIES.map(curr => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Account Color *
                </label>
                <div className="grid grid-cols-9 gap-2">
                  {ACCOUNT_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className="w-10 h-10 rounded-lg transition-all hover:scale-110 relative"
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check size={20} className="text-white drop-shadow-lg" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !accountName}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding...' : 'Add Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}