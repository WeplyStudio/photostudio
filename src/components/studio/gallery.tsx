"use client";

import type { FC } from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Download, Sparkles, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendToTelegram } from '@/ai/flows/telegram-sender';

interface GalleryProps {
  photos: string[];
  onEditWithAi: (dataUrl: string) => void;
}

const Gallery: FC<GalleryProps> = ({ photos, onEditWithAi }) => {
  const [isSending, setIsSending] = useState<string | null>(null);
  const { toast } = useToast();

  const downloadPhoto = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `stumble-studio-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const handleSendToTelegram = async (photoUrl: string) => {
    setIsSending(photoUrl);
    try {
      const result = await sendToTelegram({
        photoDataUri: photoUrl,
        caption: 'Gambar dari Stumble Studio PRO!',
      });

      if (result.success) {
        toast({
          title: 'Terkirim!',
          description: 'Foto berhasil dikirim ke Telegram.',
          className: "bg-green-500 border-4 border-black text-white stumble-font text-lg"
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Telegram sending failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Gagal mengirim ke Telegram. Coba lagi.";
       toast({
         variant: 'destructive',
         title: 'Error',
         description: errorMessage.includes("TELEGRAM_BOT_TOKEN") ? "Harap atur Bot Token & Chat ID Telegram di file .env Anda." : errorMessage,
       });
    } finally {
      setIsSending(null);
    }
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 min-h-[100px]">
          {photos.map((photo, index) => (
            <div key={index} className="relative group aspect-square">
              <Image
                src={photo}
                alt={`Captured photo ${index + 1}`}
                width={200}
                height={200}
                className="w-full h-full object-cover rounded-xl border-4 border-white shadow-lg"
              />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 rounded-xl transition-opacity p-2">
                <Button onClick={() => downloadPhoto(photo)} className="stumble-btn bg-white/80 text-black border-b-gray-400 text-xs w-full h-auto py-1 hover:bg-white">
                  <Download className="w-3 h-3 mr-1" /> Unduh
                </Button>
                <Button onClick={() => onEditWithAi(photo)} className="stumble-btn btn-purple text-xs w-full h-auto py-1">
                  <Sparkles className="w-3 h-3 mr-1" /> Hapus BG
                </Button>
                <Button onClick={() => handleSendToTelegram(photo)} className="stumble-btn btn-blue text-xs w-full h-auto py-1" disabled={isSending === photo}>
                  {isSending === photo ? 'Mengirim...' : <><Send className="w-3 h-3 mr-1" /> Telegram</>}
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
