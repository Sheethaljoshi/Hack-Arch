import "@/app/globals.css"; 
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "HAck-Arch",
  description: "A Chaos chat application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
