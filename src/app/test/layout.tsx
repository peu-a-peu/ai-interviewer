export default function RootLayout({
    children,
  }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="py-10 max-w-screen-lg  mx-auto">
            {children}
        </div>
    );
  }
  