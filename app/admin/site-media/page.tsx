import Link from "next/link";
import { redirect } from "next/navigation";
import { isNoticeAdminAuthenticated } from "@/lib/notice-admin";
import { getSiteMediaSettings, siteHeroItems } from "@/lib/site-media";
import { updateSiteHeroImageAction } from "./actions";
import styles from "./site-media.module.css";

export const runtime = "nodejs";

type SiteMediaAdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getErrorMessage(error: string | undefined) {
  switch (error) {
    case "invalid-key":
      return "대상 페이지 정보를 다시 확인해 주세요.";
    case "missing-file":
      return "변경할 이미지를 선택해 주세요.";
    case "update-failed":
      return "이미지 저장 중 문제가 생겼습니다. 파일 형식과 용량을 확인해 주세요.";
    default:
      return error?.trim() ? error : null;
  }
}

const groupedItems = [
  {
    title: "메인 페이지",
    items: siteHeroItems.filter((item) => item.group === "메인 페이지"),
  },
  {
    title: "서브 페이지",
    items: siteHeroItems.filter((item) => item.group === "서브 페이지"),
  },
];

export default async function SiteMediaAdminPage({
  searchParams,
}: SiteMediaAdminPageProps) {
  const authenticated = await isNoticeAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin");
  }

  const params = await searchParams;
  const success = readSearchParam(params.success);
  const error = readSearchParam(params.error);
  const settings = await getSiteMediaSettings();
  const successItem = siteHeroItems.find((item) => item.key === success);
  const errorMessage = getErrorMessage(error);

  return (
    <main className={styles.pageWrap}>
      <section className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>배경 이미지 관리</h1>
            <p className={styles.text}>
              메인 슬라이드와 페이지별 상단 배경 이미지를 각각 따로 변경할 수
              있습니다.
            </p>
          </div>

          <Link href="/admin" className={styles.backLink}>
            관리자 화면
          </Link>
        </div>

        {successItem ? (
          <p className={`${styles.messageBox} ${styles.successMessage}`}>
            {successItem.label} 배경 이미지를 업데이트했습니다.
          </p>
        ) : null}

        {errorMessage ? (
          <p className={`${styles.messageBox} ${styles.errorMessage}`}>
            {errorMessage}
          </p>
        ) : null}

        {groupedItems.map((group) => (
          <section key={group.title} className={styles.group}>
            <h2 className={styles.groupTitle}>{group.title}</h2>

            <div className={styles.grid}>
              {group.items.map((item) => (
                <article key={item.key} className={styles.card}>
                  <div
                    className={styles.preview}
                    style={{ backgroundImage: `url("${settings[item.key]}")` }}
                  />

                  <div className={styles.content}>
                    <h3 className={styles.cardTitle}>{item.label}</h3>
                    <p className={styles.cardText}>{item.description}</p>

                    <form
                      action={updateSiteHeroImageAction}
                      className={styles.form}
                    >
                      <input type="hidden" name="key" value={item.key} />
                      <input
                        type="file"
                        name="imageFile"
                        accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                        className={styles.fileInput}
                        required
                      />
                      <button type="submit" className={styles.submitButton}>
                        이미지 변경
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}
