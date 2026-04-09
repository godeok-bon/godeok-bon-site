import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import SubHero from "@/components/SubHero";
import { isNoticeAdminAuthenticated } from "@/lib/notice-admin";
import {
  formatNoticeDate,
  getAdjacentNotices,
  incrementNoticeViews,
} from "@/lib/notices";
import { deleteNoticeAction } from "../actions";
import styles from "../notice.module.css";

export const runtime = "nodejs";

type NoticeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function NoticeDetailPage({
  params,
}: NoticeDetailPageProps) {
  noStore();

  const { id } = await params;
  const notice = await incrementNoticeViews(id);
  const authenticated = await isNoticeAdminAuthenticated();

  if (!notice) {
    notFound();
  }

  const adjacentNotices = await getAdjacentNotices(id);

  return (
    <>
      <SubHero
        title="공지사항"
        desc="센터 공지와 운영 소식을 확인하실 수 있습니다"
        heroKey="noticeDetailHero"
      />

      <main className={styles.pageWrap}>
        <section className={`${styles.container} ${styles.detailContainer}`}>
          <article className={styles.detailWrap}>
            <div className={styles.detailTop}>
              <h1 className={styles.detailTitle}>{notice.title}</h1>

              <div className={styles.detailMeta}>
                <span>게시글 번호 {notice.id}</span>
                <span>{formatNoticeDate(notice.createdAt)}</span>
                <span>조회 {notice.views}</span>
              </div>
            </div>

            <div
              className={styles.detailContent}
              dangerouslySetInnerHTML={{ __html: notice.content }}
            />
          </article>

          <div className={styles.postNavigator}>
            <div className={styles.postNavRow}>
              <span className={styles.postNavLabel}>이전글</span>
              {adjacentNotices.previous ? (
                <Link
                  href={`/notice/${adjacentNotices.previous.id}`}
                  className={styles.postNavLink}
                >
                  {adjacentNotices.previous.title}
                </Link>
              ) : (
                <span className={styles.postNavEmpty}>
                  이전 게시글이 없습니다.
                </span>
              )}
            </div>

            <div className={styles.postNavRow}>
              <span className={styles.postNavLabel}>다음글</span>
              {adjacentNotices.next ? (
                <Link
                  href={`/notice/${adjacentNotices.next.id}`}
                  className={styles.postNavLink}
                >
                  {adjacentNotices.next.title}
                </Link>
              ) : (
                <span className={styles.postNavEmpty}>
                  다음 게시글이 없습니다.
                </span>
              )}
            </div>
          </div>

          <div className={styles.detailActions}>
            {authenticated ? (
              <>
                <Link
                  href={`/notice/${notice.id}/edit`}
                  className={styles.secondaryButton}
                >
                  수정
                </Link>
                <form action={deleteNoticeAction}>
                  <input type="hidden" name="id" value={notice.id} />
                  <input type="hidden" name="redirectTo" value="/notice" />
                  <button type="submit" className={styles.secondaryButton}>
                    삭제
                  </button>
                </form>
              </>
            ) : null}
          </div>
        </section>
      </main>
    </>
  );
}
