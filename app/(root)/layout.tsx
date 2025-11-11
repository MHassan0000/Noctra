import Navbar from "../sections/navbar"


export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
        <Navbar/>
        {children}
    </main>
  );
}