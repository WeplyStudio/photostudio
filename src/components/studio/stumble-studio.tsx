"use client";

import { useState, useRef, useCallback } from 'react';
import type { FC } from 'react';
import EditorControls from './editor-controls';
import Preview from './preview';
import Gallery from './gallery';
import AiModal from './ai-modal';

export interface AdjustmentSettings {
  brightness: number;
  saturate: number;
  sepia: number;
  blur: number;
}

export interface Sticker {
  id: number;
  content: string;
  isText: boolean;
  color?: string;
  x: number;
  y: number;
}

const StumbleStudio: FC = () => {
  const [isMirrored, setIsMirrored] = useState(false);
  const [currentFrame, setCurrentFrame] = useState('none');
  const [currentFilter, setCurrentFilter] = useState('normal');
  const [adjustments, setAdjustments] = useState<AdjustmentSettings>({
    brightness: 100,
    saturate: 100,
    sepia: 0,
    blur: 0,
  });
  const [activeStickers, setActiveStickers] = useState<Sticker[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedImageForAi, setSelectedImageForAi] = useState<string>("");

  const stickerLayerRef = useRef<HTMLDivElement>(null);

  const addPhoto = (dataUrl: string) => {
    setPhotos(prev => [dataUrl, ...prev]);
  };
  
  const handleOpenAiModal = (dataUrl: string) => {
    setSelectedImageForAi(dataUrl);
    setAiModalOpen(true);
  };

  const addSticker = useCallback((content: string, isText = false, color = 'white') => {
    if (!stickerLayerRef.current) return;
    
    const stickerId = Date.now();
    const parentRect = stickerLayerRef.current.getBoundingClientRect();

    const newSticker: Sticker = {
      id: stickerId,
      content,
      isText,
      color,
      x: parentRect.width * 0.4,
      y: parentRect.height * 0.4,
    };
    setActiveStickers(prev => [...prev, newSticker]);
  }, []);

  const updateStickerPosition = (id: number, x: number, y: number) => {
    setActiveStickers(stickers =>
      stickers.map(s => (s.id === id ? { ...s, x, y } : s))
    );
  };

  const clearStickers = () => {
    setActiveStickers([]);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4 -rotate-1">
          <EditorControls
            setFrame={setCurrentFrame}
            setFilter={setCurrentFilter}
            adjustments={adjustments}
            setAdjustments={setAdjustments}
            addSticker={addSticker}
            clearStickers={clearStickers}
          />
        </div>

        <div className="lg:col-span-8 space-y-6">
          <Preview
            isMirrored={isMirrored}
            toggleMirror={() => setIsMirrored(prev => !prev)}
            currentFrame={currentFrame}
            currentFilter={currentFilter}
            adjustments={adjustments}
            addPhoto={addPhoto}
            activeStickers={activeStickers}
            updateStickerPosition={updateStickerPosition}
            stickerLayerRef={stickerLayerRef}
          />
          <Gallery photos={photos} onEditWithAi={handleOpenAiModal} />
        </div>
      </div>
      {selectedImageForAi && (
        <AiModal 
          isOpen={aiModalOpen}
          setIsOpen={setAiModalOpen}
          imageDataUri={selectedImageForAi}
        />
      )}
    </>
  );
};

export default StumbleStudio;
