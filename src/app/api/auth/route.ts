import { NextRequest, NextResponse } from 'next/server';

interface AuthRequestBody {
  action: 'register' | 'login';
  email: string;
  password: string;
  name?: string;
  role?: 'student' | 'parent';
}

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `h_${Math.abs(hash).toString(36)}_${input.length}`;
}

interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'parent';
  createdAt: string;
  passwordHash: string;
}

// In-memory user store (placeholder - would be database in production)
// This is a server-side only store since we don't have a database yet.
// The client-side auth.ts handles the actual localStorage-based auth.
const serverUsers = new Map<string, StoredUser>();

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): boolean {
  return password.length >= 6;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as AuthRequestBody;
    const { action, email, password, name, role } = body;

    if (!action || !email || !password) {
      return NextResponse.json(
        { error: '缺少必要欄位：action, email, password' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Email 格式不正確' },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: '密碼至少需要 6 個字元' },
        { status: 400 }
      );
    }

    if (action === 'register') {
      if (!name || name.trim().length === 0) {
        return NextResponse.json(
          { error: '請輸入姓名' },
          { status: 400 }
        );
      }

      const existing = serverUsers.get(email);
      if (existing) {
        return NextResponse.json(
          { error: '此 Email 已經註冊過' },
          { status: 409 }
        );
      }

      const passwordHash = simpleHash(password);
      const newUser: StoredUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        email,
        name: name.trim(),
        role: role || 'student',
        createdAt: new Date().toISOString(),
        passwordHash,
      };

      serverUsers.set(email, newUser);

      const { passwordHash: _, ...user } = newUser;
      void _;

      return NextResponse.json({ user });
    }

    if (action === 'login') {
      const existing = serverUsers.get(email);
      if (!existing) {
        return NextResponse.json(
          { error: '找不到此帳號，請先註冊' },
          { status: 404 }
        );
      }

      const passwordHash = simpleHash(password);
      if (existing.passwordHash !== passwordHash) {
        return NextResponse.json(
          { error: '密碼不正確' },
          { status: 401 }
        );
      }

      const { passwordHash: _, ...user } = existing;
      void _;

      return NextResponse.json({ user });
    }

    return NextResponse.json(
      { error: '不支援的操作，請使用 register 或 login' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}
