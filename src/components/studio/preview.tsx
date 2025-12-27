"use client";

import { useEffect, useRef, useState, useCallback, type FC, type RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera as CameraIcon, Timer, RefreshCw } from 'lucide-react';
import type { AdjustmentSettings, Sticker } from './stumble-studio';
import Draggable from './draggable';

interface PreviewProps {
  isMirrored: boolean;
  toggleMirror: () => void;
  currentFrame: string;
  currentFilter: string;
  adjustments: AdjustmentSettings;
  addPhoto: (dataUrl: string) => void;
  activeStickers: Sticker[];
  updateStickerPosition: (id: number, x: number, y: number) => void;
  stickerLayerRef: RefObject<HTMLDivElement>;
}

const Preview: FC<PreviewProps> = ({
  isMirrored,
  toggleMirror,
  currentFrame,
  currentFilter,
  adjustments,
  addPhoto,
  activeStickers,
  updateStickerPosition,
  stickerLayerRef,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function initCamera() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Camera access denied:", err);
          setCameraError("Kamera Diblokir! Izinkan akses kamera di pengaturan browser Anda.");
        }
      } else {
        setCameraError("Browser tidak mendukung akses kamera.");
      }
    }
    initCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getFilterString = useCallback(() => {
    let f = `brightness(${adjustments.brightness}%) saturate(${adjustments.saturate}%) sepia(${adjustments.sepia}%) blur(${adjustments.blur}px) `;
    if (currentFilter === 'lava') f += 'hue-rotate(-30deg) saturate(3) contrast(1.2)';
    if (currentFilter === 'ice') f += 'hue-rotate(180deg) brightness(1.2)';
    if (currentFilter === 'honey') f += 'sepia(0.5) saturate(2)';
    if (currentFilter === 'retro') f += 'contrast(1.5) grayscale(0.2)';
    return f;
  }, [adjustments, currentFilter]);
  
  const drawOverlaysOnCanvas = useCallback((ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    const scale = canvasWidth / 800; // Assuming design was for an 800px wide container
    ctx.save();
    
    // Frame
    if (currentFrame === 'wanted') {
      ctx.strokeStyle = '#d4b483';
      ctx.lineWidth = 40 * scale;
      ctx.strokeRect(0 + (ctx.lineWidth/2), 0+ (ctx.lineWidth/2), canvasWidth - ctx.lineWidth, canvasHeight - (80 * scale) - ctx.lineWidth/2);
      ctx.fillStyle = 'black';
      ctx.font = `bold ${50 * scale}px "Fredoka One"`;
      ctx.textAlign = 'center';
      ctx.fillText('WANTED', canvasWidth / 2, canvasHeight - (35 * scale));
    } else if (currentFrame === 'crown') {
        ctx.font = `${60 * scale}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('👑', canvasWidth/2, 80 * scale);
    }
    
    // Stickers
    activeStickers.forEach(sticker => {
      const el = document.getElementById(`sticker-${sticker.id}`);
      if (!stickerLayerRef.current || !el) return;

      const parentRect = stickerLayerRef.current.getBoundingClientRect();
      const x = (sticker.x / parentRect.width) * canvasWidth;
      const y = (sticker.y / parentRect.height) * canvasHeight;
      const elHeight = (el.offsetHeight / parentRect.height) * canvasHeight;

      if (sticker.isText) {
          const fontSize = 32 * scale;
          ctx.font = `bold ${fontSize}px "Fredoka One"`;
          ctx.fillStyle = sticker.color === 'yellow' ? '#ffcc00' : 'white';
          ctx.strokeStyle = '#1a1a1a';
          ctx.lineWidth = 4 * scale;
          ctx.strokeText(sticker.content, x, y + elHeight*0.8);
          ctx.fillText(sticker.content, x, y + elHeight*0.8);
      } else { // Emoji
          const fontSize = 60 * scale;
          ctx.font = `${fontSize}px sans-serif`;
          ctx.fillText(sticker.content, x, y + elHeight * 0.8);
      }
    });

    ctx.restore();
  }, [currentFrame, activeStickers, stickerLayerRef]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.filter = getFilterString();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    drawOverlaysOnCanvas(ctx, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/png');
    addPhoto(dataUrl);
    toast({
        title: "MANTAP! FOTO DISIMPAN",
        className: "bg-green-500 border-4 border-black text-white stumble-font text-lg"
    });
  }, [isMirrored, getFilterString, addPhoto, toast, drawOverlaysOnCanvas]);

  const startTimer = () => {
    let count = 3;
    setTimer(count);
    const interval = setInterval(() => {
      count--;
      if (count > 0) setTimer(count);
      else {
        clearInterval(interval);
        setTimer(null);
        capture();
      }
    }, 1000);
  };

  const FrameOverlay = () => {
    switch(currentFrame) {
      case 'wanted': return <div className="absolute bottom-[-80px] stumble-font text-5xl text-black">WANTED</div>;
      case 'crown': return <><div className="absolute top-4 animate-bounce text-6xl">👑</div><div className="absolute inset-0 border-[12px] border-yellow-400/40 rounded-[14px]"></div></>;
      case 'qualified': return <div className="absolute top-10 right-10 bg-green-500 border-4 border-black p-4 stumble-font text-3xl rotate-12">QUALIFIED!</div>;
      case 'podium': return <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-purple-900/80 to-transparent flex items-end justify-center pb-4"><div className="stumble-font text-4xl text-yellow-300">#1 MVP</div></div>;
      default: return null;
    }
  };
  
  const frameClasses: Record<string, string> = {
    wanted: 'border-[40px] border-solid border-[#d4b483] border-b-[80px]',
    polaroid: 'border-[20px] border-solid border-white border-b-[60px]',
  };

  return (
    <div className="chunky-card p-4 bg-blue-900/40 relative">
      <div className="mx-auto relative shadow-2xl aspect-[4/3] bg-black rounded-[20px] overflow-hidden border-4 border-white">
        {cameraError && <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80"><p className="bg-red-600 p-4 rounded-xl font-bold">{cameraError}</p></div>}
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: isMirrored ? 'scaleX(-1)' : 'none', filter: getFilterString() }}/>
        <canvas ref={canvasRef} className="hidden" />

        <div ref={stickerLayerRef} className="absolute inset-0 z-30">
            {activeStickers.map(sticker => (
                <Draggable key={sticker.id} x={sticker.x} y={sticker.y} onDrag={(x, y) => updateStickerPosition(sticker.id, x, y)} parentRef={stickerLayerRef}>
                    <div id={`sticker-${sticker.id}`} className={`pointer-events-auto select-none ${sticker.isText ? 'stumble-font text-3xl px-2 py-1 text-center text-stroke' : 'text-5xl'}`} style={{color: sticker.isText ? (sticker.color === 'yellow' ? '#ffcc00' : 'white') : 'inherit'}}>
                        {sticker.content}
                    </div>
                </Draggable>
            ))}
        </div>
        
        <div className={`absolute inset-0 z-20 transition-all duration-300 flex items-center justify-center pointer-events-none ${frameClasses[currentFrame] || ''}`}>
          <FrameOverlay />
        </div>
        
        {timer !== null && <div className="absolute inset-0 flex items-center justify-center text-9xl stumble-font z-50 text-white">{timer}</div>}
      </div>

      <div className="flex flex-wrap justify-center items-center gap-4 mt-6">
        <Button onClick={capture} className="stumble-btn btn-yellow text-2xl py-4 px-12 rounded-full h-auto">
          <CameraIcon className="w-8 h-8 mr-3" />
          Cekrek!
        </Button>
        <Button onClick={startTimer} className="stumble-btn btn-blue py-3 px-6 rounded-3xl h-auto text-base">
          <Timer className="w-5 h-5 mr-2" />
          Timer
        </Button>
        <Button onClick={toggleMirror} className="stumble-btn bg-black/40 text-white border-b-black py-3 px-6 rounded-3xl h-auto text-base hover:bg-black/60">
          <RefreshCw className="w-5 h-5 mr-2" />
          Mirror
        </Button>
      </div>
    </div>
  );
};

export default Preview;
