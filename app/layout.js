export const metadata = {
  title: "Sulai — Ask about Sulaiman's work",
  description: "Sulai is an AI assistant for Sulaiman Hassan's portfolio.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0b0d12", color: "#e8eaf0" }}>
        {children}
      </body>
    </html>
  );
}
