export function hasSupabasePublicEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function hasSupabaseAdminEnv() {
  return Boolean(
    hasSupabasePublicEnv() && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

  if (!url || !anonKey) {
    throw new Error(
      "Supabase 공개 환경변수가 없습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해 주세요.",
    );
  }

  return { url, anonKey };
}

export function getSupabaseAdminEnv() {
  const { url } = getSupabasePublicEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

  if (!serviceRoleKey) {
    throw new Error(
      "Supabase 관리자 환경변수가 없습니다. SUPABASE_SERVICE_ROLE_KEY를 확인해 주세요.",
    );
  }

  return { url, serviceRoleKey };
}
