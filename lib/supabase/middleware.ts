import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type CookieItem = { name: string; value: string; options?: CookieOptions };

// Renova a sessão do Supabase e protege rotas privadas.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sem variáveis de ambiente configuradas: não derruba a app (evita 500 no
  // middleware). Deixa a requisição seguir para uma página exibir o erro.
  if (!url || !anon) {
    return supabaseResponse;
  }

  let user = null;
  try {
    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieItem[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Falha de rede/config ao validar a sessão → trata como não autenticado.
    user = null;
  }

  const path = request.nextUrl.pathname;
  const isPublic =
    path.startsWith('/login') ||
    path.startsWith('/auth') ||
    path.startsWith('/_next') ||
    path === '/favicon.ico';

  // Sem usuário e rota privada → manda para o login.
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Já logado tentando abrir o login → manda para o dashboard.
  if (user && path.startsWith('/login')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
