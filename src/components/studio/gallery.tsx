"use client";

import type { FC } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Download, Sparkles } from 'lucide-react';

interface GalleryProps {
  photos: string[];
  onEditWithAi: (dataUrl: string) => void;
}

const Gallery: FC<GalleryProps> = ({ photos, onEditWithAi }) => {
  const downloadPhoto = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `stumble-studio-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="chunky-card p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="stumble-font text-2xl text-accent">GALERI KEMENANGAN</h3>
        <span className="bg-black/50 px-4 py-1 rounded-full text-xs font-bold">{photos.length} FOTO</span>
      </div>
      {photos.length === 0 ? (
        <div className="min-h-[100px] flex items-center justify-center text-center text-gray-400">
            <p>Your captured photos will appear here. <br /> Press CEKREK! to start.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 min-h-[100px]">
          {photos.map((photo, index) => (
            <div key={index} className="relative group aspect-square">
              <Image
                src={photo}
                alt={`Captured photo ${index + 1}`}
                width={200}
                height={200}
                className="w-full h-full object-cover rounded-xl border-4 border-white shadow-lg"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 rounded-xl transition-opacity p-2">
                <Button onClick={() => downloadPhoto(photo)} className="stumble-btn bg-white/80 text-black border-b-gray-400 text-xs w-full h-auto py-2 hover:bg-white">
                  <Download className="w-4 h-4 mr-1" /> Unduh
                </Button>
                <Button onClick={() => onEditWithAi(photo)} className="stumble-btn btn-purple text-xs w-full h-auto py-2">
                  <Sparkles className="w-4 h-4 mr-1" /> Hapus BG
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
