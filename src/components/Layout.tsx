import Head from "next/head";
import Navbar from "./Navbar";
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Head>
        <title>Aubergine</title>
        <meta name="description" content="Emojies only twitter" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      <main className="flex h-screen flex-col justify-center">
        <div className="mx-auto h-full w-full border-x border-slate-600 md:max-w-2xl">
          {children}
        </div>
      </main>
    </>
  );
};

export default Layout;
