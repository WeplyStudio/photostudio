"use client";

import { useState, type FC, useEffect } from 'react';
import Image from 'next/image';
import { removeBackground } from '@/ai/flows/background-removal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AiModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    imageDataUri: string;
}

const AiModal: FC<AiModalProps> = ({ isOpen, setIsOpen, imageDataUri }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
      if(isOpen) {
        setProcessedImage(null);
      }
    }, [isOpen]);

    const handleRemoveBackground = async () => {
        setIsLoading(true);
        setProcessedImage(null);
        try {
            const result = await removeBackground({ photoDataUri: imageDataUri });
            if (result.processedPhotoDataUri) {
                setProcessedImage(result.processedPhotoDataUri);
            } else {
                throw new Error("AI did not return an image.");
            }
        } catch (error) {
            console.error("AI background removal failed:", error);
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Gagal menghapus background. Coba lagi.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const downloadProcessedImage = () => {
        if (!processedImage) return;
        const a = document.createElement('a');
        a.href = processedImage;
        a.download = `stumble-studio-edited-${Date.now()}.png`;
        document.body.appendChild(a);
a.click();
        document.body.removeChild(a);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-4xl bg-[#0d1127] border-4 border-black chunky-card text-white p-6">
                <DialogHeader>
                    <DialogTitle className="stumble-font text-accent text-3xl">AI Background Remover</DialogTitle>
                    <DialogDescription className="text-primary/70">
                        Gunakan AI untuk menghapus background foto Anda.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                    <div>
                        <h4 className="font-bold text-center mb-2">Original</h4>
                        <Image src={imageDataUri} alt="Original" width={400} height={400} className="rounded-lg border-2 border-white/20 w-full h-auto" />
                    </div>
                    <div>
                        <h4 className="font-bold text-center mb-2">Hasil</h4>
                        <div className="aspect-square w-full bg-black/20 rounded-lg border-2 border-white/20 flex items-center justify-center checkerboard">
                           {isLoading && <Skeleton className="w-full h-full bg-slate-700" />}
                           {!isLoading && processedImage && (
                                <Image src={processedImage} alt="Processed" width={400} height={400} className="w-full h-auto" />
                           )}
                           {!isLoading && !processedImage && <p className="text-sm text-gray-400">Hasil akan muncul di sini</p>}
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-between gap-2 flex-col sm:flex-row">
                    {processedImage && (
                        <Button onClick={downloadProcessedImage} className="stumble-btn btn-green h-auto py-3">
                           <Download className="w-4 h-4 mr-2" /> Download Hasil
                        </Button>
                    )}
                    <Button onClick={handleRemoveBackground} disabled={isLoading} className="stumble-btn btn-purple h-auto py-3 mt-2 sm:mt-0">
                        <Wand2 className="w-4 h-4 mr-2" />
                        {isLoading ? 'Memproses...' : 'Hapus Background'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AiModal;
