import Link from "next/link";
import SubHero from "@/components/SubHero";
import { isNoticeAdminAuthenticated } from "@/lib/notice-admin";
import { formatNoticeDate, getNotices } from "@/lib/notices";
import { deleteNoticeAction } from "./actions";
import styles from "./notice.module.css";

export const runtime = "nodejs";
const noticesPerPage = 10;

type NoticePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getPageNumber(value: string | undefined) {
  const page = Number.parseInt(value ?? "1", 10);

  if (Number.isNaN(page) || page < 1) {
    return 1;
  }

  return page;
}

function buildNoticePageHref(page: number) {
  const searchParams = new URLSearchParams();

  if (page > 1) {
    searchParams.set("page", String(page));
  }

  const query = searchParams.toString();

  return query ? `/notice?${query}` : "/notice";
}

export default async function NoticePage({ searchParams }: NoticePageProps) {
  const params = await searchParams;
  const pageParam = readSearchParam(params.page);
  const notices = await getNotices();
  const totalCount = notices.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / noticesPerPage));
  const requestedPage = getPageNumber(pageParam);
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * noticesPerPage;
  const pagedNotices = notices.slice(startIndex, startIndex + noticesPerPage);
  const authenticated = await isNoticeAdminAuthenticated();

  return (
    <>
      <SubHero
        title="공지사항"
        desc="센터 공지와 운영 소식을 확인하실 수 있습니다"
        heroKey="noticeHero"
      />

      <main className={styles.pageWrap}>
        <section className={styles.container}>
          <div className={styles.boardHeader}>
            <div className={styles.boardMeta}>
              <p className={styles.resultText}>
                총 <strong>{totalCount}</strong>개의 글이 있습니다.
              </p>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <div
              className={`${styles.tableRow} ${styles.tableHead} ${
                authenticated ? styles.tableRowAdmin : ""
              }`}
            >
              <span>번호</span>
              <span>제목</span>
              <span>등록일</span>
              <span>조회</span>
              {authenticated ? <span>관리</span> : null}
            </div>

            {pagedNotices.length === 0 ? (
              <div className={styles.emptyRow}>등록된 공지사항이 없습니다.</div>
            ) : (
              pagedNotices.map((notice) => (
                <div
                  key={notice.id}
                  className={`${styles.tableRow} ${
                    authenticated ? styles.tableRowAdmin : ""
                  } ${notice.pinned ? styles.pinnedRow : ""}`}
                >
                  <span
                    className={`${styles.numberCell} ${
                      notice.pinned ? styles.pinnedNumber : ""
                    }`}
                  >
                    {notice.pinned ? "공지" : notice.id}
                  </span>
                  <Link
                    href={`/notice/${notice.id}`}
                    prefetch={false}
                    className={styles.titleCell}
                  >
                    {notice.title}
                  </Link>
                  <span className={styles.dateCell}>
                    {formatNoticeDate(notice.createdAt)}
                  </span>
                  <span className={styles.viewsCell}>{notice.views}</span>
                  {authenticated ? (
                    <span className={styles.manageCell}>
                      <Link
                        href={`/notice/${notice.id}/edit`}
                        className={styles.inlineButton}
                      >
                        수정
                      </Link>
                      <form action={deleteNoticeAction}>
                        <input type="hidden" name="id" value={notice.id} />
                        <button
                          type="submit"
                          className={styles.inlineButton}
                        >
                          삭제
                        </button>
                      </form>
                    </span>
                  ) : null}
                </div>
              ))
            )}
          </div>

          {totalPages > 1 ? (
            <nav className={styles.pagination} aria-label="공지사항 페이지 이동">
              <Link
                href={buildNoticePageHref(Math.max(1, currentPage - 1))}
                className={`${styles.pageButton} ${
                  currentPage === 1 ? styles.pageButtonDisabled : ""
                }`}
                aria-disabled={currentPage === 1}
                tabIndex={currentPage === 1 ? -1 : undefined}
              >
                이전
              </Link>

              <div className={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (page) => (
                    <Link
                      key={page}
                      href={buildNoticePageHref(page)}
                      className={`${styles.pageNumber} ${
                        currentPage === page ? styles.pageNumberActive : ""
                      }`}
                    >
                      {page}
                    </Link>
                  ),
                )}
              </div>

              <Link
                href={buildNoticePageHref(
                  Math.min(totalPages, currentPage + 1),
                )}
                className={`${styles.pageButton} ${
                  currentPage === totalPages ? styles.pageButtonDisabled : ""
                }`}
                aria-disabled={currentPage === totalPages}
                tabIndex={currentPage === totalPages ? -1 : undefined}
              >
                다음
              </Link>
            </nav>
          ) : null}

          {authenticated ? (
            <div className={styles.boardFooter}>
              <Link href="/notice/write" className={styles.primaryButton}>
                글쓰기
              </Link>
            </div>
          ) : null}
        </section>
      </main>
    </>
  );
}
