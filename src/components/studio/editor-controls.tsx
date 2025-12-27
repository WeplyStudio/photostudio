"use client";

import type { FC, Dispatch, SetStateAction } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { AdjustmentSettings } from './stumble-studio';

interface EditorControlsProps {
    setFrame: (frame: string) => void;
    setFilter: (filter: string) => void;
    adjustments: AdjustmentSettings;
    setAdjustments: Dispatch<SetStateAction<AdjustmentSettings>>;
    addSticker: (content: string, isText?: boolean, color?: string) => void;
    clearStickers: () => void;
}

const EditorControls: FC<EditorControlsProps> = ({
    setFrame,
    setFilter,
    adjustments,
    setAdjustments,
    addSticker,
    clearStickers
}) => {
    const handleAdjustmentChange = (type: keyof AdjustmentSettings, value: number) => {
        setAdjustments(prev => ({ ...prev, [type]: value }));
    };

    const addTextSticker = (color: string) => {
        const input = document.getElementById('custom-text-input') as HTMLInputElement;
        if (input && input.value) {
            addSticker(input.value.trim(), true, color);
            input.value = '';
        }
    };

    const frames = [
        { id: 'none', name: 'Polos', colorClass: 'btn-blue' },
        { id: 'wanted', name: 'Wanted Poster', colorClass: 'btn-orange' },
        { id: 'polaroid', name: 'Polaroid', colorClass: 'bg-white text-black border-b-gray-400 hover:bg-white/90' },
        { id: 'crown', name: 'Crown Winner', colorClass: 'btn-yellow' },
        { id: 'qualified', name: 'Qualified', colorClass: 'btn-green' },
        { id: 'podium', name: 'MVP Podium', colorClass: 'btn-purple' },
    ];

    const filters = [
      { id: 'normal', name: 'Normal', colorClass: 'bg-gray-500 text-white border-b-gray-700 hover:bg-gray-500/90' },
      { id: 'lava', name: 'Lava', colorClass: 'btn-orange' },
      { id: 'ice', name: 'Ice', colorClass: 'btn-blue' },
      { id: 'honey', name: 'Honey', colorClass: 'btn-yellow' },
      { id: 'retro', name: '8-Bit Retro', colorClass: 'btn-pink' },
    ];

    const emotes = ['❤️', '🥊', '🍌', '🔥', '👑', '🏆', '🏃', '⚡'];

    return (
        <Tabs defaultValue="frames" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-transparent p-0 gap-2">
                <TabsTrigger value="frames" className="stumble-btn btn-blue data-[state=active]:translate-y-1 data-[state=active]:border-b-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground !rounded-xl !text-xs !py-2 h-auto">Frames</TabsTrigger>
                <TabsTrigger value="filters" className="stumble-btn btn-blue data-[state=active]:translate-y-1 data-[state=active]:border-b-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground !rounded-xl !text-xs !py-2 h-auto">Filters</TabsTrigger>
                <TabsTrigger value="stickers" className="stumble-btn btn-blue data-[state=active]:translate-y-1 data-[state=active]:border-b-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground !rounded-xl !text-xs !py-2 h-auto">Emotes</TabsTrigger>
                <TabsTrigger value="text" className="stumble-btn btn-blue data-[state=active]:translate-y-1 data-[state=active]:border-b-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground !rounded-xl !text-xs !py-2 h-auto">Teks</TabsTrigger>
            </TabsList>

            <TabsContent value="frames" className="chunky-card p-5 mt-4 space-y-4">
                <h3 className="stumble-font text-lg text-accent">TEMPLATE FRAME</h3>
                <div className="grid grid-cols-2 gap-2">
                    {frames.map(frame => (
                        <Button key={frame.id} onClick={() => setFrame(frame.id)} className={`stumble-btn ${frame.colorClass} py-2 rounded-xl text-[10px] h-auto`}>{frame.name}</Button>
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="filters" className="chunky-card p-5 mt-4 space-y-4">
                <h3 className="stumble-font text-lg text-primary">MAP FILTERS</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                    {filters.map(filter => (
                         <Button key={filter.id} onClick={() => setFilter(filter.id)} className={`stumble-btn py-1 px-3 rounded-full text-[10px] h-auto ${filter.colorClass}`}>{filter.name}</Button>
                    ))}
                </div>
                <h3 className="stumble-font text-sm">PENGATURAN</h3>
                <div className="space-y-3">
                    <div className="text-xs uppercase space-y-2 font-bold">
                        <Label>Kecerahan</Label>
                        <Slider value={[adjustments.brightness]} min={50} max={150} step={1} onValueChange={([v]) => handleAdjustmentChange('brightness', v)} />
                    </div>
                    <div className="text-xs uppercase space-y-2 font-bold">
                        <Label>Saturasi</Label>
                        <Slider value={[adjustments.saturate]} min={0} max={200} step={1} onValueChange={([v]) => handleAdjustmentChange('saturate', v)} />
                    </div>
                    <div className="text-xs uppercase space-y-2 font-bold">
                        <Label>Sepia</Label>
                        <Slider value={[adjustments.sepia]} min={0} max={100} step={1} onValueChange={([v]) => handleAdjustmentChange('sepia', v)} />
                    </div>
                    <div className="text-xs uppercase space-y-2 font-bold">
                        <Label>Blur</Label>
                        <Slider value={[adjustments.blur]} min={0} max={10} step={0.1} onValueChange={([v]) => handleAdjustmentChange('blur', v)} />
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="stickers" className="chunky-card p-5 mt-4">
                <h3 className="stumble-font text-lg text-pink-500 mb-3">EMOTES & SKINS</h3>
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {emotes.map(emote => (
                        <button key={emote} onClick={() => addSticker(emote)} className="text-3xl p-2 bg-white/5 rounded-lg transition-transform hover:scale-110 aspect-square flex items-center justify-center">
                            {emote}
                        </button>
                    ))}
                </div>
                <Button onClick={clearStickers} className="w-full py-1 text-[10px] font-bold bg-red-600 rounded-lg h-auto hover:bg-red-700">BERSIHKAN SEMUA</Button>
            </TabsContent>
            
            <TabsContent value="text" className="chunky-card p-5 mt-4 space-y-4">
                <h3 className="stumble-font text-lg text-green-400">TEKS KUSTOM</h3>
                <Input type="text" id="custom-text-input" placeholder="Ketik pesan..." className="w-full bg-black/40 border-2 border-white/20 rounded-xl p-2 text-white outline-none h-10" />
                <div className="flex gap-2">
                    <Button onClick={() => addTextSticker('yellow')} className="flex-1 stumble-btn btn-yellow py-2 text-[10px] h-auto">Kuning</Button>
                    <Button onClick={() => addTextSticker('white')} className="flex-1 stumble-btn bg-white text-black border-b-gray-400 py-2 text-[10px] h-auto hover:bg-gray-200">Putih</Button>
                </div>
                <p className="text-[10px] opacity-60">Klik teks di layar untuk memindahkannya.</p>
            </TabsContent>
        </Tabs>
    );
};

export default EditorControls;
