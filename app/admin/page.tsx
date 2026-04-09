import Link from "next/link";
import {
  isNoticeAdminAuthenticated,
  isNoticeAdminCredentialsConfigured,
  isUsingFallbackNoticeCredentials,
} from "@/lib/notice-admin";
import { loginNoticeAdmin, logoutNoticeAdmin } from "../notice/actions";
import styles from "./admin.module.css";

export const runtime = "nodejs";

type AdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getErrorMessage(error: string | undefined) {
  switch (error) {
    case "not-configured":
      return "관리자 로그인 설정이 아직 완료되지 않았습니다. Supabase 환경변수와 관리자 계정을 먼저 설정해 주세요.";
    case "invalid-credentials":
      return "아이디 또는 비밀번호가 올바르지 않습니다.";
    case "not-authenticated":
      return "로그인 후 다시 시도해 주세요.";
    default:
      return null;
  }
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const error = readSearchParam(params.error);
  const authenticated = await isNoticeAdminAuthenticated();
  const credentialsConfigured = isNoticeAdminCredentialsConfigured();
  const usingFallbackCredentials = isUsingFallbackNoticeCredentials();
  const errorMessage = getErrorMessage(error);

  return (
    <main className={styles.pageWrap}>
      <section className={styles.container}>
        <div className={styles.panel}>
          <div className={styles.header}>
            <h1 className={styles.title}>관리자 로그인</h1>
            <p className={styles.text}>
              공지사항, 메인 피드, 배경 이미지를 관리합니다.
            </p>
          </div>

          {errorMessage ? (
            <p className={`${styles.messageBox} ${styles.errorMessage}`}>
              {errorMessage}
            </p>
          ) : null}

          {usingFallbackCredentials ? (
            <div className={`${styles.messageBox} ${styles.infoMessage}`}>
              <span className={styles.messageLabel}>개발 환경</span>
              <p>
                기본 계정은 <strong>admin</strong> /{" "}
                <strong>godeokbon-admin</strong> 입니다.
              </p>
            </div>
          ) : null}

          {authenticated ? (
            <div className={styles.loggedInBox}>
              <p className={styles.loggedInText}>현재 관리자 로그인 상태입니다.</p>

              <div className={styles.buttonRow}>
                <Link href="/admin/site-media" className={styles.secondaryButton}>
                  배경 이미지 관리
                </Link>
                <form action={logoutNoticeAdmin}>
                  <button type="submit" className={styles.secondaryButton}>
                    로그아웃
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <form action={loginNoticeAdmin} className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label htmlFor="username" className={styles.fieldLabel}>
                  아이디
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  className={styles.textInput}
                  autoComplete="username"
                  placeholder="아이디를 입력해 주세요"
                  required
                  disabled={!credentialsConfigured}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="password" className={styles.fieldLabel}>
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className={styles.textInput}
                  autoComplete="current-password"
                  placeholder="비밀번호를 입력해 주세요"
                  required
                  disabled={!credentialsConfigured}
                />
              </div>

              <div className={styles.buttonRow}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={!credentialsConfigured}
                >
                  로그인
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
