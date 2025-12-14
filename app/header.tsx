'use client';

import { usePathname } from 'next/navigation';
import { Group, Button, Burger, Avatar, Menu, Text, Divider } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconPlus, IconCaretDown } from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const pathname = usePathname();

  return (
  <>
    <style jsx global>{`
      .nav-button:hover {
        background-color: #f0f0f0 !important;
        color: #666 !important;
        cursor: pointer !important;
      }
    `}</style>
    <header className="w-full px-1 py-2 md:px-10 lg:px-10 xl:px-10 2xl:px-2" style={{ borderBottom: '1px solid #e0e0e0' }}>
      <div className="mx-auto flex max-w-screen-2xl items-center" style={{ gap: '1rem' }}>
        {/* Logo */}
        <Link href="/dashboard" className="mr-2">
          <Avatar size={42} color="green" radius="sm">
            <IconPlus size={20} />
          </Avatar>
        </Link>

        {/* Navigation Links */}
        {!isMobile && (
          <Group gap="md">
            <Link href="/dashboard">
                <Button 
                    variant="subtle" 
                    color="gray"
                    className="!w-fit nav-button"
                    styles={(theme) => ({
                    root: {
                        backgroundColor: pathname === '/dashboard' ? theme.colors.green[0] : 'transparent',
                        border: pathname === '/dashboard' ? `1px solid ${theme.colors.green[5]}` : 'none',
                        color: pathname === '/dashboard' ? theme.colors.green[6] : theme.colors.gray[8],
                        '&:hover': { 
                        backgroundColor: pathname === '/dashboard' ? theme.colors.green[1] : theme.colors.gray[1],
                        borderColor: pathname === '/dashboard' ? theme.colors.green[6] : theme.colors.gray[4],
                        color: pathname === '/dashboard' ? theme.colors.green[7] : theme.colors.gray[8]
                        },
                        borderRadius: theme.radius.md,
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                    }
                    })}
                >
                    Dashboard
                </Button>
                </Link>
            
            <Link href="/accounts">
            <Button 
                variant="subtle" 
                color="gray" 
                className="!w-fit nav-button"
                styles={(theme) => ({
                root: {
                    backgroundColor: pathname === '/accounts' ? theme.colors.green[0] : 'transparent',
                    border: pathname === '/accounts' ? `1px solid ${theme.colors.green[5]}` : 'none',
                    color: pathname === '/accounts' ? theme.colors.green[6] : theme.colors.gray[8],
                    '&:hover': { 
                    backgroundColor: pathname === '/accounts' ? theme.colors.green[1] : theme.colors.gray[1],
                    borderColor: pathname === '/accounts' ? theme.colors.green[6] : theme.colors.gray[4],
                    color: pathname === '/accounts' ? theme.colors.green[7] : theme.colors.gray[8]
                    },
                    borderRadius: theme.radius.md,
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                }
                })}
            >
                Accounts
            </Button>
            </Link>         
            
            <Link href="/records">
            <Button     
                variant="subtle" 
                color="gray" 
                className="!w-fit nav-button"
                styles={(theme) => ({
                root: {
                    backgroundColor: pathname === '/records' ? theme.colors.green[0] : 'transparent',
                    border: pathname === '/records' ? `1px solid ${theme.colors.green[5]}` : 'none',
                    color: pathname === '/records' ? theme.colors.green[6] : theme.colors.gray[8],
                    '&:hover': { 
                    backgroundColor: pathname === '/records' ? theme.colors.green[1] : theme.colors.gray[1],
                    borderColor: pathname === '/records' ? theme.colors.green[6] : theme.colors.gray[4],
                    color: pathname === '/records' ? theme.colors.green[7] : theme.colors.gray[8]
                    },
                    borderRadius: theme.radius.md,
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                }
                })}
            >
                Records
              </Button>
            </Link>
            
            <Link href="/analytics">
              <Button 
                variant="subtle" 
                color="gray" 
                className="!w-fit nav-button"
                styles={(theme) => ({
                root: {
                    backgroundColor: pathname === '/analytics' ? theme.colors.green[0] : 'transparent',
                    border: pathname === '/analytics' ? `1px solid ${theme.colors.green[5]}` : 'none',
                    color: pathname === '/analytics' ? theme.colors.green[6] : theme.colors.gray[8],
                    '&:hover': { 
                    backgroundColor: pathname === '/analytics' ? theme.colors.green[1] : theme.colors.gray[1],
                    borderColor: pathname === '/analytics' ? theme.colors.green[6] : theme.colors.gray[4],
                    color: pathname === '/analytics' ? theme.colors.green[7] : theme.colors.gray[8]
                    },
                    borderRadius: theme.radius.md,
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                }
                })}
              >
                Analytics

              </Button>
            </Link>
            
            <Link href="/investments">
              <Button 
                variant="subtle" 
                color="gray" 
                className="!w-fit nav-button"
                styles={(theme) => ({
                root: {
                    backgroundColor: pathname === '/investment' ? theme.colors.green[0] : 'transparent',
                    border: pathname === '/investments' ? `1px solid ${theme.colors.green[5]}` : 'none',
                    color: pathname === '/investments' ? theme.colors.green[6] : theme.colors.gray[8],
                    '&:hover': { 
                    backgroundColor: pathname === '/investments' ? theme.colors.green[1] : theme.colors.gray[1],
                    borderColor: pathname === '/investments' ? theme.colors.green[6] : theme.colors.gray[4],
                    color: pathname === '/investments' ? theme.colors.green[7] : theme.colors.gray[8]
                    },
                    borderRadius: theme.radius.md,
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                }
                })}
            >
                Investments
              </Button>
            </Link>

            <Link href="/goals">
              <Button 
                variant="subtle" 
                color="gray" 
                className="!w-fit nav-button"
                styles={(theme) => ({
                root: {
                    backgroundColor: pathname === '/goals' ? theme.colors.green[0] : 'transparent',
                    border: pathname === '/goals' ? `1px solid ${theme.colors.green[5]}` : 'none',
                    color: pathname === '/goals' ? theme.colors.green[6] : theme.colors.gray[8],
                    '&:hover': { 
                    backgroundColor: pathname === '/goals' ? theme.colors.green[1] : theme.colors.gray[1],
                    borderColor: pathname === '/goals' ? theme.colors.green[6] : theme.colors.gray[4],
                    color: pathname === '/goals' ? theme.colors.green[7] : theme.colors.gray[8]
                    },
                    borderRadius: theme.radius.md,
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                }
                })}
            >
                Goals
              </Button>
            </Link>
            
            <Link href="/imports">
              <Button 
                variant="subtle" 
                color="gray" 
                className="!w-fit nav-button"
                styles={(theme) => ({
                root: {
                    backgroundColor: pathname === '/imports' ? theme.colors.green[0] : 'transparent',
                    border: pathname === '/imports' ? `1px solid ${theme.colors.green[5]}` : 'none',
                    color: pathname === '/imports' ? theme.colors.green[6] : theme.colors.gray[8],
                    '&:hover': { 
                    backgroundColor: pathname === '/imports' ? theme.colors.green[1] : theme.colors.gray[1],
                    borderColor: pathname === '/imports' ? theme.colors.green[6] : theme.colors.gray[4],
                    color: pathname === '/imports' ? theme.colors.green[7] : theme.colors.gray[8]
                    },
                    borderRadius: theme.radius.md,
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                }
                })}
            >
                Imports
              </Button>
            </Link>
          </Group>
        )}

        {/* Right Side - Record Button and User Menu */}
        <div className="ml-auto flex items-center gap-4">
          {/* Record Button */}
          <Button 
            component="button"
            variant="filled"
            color="green"
            radius="xl"
            styles={(theme) => ({
                root: {
                backgroundColor: theme.colors.green[6],
                '&:hover': { 
                    backgroundColor: theme.colors.green[7],
                },
                borderRadius: theme.radius.xl,
                padding: '0.5rem 1.25rem', // ← CHANGED THIS
                fontSize: '0.875rem',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'white'
                }
            })}
            >
            <IconPlus size={16} color="white" />
            Record
        </Button>

          {/* User Profile (Desktop) */}
          {!isMobile && (
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button 
                  variant="subtle" 
                  rightSection={<IconCaretDown size={14} />}
                  className="flex items-center gap-2"
                  styles={(theme) => ({
                    root: {
                      borderRadius: theme.radius.xl,
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      '&:hover': { 
                        backgroundColor: theme.colors.gray[1],
                        color: theme.colors.gray[8]
                      },
                      cursor: 'pointer'
                    }
                  })}
                >
                  <Avatar size={32} color="red" radius="xl">S</Avatar>
                  <Text size="sm" fw={500}>Siphiwe Sikhakhane</Text>
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item>Profile</Menu.Item>
                <Menu.Item>Settings</Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red">Logout</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}

          {/* Mobile Burger Menu */}
          {isMobile && (
            <Burger
              opened={false}
              onClick={() => {}}
              size="sm"
              className="ml-auto"
            />
          )}
        </div>
      </div>
    </header>
  </>
);
}