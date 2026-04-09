import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import SubHero from "@/components/SubHero";
import NoticeEditor from "@/components/NoticeEditor";
import { isNoticeAdminAuthenticated } from "@/lib/notice-admin";
import { saveNoticeAction } from "../actions";
import styles from "../editor.module.css";

export const runtime = "nodejs";

type NoticeWritePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NoticeWritePage({
  searchParams,
}: NoticeWritePageProps) {
  noStore();

  const authenticated = await isNoticeAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin");
  }

  const params = await searchParams;
  const error = readSearchParam(params.error);

  return (
    <>
      <SubHero
        title="공지 작성"
        desc="새 공지사항을 등록합니다"
        heroKey="noticeWriteHero"
      />

      <main className={styles.pageWrap}>
        <section className={styles.container}>
          {error === "save-failed" ? (
            <p className={styles.messageBox}>제목과 본문을 다시 확인해 주세요.</p>
          ) : null}

          <div className={styles.panel}>
            <div className={styles.header}>
              <h2 className={styles.title}>공지 작성</h2>
              <p className={styles.text}>
                저장 후에는 상세 페이지로 이동하며 목록에서도 바로 확인할 수
                있습니다.
              </p>
            </div>

            <form action={saveNoticeAction} className={styles.formGrid}>
              <input type="hidden" name="returnTo" value="/notice/write" />
              <input type="hidden" name="category" value="공지사항" />

              <div className={styles.fieldGroup}>
                <label htmlFor="title" className={styles.fieldLabel}>
                  제목
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className={styles.textInput}
                  placeholder="공지 제목을 입력해 주세요"
                  required
                />
              </div>

              <div className={styles.inlineFields}>
                <label className={styles.checkboxField}>
                  <input type="checkbox" name="pinned" />
                  상단 고정 공지
                </label>
              </div>

              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>본문</span>
                <NoticeEditor name="content" initialValue="" />
              </div>

              <div className={styles.buttonRow}>
                <button type="submit" className={styles.primaryButton}>
                  저장
                </button>
                <Link href="/notice" className={styles.secondaryButton}>
                  목록
                </Link>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
