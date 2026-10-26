export default function CleanToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 overflow-y-auto w-full h-full">
      {children}
    </div>
  );
}
