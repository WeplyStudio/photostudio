import type { FC } from 'react';

const Header: FC = () => {
  return (
    <header className="max-w-4xl mx-auto text-center mb-8">
      <h1 className="stumble-font text-5xl md:text-7xl mb-2 italic tracking-tighter text-white">
        STUMBLE <span className="text-accent">STUDIO PRO</span>
      </h1>
      <p className="font-black text-xl text-primary/70 uppercase">Customize Your Victory</p>
    </header>
  );
};

export default Header;
