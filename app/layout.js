export const metadata = {
  title: "Sulai — Ask about Sulaiman's work",
  description: "Sulai is an AI assistant for Sulaiman Hassan's portfolio.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Manrope:wght@600;700&display=swap"
        />
        <link rel="stylesheet" href="/sulai-chat.css" />
        <script src="/sulai-chat.js" defer />
      </head>
      <body style={{ margin: 0, background: "#0b0d12" }}>{children}</body>
    </html>
  );
}
