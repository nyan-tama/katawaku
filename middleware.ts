import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// 保護されていないルート
const publicRoutes = ['/', '/login', '/callback'];

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res: response });

    // セッションを更新
    const {
        data: { session },
    } = await supabase.auth.getSession();

    // 現在のパス
    const path = request.nextUrl.pathname;

    // プロフィールページやアップロードなど認証が必要なルートで、
    // セッションがない場合はログインページにリダイレクト
    if (!session && !publicRoutes.includes(path) && !path.includes('_next')) {
        const redirectUrl = new URL('/login', request.url);
        return NextResponse.redirect(redirectUrl);
    }

    // すでにログインしているユーザーがログインページにアクセスしたら
    // ホームページにリダイレクト
    if (session && path === '/login') {
        const redirectUrl = new URL('/', request.url);
        return NextResponse.redirect(redirectUrl);
    }

    return response;
}

// ミドルウェアを適用するパス
export const config = {
    matcher: [
        /*
         * 以下のパスにはミドルウェアを適用しない:
         * - _next/static (静的アセット)
         * - _next/image (Next.js Image Optimization API)
         * - favicon.ico (ファビコン)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}; 