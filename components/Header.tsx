"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  
  const pathname = usePathname();
  const isMain = pathname === "/";

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
  }, [isMenuOpen]);

  return (
    // 메인 페이지일 땐 main-header 나머진 sub-header 클래스 부여
    <header className={isMain ? "main-header" : "sub-header"}>
      <Link href="/" className="logo">고덕본아동발달센터</Link>

      <button className={`hamburger ${isMenuOpen ? "active" : ""}`} onClick={toggleMenu}>
        <span></span><span></span><span></span>
      </button>

      <div className={`menu-overlay ${isMenuOpen ? "active" : ""}`} onClick={closeMenu} />

      <nav className={isMenuOpen ? "open" : ""}>
        <ul>
          <li><Link href="/notice" onClick={closeMenu}>공지사항</Link></li>
          <li><Link href="/column" onClick={closeMenu}>원장님 칼럼</Link></li>
          <li><Link href="/about" onClick={closeMenu}>센터 소개</Link></li>
          <li><Link href="/program" onClick={closeMenu}>평가 및 치료</Link></li>
          <li><Link href="/contact" onClick={closeMenu}>오시는 길</Link></li>
        </ul>
      </nav>
    </header>
  );
}
