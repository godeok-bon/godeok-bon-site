import Image from "next/image";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { deleteHomeFeedItemAction } from "@/app/home-feed/actions";
import {
  getHomeFeedItemsByCategory,
  getHomeFeedReadTime,
  formatHomeFeedDate,
} from "@/lib/home-feed";
import { isNoticeAdminAuthenticated } from "@/lib/notice-admin";
import { getSiteMediaSettings } from "@/lib/site-media";
import styles from "./page.module.css";

export default async function Page() {
  noStore();

  const [feedItems, authenticated] = await Promise.all([
    getHomeFeedItemsByCategory(),
    isNoticeAdminAuthenticated(),
  ]);
  const siteMediaSettings = await getSiteMediaSettings();
  const mainSlides = [
    siteMediaSettings.mainSlide1,
    siteMediaSettings.mainSlide2,
    siteMediaSettings.mainSlide3,
  ];

  return (
    <>
      <section
        className="hero-slider"
        style={{ backgroundImage: `url("${mainSlides[0]}")` }}
      >
        {mainSlides.map((imageUrl, index) => (
          <div
            key={`${imageUrl}-${index}`}
            className="slide"
            style={{ backgroundImage: `url("${imageUrl}")` }}
          />
        ))}
        <div className="hero-text">
          <h1>아이의 눈높이에서<br />세상을 바라보는 공간</h1>
          <p>고덕본 아동발달센터</p>
        </div>
      </section>

      <section className={styles.feedSection}>
        <div className={styles.feedGrid}>
          {authenticated ? (
            <Link
              href="/home-feed/write"
              className={`${styles.feedCard} ${styles.addCard}`}
            >
              <div className={styles.feedImageWrap}>
                <div className={styles.addCardInner}>
                  <span className={styles.addMark}>+</span>
                </div>
              </div>
              <div className={styles.feedCardBody}>
                <strong className={styles.feedTitle}>새 피드 등록</strong>
                <span className={styles.feedMeta}>메인 피드를 추가합니다</span>
              </div>
            </Link>
          ) : null}

          {feedItems.map((item, index) => (
            <article key={item.id} className={styles.feedCard}>
              <Link href={`/feed/${item.id}`} className={styles.feedLink}>
                <div className={styles.feedImageWrap}>
                  <Image
                    src={item.imageUrl}
                    alt={item.title || `고덕본아동발달센터 메인 카드 ${index + 1}`}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className={styles.feedImage}
                  />
                </div>

                <div className={styles.feedCardBody}>
                  <strong className={styles.feedTitle}>{item.title}</strong>
                  <span className={styles.feedMeta}>
                    {formatHomeFeedDate(item.createdAt)} ·{" "}
                    {getHomeFeedReadTime(item.content)} min
                  </span>
                </div>
              </Link>

              {authenticated ? (
                <div className={styles.adminTools}>
                  <Link
                    href={`/home-feed/${item.id}/edit`}
                    className={styles.adminTool}
                  >
                    수정
                  </Link>

                  <form
                    action={deleteHomeFeedItemAction}
                    className={styles.deleteForm}
                  >
                    <input type="hidden" name="id" value={item.id} />
                    <ConfirmSubmitButton className={styles.adminTool}>
                      삭제
                    </ConfirmSubmitButton>
                  </form>
                </div>
              ) : null}
            </article>
          ))}
        </div>

        {feedItems.length === 0 && !authenticated ? (
          <div className={styles.emptyState}>등록된 피드가 없습니다.</div>
        ) : null}
      </section>
    </>
  );
}
