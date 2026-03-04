import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#FFFFFF] px-6 text-[#1D1D1F]">
      
      {/* 로고 영역 */}
      <div className="relative w-40 h-28 mb-16">
        <Image 
          src="/logo.png" 
          alt="고덕 본 아동발달센터" 
          fill 
          className="object-contain" 
          priority 
        />
      </div>

      {/* 텍스트 영역: 더 굵고 확실한 존재감으로 수정 */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1D1D1F] tracking-tight">
          고덕 본 아동발달센터
        </h1>
        <p className="text-lg md:text-xl font-semibold text-[#636E72] tracking-wide">
          아이의 성장을 위한 소중한 준비 중입니다.
        </p>
      </div>

      {/* 연락처 영역: 연락처도 같이 굵게 변경 */}
      <div className="mt-16">
        <a 
          href="tel:031-000-0000" 
          className="text-xl font-bold border-b-2 border-[#1D1D1F] pb-1 hover:text-[#8C232E] hover:border-[#8C232E] transition-all"
        >
          031.667.2001
        </a>
      </div>

      {/* 하단 푸터 */}
      <footer className="fixed bottom-12 text-[10px] text-[#A6A6A6] tracking-[0.3em] uppercase">
        Coming Soon
      </footer>
    </main>
  );
}