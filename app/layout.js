import './globals.css';

export const metadata = {
  title: 'LIFE OS v3 — 내 인생의 운영체제',
  description: '서사는 크게, 운영은 촘촘하게',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
