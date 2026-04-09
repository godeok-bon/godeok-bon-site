"use client";

import { useEffect, useState } from "react";
import { logoutNoticeAdmin } from "@/app/notice/actions";

type Props = {
  authenticated?: boolean;
  tel?: string;
  naverPlaceUrl: string;
  talkUrl: string;
  adminMediaUrl?: string;
};

export default function QuickFloating({
  authenticated = false,
  tel = "031-667-2001",
  naverPlaceUrl,
  talkUrl,
  adminMediaUrl = "/admin/site-media",
}: Props) {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <aside className="quick">
      <a
        className="quick__btn quick__naver"
        href={naverPlaceUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="네이버 플레이스"
      >
        <NaverIcon />
      </a>

      <a
        className="quick__btn quick__talk"
        href={talkUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="상담하기"
      >
        <TalkIcon />
      </a>

      <a
        className="quick__btn quick__call"
        href={`tel:${tel.replaceAll("-", "")}`}
        aria-label="전화하기"
      >
        <PhoneIcon />
      </a>

      {authenticated ? (
        <a
          href={adminMediaUrl}
          className="quick__btn quick__settings"
          aria-label="배경 이미지 관리"
        >
          <SettingsIcon />
        </a>
      ) : null}

      {authenticated ? (
        <form action={logoutNoticeAdmin}>
          <button
            type="submit"
            className="quick__btn quick__logout"
            aria-label="로그아웃"
          >
            <LogoutIcon />
          </button>
        </form>
      ) : null}

      <button
        className={`quick__top ${showTop ? "show" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </button>
    </aside>
  );
}

function PhoneIcon() {
  return (
    <svg className="quick__svg" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.6 10.8c1.3 2.6 3.9 5.2 6.5 6.5l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.9 21 3 13.1 3 3c0-.6.4-1 1-1h3.3c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z" />
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg className="quick__svg" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6h4.2l3.6 6.3V6H18v12h-4.1l-3.8-6.6V18H6V6z" />
    </svg>
  );
}

function TalkIcon() {
  return (
    <svg className="quick__svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 11V6a2 2 0 0 0-2-2H13" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      className="quick__svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      className="quick__svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.92 4.6H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.46.18.97.28 1.51.28H21a2 2 0 1 1 0 4h-.09c-.54 0-1.05.1-1.51.28Z" />
    </svg>
  );
}
