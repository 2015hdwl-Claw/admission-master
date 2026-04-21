import type { User } from '@/types';
import { loadFromStorage, saveToStorage } from '@/lib/storage';

const USERS_KEY = 'auth-users';
const CURRENT_USER_KEY = 'auth-current-user';

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `h_${Math.abs(hash).toString(36)}_${input.length}`;
}

function getAllUsers(): Array<User & { passwordHash: string }> {
  return loadFromStorage<Array<User & { passwordHash: string }>>(USERS_KEY, []);
}

function saveAllUsers(users: Array<User & { passwordHash: string }>): void {
  saveToStorage(USERS_KEY, users);
}

export function getCurrentUser(): User | null {
  return loadFromStorage<User | null>(CURRENT_USER_KEY, null);
}

export function login(email: string, password: string): User | null {
  const users = getAllUsers();
  const passwordHash = simpleHash(password);
  const found = users.find(u => u.email === email && u.passwordHash === passwordHash);
  if (!found) return null;
  const { passwordHash: _, ...user } = found;
  void _;
  saveToStorage(CURRENT_USER_KEY, user);
  return user;
}

export function register(
  email: string,
  password: string,
  name: string,
  role: 'student' | 'parent' = 'student'
): User {
  const users = getAllUsers();
  const existing = users.find(u => u.email === email);
  if (existing) {
    throw new Error('此 Email 已經註冊過');
  }

  const passwordHash = simpleHash(password);
  const newUser: User & { passwordHash: string } = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    email,
    name,
    role,
    createdAt: new Date().toISOString(),
    passwordHash,
  };

  users.push(newUser);
  saveAllUsers(users);

  const { passwordHash: _, ...user } = newUser;
  void _;
  saveToStorage(CURRENT_USER_KEY, user);
  return user;
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admission-master:' + CURRENT_USER_KEY);
}
