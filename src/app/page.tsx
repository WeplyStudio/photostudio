import Header from '@/components/studio/header';
import StumbleStudio from '@/components/studio/stumble-studio';

export default function Home() {
  return (
    <div className="p-4 md:p-8">
      <Header />
      <main className="max-w-7xl mx-auto">
        <StumbleStudio />
      </main>
    </div>
  );
}
