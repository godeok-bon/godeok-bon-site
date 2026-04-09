import "@toast-ui/editor/dist/toastui-editor.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuickFloating from "@/components/QuickFloating";
import { isNoticeAdminAuthenticated } from "@/lib/notice-admin";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isNoticeAdminAuthenticated();

  return (
    <html lang="ko">
      <body>
        <Header />
        <main>{children}</main>
        <QuickFloating
          authenticated={authenticated}
          tel="031-667-2001"
          naverPlaceUrl="https://map.naver.com/p/entry/place/2095984082"
          talkUrl="https://forms.gle/ptT6pXtqPdW4Lt8y7"
          adminMediaUrl="/admin/site-media"
        />
        <Footer />
      </body>
    </html>
  );
}
