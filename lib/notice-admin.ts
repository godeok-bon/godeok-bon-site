import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv, hasSupabasePublicEnv } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const adminCookieName = "godeok_notice_admin";
const fallbackUsername = "admin";
const fallbackPassword = "godeokbon-admin";

type AdminAccount = {
  user_id: string;
  username: string;
  email: string;
  display_name: string | null;
};

function getFallbackAdminCredentials() {
  const configuredUsername = process.env.NOTICE_ADMIN_USERNAME?.trim();
  const configuredPassword = process.env.NOTICE_ADMIN_PASSWORD?.trim();

  if (configuredUsername && configuredPassword) {
    return {
      username: configuredUsername,
      password: configuredPassword,
    };
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      username: fallbackUsername,
      password: fallbackPassword,
    };
  }

  return {
    username: "",
    password: "",
  };
}

function createFallbackSessionToken(username: string, password: string) {
  return createHash("sha256")
    .update(`notice-admin:${username}:${password}`)
    .digest("hex");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

async function getAdminAccountByUsername(username: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id, username, email, display_name")
    .eq("username", username.trim())
    .maybeSingle<AdminAccount>();

  if (error) {
    throw new Error("관리자 계정 정보를 불러오지 못했습니다.");
  }

  return data;
}

async function getAdminAccountByUserId(userId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id, username, email, display_name")
    .eq("user_id", userId)
    .maybeSingle<AdminAccount>();

  if (error) {
    throw new Error("관리자 권한 정보를 확인하지 못했습니다.");
  }

  return data;
}

export function isNoticeAdminCredentialsConfigured() {
  if (hasSupabasePublicEnv() && hasSupabaseAdminEnv()) {
    return true;
  }

  const credentials = getFallbackAdminCredentials();
  return credentials.username.length > 0 && credentials.password.length > 0;
}

export function isUsingFallbackNoticeCredentials() {
  return (
    !hasSupabasePublicEnv() &&
    !hasSupabaseAdminEnv() &&
    !process.env.NOTICE_ADMIN_USERNAME &&
    !process.env.NOTICE_ADMIN_PASSWORD &&
    process.env.NODE_ENV !== "production"
  );
}

export function validateNoticeAdminCredentials(input: {
  username: string;
  password: string;
}) {
  const credentials = getFallbackAdminCredentials();

  if (!credentials.username || !credentials.password) {
    return false;
  }

  return safeCompare(
    createFallbackSessionToken(input.username.trim(), input.password.trim()),
    createFallbackSessionToken(credentials.username, credentials.password),
  );
}

export async function isNoticeAdminAuthenticated() {
  if (hasSupabasePublicEnv() && hasSupabaseAdminEnv()) {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return false;
    }

    const adminAccount = await getAdminAccountByUserId(user.id);
    return Boolean(adminAccount);
  }

  const credentials = getFallbackAdminCredentials();

  if (!credentials.username || !credentials.password) {
    return false;
  }

  const cookieStore = await cookies();
  const currentToken = cookieStore.get(adminCookieName)?.value ?? "";

  return safeCompare(
    currentToken,
    createFallbackSessionToken(credentials.username, credentials.password),
  );
}

export async function loginNoticeAdminWithUsernamePassword(input: {
  username: string;
  password: string;
}) {
  if (hasSupabasePublicEnv() && hasSupabaseAdminEnv()) {
    const adminAccount = await getAdminAccountByUsername(input.username);

    if (!adminAccount) {
      return false;
    }

    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: adminAccount.email,
      password: input.password.trim(),
    });

    return !error;
  }

  if (!validateNoticeAdminCredentials(input)) {
    return false;
  }

  await startNoticeAdminSession();
  return true;
}

export async function logoutNoticeAdminSession() {
  if (hasSupabasePublicEnv() && hasSupabaseAdminEnv()) {
    const supabase = await getSupabaseServerClient();
    await supabase.auth.signOut();
    return;
  }

  await clearNoticeAdminSession();
}

export async function startNoticeAdminSession() {
  const credentials = getFallbackAdminCredentials();

  if (!credentials.username || !credentials.password) {
    throw new Error("관리자 계정이 설정되지 않았습니다.");
  }

  const cookieStore = await cookies();

  cookieStore.set(
    adminCookieName,
    createFallbackSessionToken(credentials.username, credentials.password),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    },
  );
}

export async function clearNoticeAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(adminCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}
