'use client';

import { useState } from 'react';
import { Container, Title, Text, Paper, Grid, Button, Group, Card, TextInput, NumberInput, Select } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';

export default function HomePage() {
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<Date | null>(null);
  const [type, setType] = useState<'income' | 'expense' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ amount, category, date, type });
    // Here we'll eventually add the logic to save the entry
  };

  return (
    <Container size="xl" py="md">
      <Title order={1} ta="center" mb="lg">
        Budget Planner & Tracker
      </Title>
      
      <Text ta="center" c="dimmed" mb="xl">
        Track your income, expenses, and savings goals in one place
      </Text>

      {/* New Budget Entry Form */}
      <Paper p="lg" shadow="sm" radius="md" withBorder mb="lg">
        <Title order={2} mb="md">Add New Transaction</Title>
        
        <form onSubmit={handleSubmit}>
          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="Amount"
                placeholder="0.00"
                value={amount}
                onChange={(value) => {
                  // Handle the type conversion properly
                  if (value === null || value === '') {
                    setAmount('');
                  } else if (typeof value === 'string') {
                    const numValue = parseFloat(value);
                    setAmount(isNaN(numValue) ? '' : numValue);
                  } else {
                    setAmount(value);
                  }
                }}
                prefix="R"
                hideControls
                required
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Type"
                placeholder="Select type"
                value={type}
                onChange={(value) => setType(value as 'income' | 'expense' | null)}
                data={[
                  { value: 'income', label: 'Income' },
                  { value: 'expense', label: 'Expense' },
                ]}
                required
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Category"
                placeholder="e.g., Groceries, Salary, Rent"
                value={category}
                onChange={(e) => setCategory(e.currentTarget.value)}
                required
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <DatePickerInput
                label="Date"
                placeholder="Pick date"
                value={date}
                onChange={(value) => {
                  // Handle string to Date conversion for Mantine v8+
                  if (typeof value === 'string') {
                    setDate(value ? new Date(value) : null);
                  } else {
                    setDate(value);
                  }
                }}
                required
              />
            </Grid.Col>
          </Grid>
          
          <Group justify="flex-end" mt="lg">
            <Button type="submit">Add Transaction</Button>
          </Group>
        </form>
      </Paper>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 8 }}>
          {/* Main content area - we'll add budget entries here later */}
          <Paper p="lg" shadow="sm" radius="md" withBorder>
            <Title order={2} mb="md">Recent Transactions</Title>
            <Text c="dimmed">Your budget entries will appear here...</Text>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 4 }}>
          {/* Sidebar - we'll add summary stats here later */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">Summary</Title>
            <Group justify="space-between">
              <Text>Total Income:</Text>
              <Text fw={700}>R 0.00</Text>
            </Group>
            <Group justify="space-between">
              <Text>Total Expenses:</Text>
              <Text fw={700}>R 0.00</Text>
            </Group>
            <Group justify="space-between" mt="md">
              <Text fw={700}>Balance:</Text>
              <Text fw={700} c="green">R 0.00</Text>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}