import DbTerminal from '@/components/db-terminal';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <DbTerminal />
    </main>
  );
}
