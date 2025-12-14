// lib/database.ts
// Local IndexedDB database service for Budget Planner

export interface Account {
  id?: number;
  name: string;
  accountNumber?: string;  // NEW LINE
  balance: number;
  currency: string;
  color: string;
  icon: string;
  locked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Transaction {
  id?: number;
  accountId: number;
  description: string;
  amount: number;
  date: Date;
  category?: string;
  hasReceipt?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  id?: number;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
}

export interface Budget {
  id?: number;
  categoryId: number;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
}

class DatabaseService {
  private dbName = 'BudgetPlannerDB';
  private version = 1;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  // Initialize database
  async init(): Promise<void> {
    // Return existing promise if already initializing
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        this.initPromise = null;
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create Accounts store
        if (!db.objectStoreNames.contains('accounts')) {
          const accountStore = db.createObjectStore('accounts', {
            keyPath: 'id',
            autoIncrement: true,
          });
          accountStore.createIndex('name', 'name', { unique: false });
          accountStore.createIndex('currency', 'currency', { unique: false });
        }

        // Create Transactions store
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', {
            keyPath: 'id',
            autoIncrement: true,
          });
          transactionStore.createIndex('accountId', 'accountId', { unique: false });
          transactionStore.createIndex('date', 'date', { unique: false });
          transactionStore.createIndex('category', 'category', { unique: false });
        }

        // Create Categories store
        if (!db.objectStoreNames.contains('categories')) {
          const categoryStore = db.createObjectStore('categories', {
            keyPath: 'id',
            autoIncrement: true,
          });
          categoryStore.createIndex('name', 'name', { unique: false });
          categoryStore.createIndex('type', 'type', { unique: false });
        }

        // Create Budgets store
        if (!db.objectStoreNames.contains('budgets')) {
          const budgetStore = db.createObjectStore('budgets', {
            keyPath: 'id',
            autoIncrement: true,
          });
          budgetStore.createIndex('categoryId', 'categoryId', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  // Generic helper to get object store
  private getObjectStore(storeName: string, mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) throw new Error('Database not initialized');
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // ==================== ACCOUNTS ====================

  async addAccount(account: Account): Promise<number> {
    await this.init(); // Ensure DB is ready
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('accounts', 'readwrite');
      const accountWithTimestamp = {
        ...account,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const request = store.add(accountWithTimestamp);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async updateAccount(id: number, account: Partial<Account>): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('accounts', 'readwrite');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingAccount = getRequest.result;
        if (!existingAccount) {
          reject(new Error('Account not found'));
          return;
        }

        const updatedAccount = {
          ...existingAccount,
          ...account,
          id,
          updatedAt: new Date(),
        };

        const updateRequest = store.put(updatedAccount);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteAccount(id: number): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('accounts', 'readwrite');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAccount(id: number): Promise<Account | undefined> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('accounts', 'readonly');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllAccounts(): Promise<Account[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('accounts', 'readonly');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== TRANSACTIONS ====================

  async addTransaction(transaction: Transaction): Promise<number> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('transactions', 'readwrite');
      const transactionWithTimestamp = {
        ...transaction,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const request = store.add(transactionWithTimestamp);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async updateTransaction(id: number, transaction: Partial<Transaction>): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('transactions', 'readwrite');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingTransaction = getRequest.result;
        if (!existingTransaction) {
          reject(new Error('Transaction not found'));
          return;
        }

        const updatedTransaction = {
          ...existingTransaction,
          ...transaction,
          id,
          updatedAt: new Date(),
        };

        const updateRequest = store.put(updatedTransaction);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteTransaction(id: number): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('transactions', 'readwrite');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('transactions', 'readonly');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllTransactions(): Promise<Transaction[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('transactions', 'readonly');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getTransactionsByAccount(accountId: number): Promise<Transaction[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('transactions', 'readonly');
      const index = store.index('accountId');
      const request = index.getAll(accountId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('transactions', 'readonly');
      const index = store.index('date');
      const range = IDBKeyRange.bound(startDate, endDate);
      const request = index.getAll(range);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== CATEGORIES ====================

  async addCategory(category: Category): Promise<number> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('categories', 'readwrite');
      const request = store.add(category);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllCategories(): Promise<Category[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('categories', 'readonly');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== BUDGETS ====================

  async addBudget(budget: Budget): Promise<number> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('budgets', 'readwrite');
      const request = store.add(budget);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllBudgets(): Promise<Budget[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('budgets', 'readonly');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== UTILITIES ====================

  async clearAllData(): Promise<void> {
    await this.init();
    const stores = ['accounts', 'transactions', 'categories', 'budgets'];
    const promises = stores.map(storeName => {
      return new Promise<void>((resolve, reject) => {
        const store = this.getObjectStore(storeName, 'readwrite');
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
    await Promise.all(promises);
  }

  // Seed initial data for development
  async seedInitialData(): Promise<void> {
    try {
      await this.init(); // Ensure DB is fully initialized
      
      const accountCount = await this.getAllAccounts();
      
      // Only seed if database is empty
      if (accountCount.length === 0) {
        // Add default accounts
        await this.addAccount({
          name: 'Cash',
          balance: 528.00,
          currency: 'ZAR',
          color: '#0ea5e9',
          icon: 'cash',
        });

        await this.addAccount({
          name: 'RandBank',
          balance: 1059.92,
          currency: 'ZAR',
          color: '#10b981',
          icon: 'bank',
        });

        await this.addAccount({
          name: 'Nedbank',
          balance: 0.00,
          currency: 'ZAR',
          color: '#059669',
          icon: 'bank',
        });

        // Add default categories with icon names (not emojis)
        await this.addCategory({
          name: 'Groceries',
          type: 'expense',
          color: '#ef4444',
          icon: 'shopping-cart',
        });

        await this.addCategory({
          name: 'Transport',
          type: 'expense',
          color: '#f59e0b',
          icon: 'car',
        });

        await this.addCategory({
          name: 'Salary',
          type: 'income',
          color: '#10b981',
          icon: 'dollar-sign',
        });

        console.log('Database seeded with initial data');
      }
    } catch (error) {
      console.error('Failed to seed database:', error);
    }
  }
}

// Create and export a singleton instance
export const dbService = new DatabaseService();

// Helper hook for React components
export const useDatabase = () => {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    dbService.init()
      .then(() => dbService.seedInitialData())
      .then(() => setIsReady(true))
      .catch(error => {
        console.error('Database initialization failed:', error);
        setIsReady(false);
      });
  }, []);

  return { isReady, db: dbService };
};

// Note: Import React for the hook
import React from 'react';