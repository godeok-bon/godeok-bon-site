import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[#FFFFFF] font-['Pretendard']">
      <div className="w-full h-2 bg-[#FFB4B4]"></div>

      <div className="flex-grow flex flex-col justify-center items-center px-6 py-20">

        <div className="relative w-64 h-48 mb-10"> 
           <Image 
             src="/logo.png" 
             alt="고덕 본 아동발달센터 로고" 
             fill
             className="object-contain"
             priority
           />
        </div>

        <div className="space-y-4 text-center">
          <h2 className="text-sm font-bold tracking-[0.3em] text-[#FFB4B4] uppercase">
            Godeok Bon Center
          </h2>
          <h1 className="text-4xl md:text-5xl font-black text-[#2D3436] tracking-tight">
            고덕 본<br />아동발달센터
          </h1>
        </div>

        <div className="w-16 h-px bg-[#E2E2E2] my-12"></div>

        <div className="max-w-md text-center">
          <p className="text-xl font-medium text-[#424245] leading-relaxed">
            반가워요! <br />
            아이들의 웃음소리가 가득할 공간을<br />
            포근하게 준비하고 있어요.
          </p>
          <p className="mt-8 text-[#86868B] leading-relaxed">
            보다 따뜻하고 전문적인 치료 환경으로<br />
            곧 여러분을 맞이하겠습니다.
          </p>
        </div>

        <div className="mt-16 text-center">
          <span className="block text-xs font-semibold text-[#86868B] mb-2 tracking-[0.2em] uppercase">
            Contact
          </span>
          <a href="tel:031-667-2001" className="text-3xl font-bold text-[#2D3436] hover:text-[#FFB4B4] transition-colors">
            031.667.2001
          </a>
        </div>
      </div>

      <footer className="w-full py-8 text-center text-[#B2BEC3] text-sm">
        <p>아이의 성장을 함께 응원합니다</p>
      </footer>
    </main>
  );
}