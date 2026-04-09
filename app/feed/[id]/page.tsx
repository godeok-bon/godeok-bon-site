import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import Image from "next/image";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { deleteHomeFeedItemAction } from "@/app/home-feed/actions";
import {
  getAdjacentHomeFeedItems,
  formatHomeFeedDate,
  getHomeFeedItemById,
  getHomeFeedReadTime,
} from "@/lib/home-feed";
import { isNoticeAdminAuthenticated } from "@/lib/notice-admin";
import styles from "../feed.module.css";

export const runtime = "nodejs";

type FeedDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function FeedDetailPage({ params }: FeedDetailPageProps) {
  noStore();

  const { id } = await params;
  const [item, authenticated, adjacentItems] = await Promise.all([
    getHomeFeedItemById(id),
    isNoticeAdminAuthenticated(),
    getAdjacentHomeFeedItems(id),
  ]);

  if (!item) {
    notFound();
  }

  const hasHtmlContent = /<[^>]+>/.test(item.content);
  const fallbackParagraphs = item.content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <main className={styles.pageWrap}>
      <section className={styles.container}>
        {authenticated ? (
          <div className={styles.adminBar}>
            <Link
              href={`/home-feed/${item.id}/edit`}
              className={styles.adminAction}
            >
              수정
            </Link>

            <form action={deleteHomeFeedItemAction}>
              <input type="hidden" name="id" value={item.id} />
              <ConfirmSubmitButton className={styles.adminAction}>
                삭제
              </ConfirmSubmitButton>
            </form>
          </div>
        ) : null}

        <article className={styles.article}>
          <header className={styles.header}>
            <h1 className={styles.postTitle}>{item.title}</h1>

            <div className={styles.metaRow}>
              <span>{formatHomeFeedDate(item.createdAt)}</span>
              <span className={styles.dot} aria-hidden="true" />
              <span>{getHomeFeedReadTime(item.content)} min read</span>
            </div>
          </header>

          <div className={styles.imageSection}>
            <div className={styles.imageWrap}>
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={1600}
                height={1600}
                priority
                className={styles.image}
              />
            </div>
          </div>

          <div className={styles.contentSection}>
            {hasHtmlContent ? (
              <div
                className={styles.contentHtml}
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            ) : fallbackParagraphs.length > 0 ? (
              fallbackParagraphs.map((paragraph, index) => (
                <p key={`${item.id}-${index}`} className={styles.contentParagraph}>
                  {paragraph}
                </p>
              ))
            ) : (
              <p className={styles.contentParagraph}>{item.title}</p>
            )}
          </div>

          {item.tags.length > 0 ? (
            <div className={styles.tagList}>
              {item.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          {adjacentItems.next ? (
            <div className={styles.nextRow}>
              <Link href={`/feed/${adjacentItems.next.id}`} className={styles.nextLink}>
                다음 소식
              </Link>
            </div>
          ) : null}
        </article>
      </section>
    </main>
  );
}
