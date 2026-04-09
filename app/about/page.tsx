import SubHero from "@/components/SubHero";
import styles from "./about.module.css";

export default function AboutPage() {
  return (
    <>
      <SubHero
        title="센터 소개"
        desc="아이의 속도를 존중하며 함께 걷는 공간"
        heroKey="aboutHero"
      />
      
      <main className={styles.aboutWrap}>
        <section className={styles.introSection}>
          <div className={styles.introTextBox}>
            <span className={styles.label}>OUR PHILOSOPHY</span>
            <h2 className={styles.title}>가장 좋은 치료는<br/>아이의 마음을 읽어주는 것에서 시작합니다.</h2>
            <div className={styles.desc}>
              <p>
                안녕하세요. 고덕본 아동발달센터입니다.<br/><br/>
                아이들은 저마다 다른 속도와 방식으로 세상을 배우고 성장합니다. 
                때로는 그 과정에서 작은 어려움을 마주하기도 하지만, 
                적절한 시기에 따뜻한 지지와 전문적인 도움을 받는다면 
                아이는 스스로 자신의 잠재력을 활짝 피워낼 수 있습니다.<br/><br/>
                우리 센터는 부모님의 불안한 마음을 덜어드리고, 
                아이가 즐겁고 편안하게 성장할 수 있도록 
                분야별 전문 치료사들이 체계적이고 진정성 있는 
                통합 중재 프로그램을 제공합니다.
              </p>
            </div>
          </div>
          <div className={styles.introImageBox}>
            <img src="/center4.jpeg" alt="고덕본 아동발달센터 내부" />
          </div>
        </section>

        <section className={styles.valuesSection}>
          <div className={styles.valuesHeader}>
            <h2>우리의 3가지 약속</h2>
            <p>아이와 부모님이 안심하고 다닐 수 있는 센터를 만듭니다.</p>
          </div>

          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.vNum}>01</div>
              <h3>아이 중심의 맞춤형 치료</h3>
              <p>틀에 박힌 치료가 아닌, 개별 아이의 기질, 발달 수준, 흥미를 면밀히 분석하여 가장 최적화된 1:1 맞춤 치료 목표를 설정합니다.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.vNum}>02</div>
              <h3>전문가의 통합적 접근</h3>
              <p>언어, 인지, 놀이, 감각통합 등 분야별 우수한 전문 치료사들이 지속적인 사례 회의를 통해 아이의 전인적 발달을 돕습니다.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.vNum}>03</div>
              <h3>부모님과의 긴밀한 소통</h3>
              <p>치료실 안에서의 변화가 가정과 일상으로 이어질 수 있도록, 매 회기 투명하고 깊이 있는 부모 상담과 피드백을 진행합니다.</p>
            </div>
          </div>
        </section>

        <section className={styles.gallerySection}>
          <div className={styles.galleryHeader}>
            <h2>센터 내부</h2>
            <p>아이들의 눈높이에 맞춘 따뜻하고 안전한 공간입니다.</p>
          </div>
          <div className={styles.galleryGrid}>
            <div className={styles.galleryItem}>
              <img src="/center3.jpeg" alt="놀이 치료실" />
            </div>
            <div className={styles.galleryItem}>
              <img src="/center2.jpeg" alt="대기실 및 로봇 책장" />
            </div>
            <div className={styles.galleryItem}>
              <img src="/center1.jpeg" alt="센터 외부 전경" />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
