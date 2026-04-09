import SubHero from "@/components/SubHero";
import styles from "./contact.module.css";

export default function ContactPage() {
  return (
    <>
      <SubHero
        title="오시는 길"
        desc="고덕본아동발달센터 찾아오시는 방법"
        heroKey="contactHero"
      />

      <main className={styles.contactContainer}>
        <section className={styles.infoSection}>
          <h2 className={styles.contactTitle}>Contact Us</h2>

          <div className={styles.contactTable}>
            <div className={styles.row}>
              <div className={styles.key}>진료시간</div>
              <div className={styles.value}>
                <p>월 · 화 · 수 · 목 · 금: 10:00 ~ 19:00</p>
                <p>토요일: 10:00 ~ 18:00</p>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.key}>진료휴무</div>
              <div className={styles.value}>일요일 휴무</div>
            </div>

            <div className={styles.row}>
              <div className={styles.key}>전화번호</div>
              <div className={styles.value}>
                <a href="tel:031-667-2001" className={styles.phoneLink}>
                  031-667-2001
                </a>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.key}>오시는 길</div>
              <div className={styles.value}>경기도 평택시 고덕국제7로 117 명문프라자 2층 1동 208호</div>
            </div>

            <div className={styles.row}>
              <div className={styles.key}>주차안내</div>
              <div className={styles.value}>건물 내 무료주차 가능합니다.</div>
            </div>
          </div>
        </section>

        <div className={styles.mapBox}>
          <iframe
            src="https://map.kakao.com/?urlX=506635&urlY=982298&urlLevel=3&map_type=TYPE_MAP&map_hybrid=false"
            width="100%"
            height="100%"
            frameBorder="0"
            title="고덕본아동발달센터 지도"
            loading="lazy"
          />
        </div>
      </main>
    </>
  );
}
