import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import SubHero from "@/components/SubHero";
import NoticeEditor from "@/components/NoticeEditor";
import { isNoticeAdminAuthenticated } from "@/lib/notice-admin";
import { saveHomeFeedItemAction } from "../actions";
import styles from "../form.module.css";

export const runtime = "nodejs";

type HomeFeedWritePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomeFeedWritePage({
  searchParams,
}: HomeFeedWritePageProps) {
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
        title="메인 카드 등록"
        desc="홈페이지 갤러리 카드를 등록합니다"
        heroKey="feedWriteHero"
      />

      <main className={styles.pageWrap}>
        <section className={styles.container}>
          {error === "save-failed" ? (
            <p className={styles.messageBox}>
              관리용 제목과 이미지를 다시 확인해 주세요.
            </p>
          ) : error ? <p className={styles.messageBox}>{error}</p> : null}

          <div className={styles.panel}>
            <div className={styles.header}>
              <h2 className={styles.title}>메인 카드 등록</h2>
              <p className={styles.text}>
                등록한 카드는 메인 페이지에 바로 반영되고, 클릭하면 피드 상세로
                이동합니다.
              </p>
            </div>

            <form action={saveHomeFeedItemAction} className={styles.formGrid}>
              <input type="hidden" name="returnTo" value="/home-feed/write" />
              <input type="hidden" name="category" value="Notice" />

              <div className={styles.fieldGroup}>
                <label htmlFor="title" className={styles.fieldLabel}>
                  관리용 제목
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className={styles.textInput}
                  placeholder="관리용 제목을 입력해 주세요"
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="tags" className={styles.fieldLabel}>
                  태그
                </label>
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  className={styles.textInput}
                  placeholder="예: 감각통합, 소그룹수업, 아동발달"
                />
              </div>

              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>내용</span>
                <NoticeEditor name="content" initialValue="" />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="imageFile" className={styles.fieldLabel}>
                  이미지
                </label>
                <input
                  id="imageFile"
                  name="imageFile"
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                  className={styles.fileInput}
                  required
                />
                <p className={styles.fieldHint}>
                  JPG, PNG, GIF, WEBP 파일만 업로드할 수 있습니다.
                </p>
              </div>

              <div className={styles.buttonRow}>
                <button type="submit" className={styles.primaryButton}>
                  저장
                </button>
                <Link href="/" className={styles.secondaryButton}>
                  메인으로 돌아가기
                </Link>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
