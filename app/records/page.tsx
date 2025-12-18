'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { dbService, Account, Transaction, useDatabase } from '../lib/database';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

type RecordTypeFilter = 'all' | 'income' | 'expense' | 'transfer';

const RecordsPage: React.FC = () => {
  const { isReady } = useDatabase();
  const searchParams = useSearchParams();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [search, setSearch] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<number | 'all'>('all');
  const [recordType, setRecordType] = useState<RecordTypeFilter>('all');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [includeTransfers, setIncludeTransfers] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  const [activeRangeTab, setActiveRangeTab] = useState<'custom' | 'weeks' | 'months' | 'years'>('custom');
  const [dateRangeLabel, setDateRangeLabel] = useState<string>('This month');
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [endDate, setEndDate] = useState<Date | null>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  });
  const [viewDate, setViewDate] = useState<Date>(() => new Date());
  const [selectedRecordIds, setSelectedRecordIds] = useState<number[]>([]);

  useEffect(() => {
    if (!isReady) return;
    loadAccounts();
    loadTransactions();
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

  // Open the add-record modal when coming from header or query string
  useEffect(() => {
    if (searchParams?.get('open') === '1') {
      setIsAddModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleOpenModal = () => setIsAddModalOpen(true);
    if (typeof window !== 'undefined') {
      window.addEventListener('open-record-modal', handleOpenModal);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('open-record-modal', handleOpenModal);
      }
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const account = accounts.find((a) => a.id === tx.accountId);
      const txDate = new Date(tx.date as any);

      if (selectedAccountId !== 'all' && tx.accountId !== selectedAccountId) {
        return false;
      }

      const matchesSearch =
        !search ||
        tx.description?.toLowerCase().includes(search.toLowerCase()) ||
        (tx.category || '').toLowerCase().includes(search.toLowerCase()) ||
        (account?.name || '').toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      // Record type filter based on sign of amount
      if (recordType === 'income' && tx.amount <= 0) return false;
      if (recordType === 'expense' && tx.amount >= 0) return false;
      if (!includeTransfers && recordType === 'transfer') {
        // placeholder for future transfer logic
      }

      const absAmount = Math.abs(tx.amount);
      if (minAmount && absAmount < parseFloat(minAmount)) return false;
      if (maxAmount && absAmount > parseFloat(maxAmount)) return false;

      if (startDate && txDate < startDate) return false;
      if (endDate && txDate > endDate) return false;

      return true;
    });
  }, [transactions, accounts, search, selectedAccountId, recordType, minAmount, maxAmount, includeTransfers, startDate, endDate]);

  // Clear selection when the filtered set changes
  useEffect(() => {
    setSelectedRecordIds([]);
  }, [filteredTransactions]);

  const setRange = (start: Date | null, end: Date | null, label: string) => {
    setStartDate(start);
    setEndDate(end);
    setDateRangeLabel(label);
  };

  const shiftMonth = (direction: 'prev' | 'next') => {
    const base = startDate || new Date();
    const currentYear = base.getFullYear();
    const currentMonth = base.getMonth();
    const offset = direction === 'prev' ? -1 : 1;
    const nextMonthDate = new Date(currentYear, currentMonth + offset, 1);
    const newStart = new Date(
      nextMonthDate.getFullYear(),
      nextMonthDate.getMonth(),
      1
    );
    const newEnd = new Date(
      nextMonthDate.getFullYear(),
      nextMonthDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const now = new Date();
    const isThisMonth =
      nextMonthDate.getFullYear() === now.getFullYear() &&
      nextMonthDate.getMonth() === now.getMonth();

    const formatter = new Intl.DateTimeFormat(undefined, {
      month: 'long',
      year: 'numeric',
    });

    setRange(newStart, newEnd, isThisMonth ? 'This month' : formatter.format(nextMonthDate));
    setViewDate(newStart);
  };

  const setQuickRange = (range: 'this_week' | 'this_month' | 'last_30' | 'last_90' | 'this_year' | 'all') => {
    const now = new Date();

    if (range === 'this_week') {
      const day = now.getDay(); // 0 (Sun) - 6 (Sat)
      const diffToMonday = (day + 6) % 7;
      const start = new Date(now);
      start.setDate(now.getDate() - diffToMonday);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      setRange(start, end, 'This week');
      setViewDate(start);
      return;
    }

    if (range === 'this_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      setRange(start, end, 'This month');
      setViewDate(start);
      return;
    }

    if (range === 'this_year') {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      setRange(start, end, 'This year');
      setViewDate(start);
      return;
    }

    if (range === 'last_30') {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 29);
      setRange(start, end, 'Last 30 days');
      setViewDate(start);
      return;
    }

    if (range === 'last_90') {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 89);
      setRange(start, end, 'Last 90 days');
      setViewDate(start);
      return;
    }

    if (range === 'all') {
      setStartDate(null);
      setEndDate(null);
      setDateRangeLabel('All time');
      setViewDate(now);
    }
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diffToMonday = (day + 6) % 7;
    d.setDate(d.getDate() - diffToMonday);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const renderWeeksView = () => {
    const weekStart = getWeekStart(viewDate);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });

    const formatter = new Intl.DateTimeFormat(undefined, {
      month: 'long',
      year: 'numeric',
    });

    const handleSelectWeek = (date: Date) => {
      const start = getWeekStart(date);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      setRange(start, end, 'Week of ' + start.toLocaleDateString());
      setIsRangeOpen(false);
    };

    return (
      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() =>
              setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7))
            }
            className="p-1.5 rounded hover:bg-gray-100"
            aria-label="Previous week"
          >
            <ChevronLeft size={14} className="text-gray-600" />
          </button>
          <p className="font-semibold text-gray-700">{formatter.format(weekStart)}</p>
          <button
            type="button"
            onClick={() =>
              setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7))
            }
            className="p-1.5 rounded hover:bg-gray-100"
            aria-label="Next week"
          >
            <ChevronRight size={14} className="text-gray-600" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-gray-500 mb-1">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((d) => {
            const selectedWeekStart = startDate ? getWeekStart(startDate) : null;
            const selectedWeekEnd =
              selectedWeekStart != null
                ? new Date(selectedWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
                : null;
            const isSelected =
              selectedWeekStart && selectedWeekEnd && d >= selectedWeekStart && d <= selectedWeekEnd;

            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => handleSelectWeek(d)}
                className={`py-1.5 rounded text-xs ${
                  isSelected
                    ? 'bg-green-600 text-white'
                    : 'hover:bg-green-50 text-gray-700 border border-transparent hover:border-green-200'
                }`}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const renderMonthsView = () => {
    const year = viewDate.getFullYear();

    const handleSelectMonth = (monthIndex: number) => {
      const start = new Date(year, monthIndex, 1);
      const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
      const formatter = new Intl.DateTimeFormat(undefined, {
        month: 'long',
        year: 'numeric',
      });
      setRange(start, end, formatter.format(start));
      setViewDate(start);
      setIsRangeOpen(false);
    };

    return (
      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => setViewDate((prev) => new Date(prev.getFullYear() - 1, prev.getMonth(), 1))}
            className="p-1.5 rounded hover:bg-gray-100"
            aria-label="Previous year"
          >
            <ChevronLeft size={14} className="text-gray-600" />
          </button>
          <p className="font-semibold text-gray-700">{year}</p>
          <button
            type="button"
            onClick={() => setViewDate((prev) => new Date(prev.getFullYear() + 1, prev.getMonth(), 1))}
            className="p-1.5 rounded hover:bg-gray-100"
            aria-label="Next year"
          >
            <ChevronRight size={14} className="text-gray-600" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {monthNames.map((name, index) => (
            <button
              key={name}
              type="button"
              onClick={() => handleSelectMonth(index)}
              className="py-2 rounded-lg border border-gray-200 text-xs hover:bg-green-50 hover:border-green-300"
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderYearsView = () => {
    const baseYear = Math.floor(viewDate.getFullYear() / 12) * 12;
    const years = Array.from({ length: 12 }, (_, i) => baseYear + i);

    const handleSelectYear = (year: number) => {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31, 23, 59, 59, 999);
      setRange(start, end, String(year));
      setViewDate(start);
      setIsRangeOpen(false);
    };

    return (
      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => setViewDate((prev) => new Date(prev.getFullYear() - 12, prev.getMonth(), 1))}
            className="p-1.5 rounded hover:bg-gray-100"
            aria-label="Previous years"
          >
            <ChevronLeft size={14} className="text-gray-600" />
          </button>
          <p className="font-semibold text-gray-700">
            {baseYear} – {baseYear + 11}
          </p>
          <button
            type="button"
            onClick={() => setViewDate((prev) => new Date(prev.getFullYear() + 12, prev.getMonth(), 1))}
            className="p-1.5 rounded hover:bg-gray-100"
            aria-label="Next years"
          >
            <ChevronRight size={14} className="text-gray-600" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {years.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => handleSelectYear(year)}
              className="py-2 rounded-lg border border-gray-200 text-xs hover:bg-green-50 hover:border-green-300"
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading records...</p>
        </div>
      </div>
    );
  }

  const hasRecords = filteredTransactions.length > 0;
  const totalRecords = filteredTransactions.length;
  const allSelectableIds = filteredTransactions
    .map((tx) => tx.id)
    .filter((id): id is number => typeof id === 'number');
  const allSelected =
    allSelectableIds.length > 0 && allSelectableIds.every((id) => selectedRecordIds.includes(id));
  const hasSelection = selectedRecordIds.length > 0;

  const toggleRecordSelection = (id?: number) => {
    if (id == null) return;
    setSelectedRecordIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedRecordIds([]);
    } else {
      setSelectedRecordIds(allSelectableIds);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-start mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Records</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">My filter</p>
                <button className="p-1 rounded hover:bg-gray-100">
                  <Filter size={16} className="text-gray-500" />
                </button>
              </div>

              <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                <span className="text-gray-500">Select filter</span>
              </button>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Search</p>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Search"
                  />
                  <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Sort by</p>
                <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-gray-50">
                  <span>Time (newest first)</span>
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Accounts</p>
                <select
                  value={selectedAccountId === 'all' ? 'all' : String(selectedAccountId)}
                  onChange={(e) =>
                    setSelectedAccountId(e.target.value === 'all' ? 'all' : Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All accounts</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Record types</p>
                <select
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value as RecordTypeFilter)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All record types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="transfer">Transfers</option>
                </select>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Amount range</p>
                <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                  <span>ZAR 0</span>
                  <span>ZAR 9,596</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="w-1/2 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="w-1/2 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={includeTransfers}
                    onChange={(e) => setIncludeTransfers(e.target.checked)}
                    className="w-3 h-3 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  Include transfers
                </label>
              </div>

              <button className="w-full mt-2 px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50">
                Reset filter
              </button>
            </div>
          </div>

          {/* Records list */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6 min-h-[400px] flex flex-col relative">
              {/* Selection summary and bulk actions */}
              <div className="mb-4 rounded-lg border border-yellow-100 bg-yellow-50 px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-sm text-gray-800">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <span className="font-semibold">
                      Found {totalRecords} {totalRecords === 1 ? 'record' : 'records'}
                    </span>
                    <span className="text-xs text-gray-600">
                      Select all, selected {selectedRecordIds.length || 0}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <button
                    type="button"
                    disabled={!hasSelection}
                    className={`px-3 py-1.5 rounded-full border text-xs sm:text-sm ${
                      hasSelection
                        ? 'border-green-600 text-green-700 hover:bg-green-50'
                        : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={!hasSelection}
                    className={`px-3 py-1.5 rounded-full border text-xs sm:text-sm ${
                      hasSelection
                        ? 'border-gray-400 text-gray-700 hover:bg-gray-50'
                        : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                    }`}
                  >
                    Export
                  </button>
                  <button
                    type="button"
                    disabled={!hasSelection}
                    className={`px-3 py-1.5 rounded-full border text-xs sm:text-sm ${
                      hasSelection
                        ? 'border-red-500 text-red-600 hover:bg-red-50'
                        : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                    }`}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    disabled={!hasSelection}
                    className={`px-3 py-1.5 rounded-full border text-xs sm:text-sm ${
                      hasSelection
                        ? 'border-blue-500 text-blue-600 hover:bg-blue-50'
                        : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                    }`}
                  >
                    Solve Duplicates
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => shiftMonth('prev')}
                    className="p-1.5 rounded hover:bg-gray-100"
                    aria-label="Previous period"
                  >
                    <ChevronLeft size={16} className="text-gray-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRangeOpen((open) => !open)}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg min-w-[140px] text-center"
                  >
                    {dateRangeLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => shiftMonth('next')}
                    className="p-1.5 rounded hover:bg-gray-100"
                    aria-label="Next period"
                  >
                    <ChevronRight size={16} className="text-gray-600" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-gray-600">
                  <button
                    type="button"
                    onClick={() => setQuickRange('this_month')}
                    className="px-2 py-1 border border-gray-200 rounded-full hover:bg-gray-50"
                  >
                    This month
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickRange('last_30')}
                    className="px-2 py-1 border border-gray-200 rounded-full hover:bg-gray-50"
                  >
                    30 days
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickRange('last_90')}
                    className="px-2 py-1 border border-gray-200 rounded-full hover:bg-gray-50"
                  >
                    90 days
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickRange('this_year')}
                    className="px-2 py-1 border border-gray-200 rounded-full hover:bg-gray-50"
                  >
                    This year
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickRange('all')}
                    className="px-2 py-1 border border-gray-200 rounded-full hover:bg-gray-50"
                  >
                    All
                  </button>
                </div>
              </div>

              {isRangeOpen && (
                <div className="absolute left-1/2 top-20 z-20 w-full max-w-md -translate-x-1/2">
                  <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3 text-xs font-medium rounded-lg overflow-hidden border border-gray-200">
                      <button
                        type="button"
                        onClick={() => setActiveRangeTab('custom')}
                        className={`flex-1 py-2 text-center ${
                          activeRangeTab === 'custom' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
                        }`}
                      >
                        Custom range
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRangeTab('weeks');
                          setQuickRange('this_week');
                        }}
                        className={`flex-1 py-2 text-center border-l border-gray-200 ${
                          activeRangeTab === 'weeks' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
                        }`}
                      >
                        Weeks
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRangeTab('months');
                          setQuickRange('this_month');
                        }}
                        className={`flex-1 py-2 text-center border-l border-gray-200 ${
                          activeRangeTab === 'months' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
                        }`}
                      >
                        Months
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRangeTab('years');
                          setQuickRange('this_year');
                        }}
                        className={`flex-1 py-2 text-center border-l border-gray-200 ${
                          activeRangeTab === 'years' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
                        }`}
                      >
                        Years
                      </button>
                    </div>

                    {activeRangeTab === 'custom' && (
                      <div className="space-y-3 text-xs">
                        <p className="font-semibold text-gray-700 mb-1">Select dates</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block mb-1 text-[11px] text-gray-500">From</label>
                            <input
                              type="date"
                              value={startDate ? startDate.toISOString().slice(0, 10) : ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                setStartDate(value ? new Date(value) : null);
                              }}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-[11px] text-gray-500">To</label>
                            <input
                              type="date"
                              value={endDate ? endDate.toISOString().slice(0, 10) : ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (!value) {
                                  setEndDate(null);
                                  return;
                                }
                                const d = new Date(value);
                                d.setHours(23, 59, 59, 999);
                                setEndDate(d);
                              }}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => setQuickRange('this_week')}
                            className="px-2 py-1 border border-gray-200 rounded-full hover:bg-gray-50"
                          >
                            This week
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickRange('this_month')}
                            className="px-2 py-1 border border-gray-200 rounded-full hover:bg-gray-50"
                          >
                            This month
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickRange('last_30')}
                            className="px-2 py-1 border border-gray-200 rounded-full hover:bg-gray-50"
                          >
                            30 days
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickRange('last_90')}
                            className="px-2 py-1 border border-gray-200 rounded-full hover:bg-gray-50"
                          >
                            90 days
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickRange('this_year')}
                            className="px-2 py-1 border border-gray-200 rounded-full hover:bg-gray-50"
                          >
                            This year
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickRange('all')}
                            className="px-2 py-1 border border-gray-200 rounded-full hover:bg-gray-50"
                          >
                            All
                          </button>
                        </div>
                      </div>
                    )}

                    {activeRangeTab === 'weeks' && renderWeeksView()}
                    {activeRangeTab === 'months' && renderMonthsView()}
                    {activeRangeTab === 'years' && renderYearsView()}
                  </div>
                </div>
              )}

              {!hasRecords ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-gray-500 text-center max-w-md">
                    Sorry, no records were found for this combination of filters.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions
                    .sort(
                      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((tx) => {
                      const account = accounts.find((a) => a.id === tx.accountId);
                      const isExpense = tx.amount < 0;
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleRecordSelection(tx.id)}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={tx.id != null && selectedRecordIds.includes(tx.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleRecordSelection(tx.id);
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                              {account?.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {tx.description || 'Unknown expense'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {account?.name || 'Unknown'} •{' '}
                                {new Date(tx.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-sm font-semibold ${
                                isExpense ? 'text-red-500' : 'text-green-500'
                              }`}
                            >
                              {isExpense ? '-' : '+'}
                              {(account?.currency || 'ZAR')}{' '}
                              {Math.abs(tx.amount).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>

        {isAddModalOpen && (
          <AddRecordModal
            accounts={accounts}
            onClose={() => setIsAddModalOpen(false)}
            onSaved={async () => {
              await loadAccounts();
              await loadTransactions();
            }}
          />
        )}
      </div>
    </div>
  );
};

const AddRecordModal: React.FC<{
  accounts: Account[];
  onClose: () => void;
  onSaved: () => void;
}> = ({ accounts, onClose, onSaved }) => {
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [accountId, setAccountId] = useState<number | null>(accounts[0]?.id ?? null);
  const [category, setCategory] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [templateName, setTemplateName] = useState<string>('');
  const [labels, setLabels] = useState<string>('');
  const [createTemplate, setCreateTemplate] = useState<boolean>(false);
  const [date, setDate] = useState<string>(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}`;
  });
  const [isSaving, setIsSaving] = useState(false);

  const saveRecord = async (closeAfterSave: boolean) => {
    if (!amount || !accountId) return;

    const numericAmount = parseFloat(amount);
    if (Number.isNaN(numericAmount)) return;

    const signedAmount = type === 'expense' ? -Math.abs(numericAmount) : Math.abs(numericAmount);

    try {
      setIsSaving(true);

      const tx: Transaction = {
        accountId,
        amount: signedAmount,
        category,
        description: note || category || 'Transaction',
        date: new Date(date),
      };

      const newId = await dbService.addTransaction(tx);

      // Update account balance
      const account = await dbService.getAccount(accountId);
      if (account && account.id != null) {
        await dbService.updateAccount(account.id, {
          balance: (account.balance || 0) + signedAmount,
        });
      }

      console.log('Transaction created with id', newId, {
        templateName: createTemplate ? templateName : undefined,
        labels,
      });
      await onSaved();

      if (closeAfterSave) {
        onClose();
      } else {
        // Reset main input fields but keep modal open
        setAmount('');
        setCategory('');
        setNote('');
        setLabels('');
        setCreateTemplate(false);
      }
    } catch (error) {
      console.error('Failed to add transaction:', error);
      alert('Failed to add transaction. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveRecord(true);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Add record</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded p-1 hover:bg-gray-50"
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 border-r px-6 py-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Select template
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Select template"
                />
              </div>
              <button
                type="button"
                className="mt-5 h-9 w-9 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                +
              </button>
            </div>

            <div className="flex rounded-lg overflow-hidden border border-gray-200 text-sm font-medium">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 py-2 ${
                  type === 'expense' ? 'bg-red-500 text-white' : 'bg-white text-gray-700'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 py-2 border-l border-r border-gray-200 ${
                  type === 'income' ? 'bg-green-500 text-white' : 'bg-white text-gray-700'
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setType('transfer')}
                className={`flex-1 py-2 ${
                  type === 'transfer' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
                }`}
              >
                Transfer
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Amount *</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-xs flex items-center">
                  ZAR
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Account</label>
              <select
                value={accountId ?? ''}
                onChange={(e) =>
                  setAccountId(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Choose"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Labels</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Choose"
                />
                <button
                  type="button"
                  className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-xl leading-none"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date &amp; Time</label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <label className="flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={createTemplate}
                  onChange={(e) => setCreateTemplate(e.target.checked)}
                  className="w-3 h-3 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span>Create template from this record</span>
              </label>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSaving ? 'Saving...' : 'Add record'}
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => void saveRecord(false)}
                className="w-full px-6 py-3 border border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSaving ? 'Saving...' : 'Add and create another'}
              </button>
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Other details</h3>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Describe your record"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payer</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Payer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option>Transfer</option>
                <option>Card</option>
                <option>Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment status</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option>Uncleared</option>
                <option>Cleared</option>
              </select>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordsPage;


