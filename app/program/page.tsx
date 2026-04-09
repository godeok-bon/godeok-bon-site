import SubHero from "@/components/SubHero";
import styles from "./program.module.css";

const evaluationSteps = [
  {
    number: "01",
    title: "초기 상담",
    desc: "아이의 현재 모습과 보호자 질문을 정리합니다.",
  },
  {
    number: "02",
    title: "관찰 및 평가",
    desc: "정서, 언어, 인지, 사회성을 중심으로 살펴봅니다.",
  },
  {
    number: "03",
    title: "치료 계획",
    desc: "우선 목표와 적절한 프로그램을 안내합니다.",
  },
  {
    number: "04",
    title: "치료 진행",
    desc: "아이 반응을 보며 목표를 조정하고 피드백을 나눕니다.",
  },
];

const treatmentPrograms = [
  {
    title: "놀이치료",
    summary:
      "놀이 안에서 감정과 관계를 안전하게 경험하도록 돕고, 정서적 안정과 자기표현을 키우는 치료입니다.",
    forChildren: [
      "감정 표현이 어렵고 쉽게 폭발하거나 위축되는 아이",
      "친구 관계에서 갈등이 잦거나 관계 맺기를 힘들어하는 아이",
    ],
    focus: [
      "놀이를 통해 감정을 알아차리고 적절히 표현하는 경험을 쌓습니다.",
      "안정된 관계 안에서 자기조절과 사회적 기술을 연습합니다.",
    ],
    outcomes: [
      "감정을 행동 대신 표현으로 옮기는 힘이 자랍니다.",
      "관계 상황에서 불안이 줄고 또래와의 상호작용이 안정될 수 있습니다.",
    ],
  },
  {
    title: "언어치료",
    summary:
      "이해와 표현, 발음, 문장 구성, 읽기·쓰기 기초를 아이의 수준에 맞춰 확장하는 치료입니다.",
    forChildren: [
      "말이 늦거나 원하는 것을 말로 전달하기 어려운 아이",
      "발음, 문장 표현, 읽기·쓰기에서 어려움을 보이는 아이",
    ],
    focus: [
      "낱말과 문장 표현을 넓히고 상황에 맞게 말하는 연습을 합니다.",
      "듣기 이해와 이야기 구성, 학습 언어의 기초를 함께 다룹니다.",
    ],
    outcomes: [
      "자신의 생각과 요구를 더 분명하게 전달할 수 있게 됩니다.",
      "수업과 일상에서 듣고 이해하는 힘이 조금씩 안정될 수 있습니다.",
    ],
  },
  {
    title: "인지치료",
    summary:
      "주의집중, 기억, 문제 해결, 규칙 이해를 발달 단계에 맞게 훈련해 학습과 일상 적응의 기반을 만드는 치료입니다.",
    forChildren: [
      "집중 유지가 어렵고 과제 지속 시간이 짧은 아이",
      "규칙 이해와 문제 해결이 어려운 아이",
    ],
    focus: [
      "주의집중과 작업 기억을 강화해 과제 수행의 바탕을 만듭니다.",
      "단계적인 문제 해결 경험을 통해 생각하는 과정을 구조화합니다.",
    ],
    outcomes: [
      "과제 시작과 마무리가 조금 더 안정적으로 이어질 수 있습니다.",
      "규칙 이해와 상황 판단이 분명해지면서 일상 적응이 좋아질 수 있습니다.",
    ],
  },
  {
    title: "사회성 그룹",
    summary:
      "소규모 또래 집단 안에서 협동, 의사소통, 관계 조절을 직접 연습하는 프로그램입니다.",
    forChildren: [
      "친구와 어울리고 싶지만 방법이 서툰 아이",
      "차례 지키기와 갈등 조절이 어려운 아이",
    ],
    focus: [
      "또래와 주고받는 상황 안에서 대화, 협동, 감정 조절을 연습합니다.",
      "갈등이 생겼을 때 적절히 표현하고 조율하는 방법을 익힙니다.",
    ],
    outcomes: [
      "친구와 함께 있는 상황에서 긴장과 회피가 줄어들 수 있습니다.",
      "또래 관계 안에서 자신감과 관계 기술이 함께 자랄 수 있습니다.",
    ],
  },
];

export default function ProgramPage() {
  return (
    <>
      <SubHero
        title="평가 및 치료"
        desc="아이의 현재 상태를 정확히 이해하고, 필요한 치료 방향을 함께 정리합니다."
        heroKey="programHero"
      />

      <main className={styles.programPage}>
        <section className={`${styles.section} ${styles.introSection}`}>
          <div className={styles.introCopy}>
            <h2 className={styles.sectionTitle}>
              아이의 현재 상태를 보고 필요한 평가와 치료를 안내합니다.
            </h2>
            <p className={styles.sectionText}>
              고덕본 아동발달센터는 정서, 언어, 인지, 사회성을 함께 살펴본 뒤
              아이에게 지금 가장 필요한 방향을 제안합니다.
            </p>
          </div>

          <div className={styles.stepGrid}>
            {evaluationSteps.map((step) => (
              <article key={step.number} className={styles.stepItem}>
                <span className={styles.stepNumber}>{step.number}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>치료 프로그램</h2>
            <p className={styles.sectionText}>
              프로그램은 단독 또는 병행으로 진행할 수 있으며, 현재 상태에 맞춰
              우선순위를 정합니다.
            </p>
          </div>

          <div className={styles.programTable}>
            {treatmentPrograms.map((program) => (
              <article key={program.title} className={styles.programRow}>
                <div className={styles.programSummary}>
                  <h3 className={styles.programName}>{program.title}</h3>
                  <p className={styles.programText}>{program.summary}</p>
                </div>

                <div className={styles.programContent}>
                  <div className={styles.programLine}>
                    <h4>추천 대상</h4>
                    <ul className={styles.detailList}>
                      {program.forChildren.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.programLine}>
                    <h4>중점</h4>
                    <ul className={styles.detailList}>
                      {program.focus.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.programLine}>
                    <h4>기대 변화</h4>
                    <ul className={styles.detailList}>
                      {program.outcomes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

      </main>
    </>
  );
}
