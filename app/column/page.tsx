import SubHero from "@/components/SubHero";
import styles from "./column.module.css";

export default function ColumnPage() {
  return (
    <>
      <SubHero
        title="원장님 소개"
        desc="아이 성장의 본질(本)을 치료하는 임상 전문가"
        heroKey="columnHero"
      />

      <main className={styles.directorContainer}>
        <section className={styles.directorHero}>
          <div className={styles.directorPhoto}>
            <div className={styles.photoPlaceholder}>미등록 사진</div>
          </div>
          
          <div className={styles.directorIntro}>
            <span className={styles.dLabel}>CENTER DIRECTOR</span>
            <h2 className={styles.dName}>한은실 원장</h2>
            <p className={styles.dSlogan}>아이 성장의 본질(本)을 치료하는 임상 전문가</p>
            
            <div className={styles.dPhilosophy}>
              <p className={styles.pHighlight}>
                &ldquo;아이가 건네는 놀이라는 언어, 17년의 깊이로 해독합니다.&rdquo;
              </p>
              <div className={styles.pDesc}>
                <p>놀이는 아이들의 마음을 보여주는 언어입니다. 연극적 상징과 놀이의 힘을 결합한 전문적인 치료로 아이들의 다친 마음을 어루만져 왔습니다.</p>
                <p>표면적인 증상 완화에 그치지 않고 아이 성장의 진짜 본질(本)을 회복시키는 것, 그것이 제가 지향하는 치료입니다.</p>
                <p>오랜 시간 축적된 직관과 흔들림 없는 전문성으로, 우리 아이들의 절대적인 마음의 안전기지가 되겠습니다.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.resumeSection}>
          <div className={styles.resumeGrid}>
            <div className={styles.resumeBlock}>
              <h3 className={styles.resumeTitle}>ACADEMIC & LICENSE</h3>
              <ul className={styles.resumeList}>
                <li>명지대학교 통합치료대학원 아동심리치료(놀이치료) 석사</li>
                <li>보건복지부 발달재활서비스 제공인력 자격</li>
                <li>문화예술교육사 2급 <span>(문화체육관광부 장관 인증)</span></li>
                <li>연극놀이지도사 1급 <span>(사다리연극놀이연구소 인증)</span></li>
                <li>놀이상담심리사 <span>(명지대학교 통합치료대학원 인증)</span></li>
              </ul>
            </div>
            <div className={styles.resumeBlock}>
              <h3 className={styles.resumeTitle}>RESEARCH & BOOKS</h3>
              <ul className={styles.resumeList}>
                <li>[공동집필] 우수 문화예술교육 전문가 교육프로그램 개발 연구 자료집 <span>(한국문화예술교육진흥원)</span></li>
                <li>[연구개발] 유아 문화예술교육 지원사업 프로그램 개발 자료집 <span>(충북문화재단)</span></li>
                <li>[연구개발] 연극놀이 프로그램 개발 자료집 〈연극 속으로 풍덩〉 <span>(충북문화재단)</span></li>
                <li>천안 독립기념관 〈임시정부〉 교육 프로그램 개발 및 시연 연구원</li>
              </ul>
            </div>
          </div>

          <div className={styles.resumeBlock}>
            <h3 className={styles.resumeTitle}>REPRESENTATIVE CAREER</h3>
            <div className={styles.careerGrid}>
              <div className={styles.careerSub}>
                <h4>임상 및 교육 기획</h4>
                <ul className={styles.resumeList}>
                  <li><strong>현)</strong> 사다리연극놀이연구소 연구원</li>
                  <li><strong>전)</strong> 사다리연극놀이연구소 아카데미 학사주임</li>
                  <li>한국문화예술진흥원(KCP) 우수 문화예술전문가 양성교육 연구원</li>
                  <li>호호발달센터 특수 청소년 연극치료 프로젝트</li>
                  <li>양평장애인 가족지원센터 성인 장애인 예술치료 프로그램 총괄 연출 및 치료</li>
                </ul>
              </div>
              <div className={styles.careerSub}>
                <h4>대외 활동 및 교사 연수</h4>
                <ul className={styles.resumeList}>
                  <li>충북 단재교육연수원 초등교사 대상 전문 연수 강사</li>
                  <li>용인문화재단 시민예술학교 교육 및 예술치료 프로그램 전담</li>
                  <li>국립어린이청소년도서관 독서 문화 체험 프로그램 전문 강사</li>
                  <li>용인 공생광장 문화예술교육 프로그램 운영</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
