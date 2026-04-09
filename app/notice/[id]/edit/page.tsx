import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound, redirect } from "next/navigation";
import SubHero from "@/components/SubHero";
import NoticeEditor from "@/components/NoticeEditor";
import { isNoticeAdminAuthenticated } from "@/lib/notice-admin";
import { getNoticeById } from "@/lib/notices";
import { saveNoticeAction } from "../../actions";
import styles from "../../editor.module.css";

export const runtime = "nodejs";

type NoticeEditPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NoticeEditPage({
  params,
  searchParams,
}: NoticeEditPageProps) {
  noStore();

  const authenticated = await isNoticeAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin");
  }

  const { id } = await params;
  const notice = await getNoticeById(id);

  if (!notice) {
    notFound();
  }

  const query = await searchParams;
  const error = readSearchParam(query.error);

  return (
    <>
      <SubHero
        title="공지 수정"
        desc="등록된 공지사항을 수정합니다"
        heroKey="noticeEditHero"
      />

      <main className={styles.pageWrap}>
        <section className={styles.container}>
          {error === "save-failed" ? (
            <p className={styles.messageBox}>제목과 본문을 다시 확인해 주세요.</p>
          ) : null}

          <div className={styles.panel}>
            <div className={styles.header}>
              <h2 className={styles.title}>공지 수정</h2>
              <p className={styles.text}>
                수정 후 저장하면 상세 페이지와 목록에 바로 반영됩니다.
              </p>
            </div>

            <form action={saveNoticeAction} className={styles.formGrid}>
              <input type="hidden" name="id" value={notice.id} />
              <input type="hidden" name="category" value="공지사항" />
              <input
                type="hidden"
                name="returnTo"
                value={`/notice/${notice.id}/edit`}
              />

              <div className={styles.fieldGroup}>
                <label htmlFor="title" className={styles.fieldLabel}>
                  제목
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className={styles.textInput}
                  defaultValue={notice.title}
                  required
                />
              </div>

              <div className={styles.inlineFields}>
                <label className={styles.checkboxField}>
                  <input
                    type="checkbox"
                    name="pinned"
                    defaultChecked={notice.pinned}
                  />
                  상단 고정 공지
                </label>
              </div>

              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>본문</span>
                <NoticeEditor name="content" initialValue={notice.content} />
              </div>

              <div className={styles.buttonRow}>
                <button type="submit" className={styles.primaryButton}>
                  수정 저장
                </button>
                <Link
                  href={`/notice/${notice.id}`}
                  className={styles.secondaryButton}
                >
                  상세로 돌아가기
                </Link>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
