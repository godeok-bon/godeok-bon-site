import Image from "next/image";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound, redirect } from "next/navigation";
import SubHero from "@/components/SubHero";
import NoticeEditor from "@/components/NoticeEditor";
import { getHomeFeedItemById } from "@/lib/home-feed";
import { isNoticeAdminAuthenticated } from "@/lib/notice-admin";
import { saveHomeFeedItemAction } from "../../actions";
import styles from "../../form.module.css";

export const runtime = "nodejs";

type HomeFeedEditPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomeFeedEditPage({
  params,
  searchParams,
}: HomeFeedEditPageProps) {
  noStore();

  const authenticated = await isNoticeAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin");
  }

  const { id } = await params;
  const item = await getHomeFeedItemById(id);

  if (!item) {
    notFound();
  }

  const query = await searchParams;
  const error = readSearchParam(query.error);

  return (
    <>
      <SubHero
        title="메인 카드 수정"
        desc="등록된 메인 카드 이미지를 수정합니다"
        heroKey="feedEditHero"
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
              <h2 className={styles.title}>메인 카드 수정</h2>
              <p className={styles.text}>
                새 이미지를 선택하지 않으면 기존 카드 이미지를 그대로 사용합니다.
              </p>
            </div>

            <form action={saveHomeFeedItemAction} className={styles.formGrid}>
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="existingImageUrl" value={item.imageUrl} />
              <input type="hidden" name="category" value="Notice" />
              <input
                type="hidden"
                name="returnTo"
                value={`/home-feed/${item.id}/edit`}
              />

              <div className={styles.fieldGroup}>
                <label htmlFor="title" className={styles.fieldLabel}>
                  관리용 제목
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className={styles.textInput}
                  defaultValue={item.title}
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
                  defaultValue={item.tags.join(", ")}
                  placeholder="예: 감각통합, 소그룹수업, 아동발달"
                />
              </div>

              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>내용</span>
                <NoticeEditor name="content" initialValue={item.content} />
              </div>

              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>현재 이미지</span>
                <div className={styles.previewCard}>
                  <div className={styles.previewImageWrap}>
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="360px"
                      className={styles.previewImage}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="imageFile" className={styles.fieldLabel}>
                  새 이미지
                </label>
                <input
                  id="imageFile"
                  name="imageFile"
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                  className={styles.fileInput}
                />
                <p className={styles.fieldHint}>
                  이미지를 바꾸고 싶을 때만 새 파일을 선택해 주세요. SVG는
                  업로드할 수 없습니다.
                </p>
              </div>

              <div className={styles.buttonRow}>
                <button type="submit" className={styles.primaryButton}>
                  수정 저장
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
