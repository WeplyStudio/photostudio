"use client";

import { useRef, useCallback, type FC, type ReactNode, type RefObject, useEffect } from 'react';

interface DraggableProps {
    children: ReactNode;
    x: number;
    y: number;
    onDrag: (x: number, y: number) => void;
    parentRef: RefObject<HTMLElement>;
}

const Draggable: FC<DraggableProps> = ({ children, x, y, onDrag, parentRef }) => {
    const elRef = useRef<HTMLDivElement>(null);
    const dragInfo = useRef({ isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0 });

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!elRef.current) return;
        e.preventDefault();
        dragInfo.current = {
            isDragging: true,
            startX: e.clientX,
            startY: e.clientY,
            initialX: x,
            initialY: y
        };
        elRef.current.style.cursor = 'grabbing';
    }, [x, y]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragInfo.current.isDragging || !parentRef.current || !elRef.current) return;
        e.preventDefault();

        const deltaX = e.clientX - dragInfo.current.startX;
        const deltaY = e.clientY - dragInfo.current.startY;

        const parentRect = parentRef.current.getBoundingClientRect();
        const elRect = elRef.current.getBoundingClientRect();
        
        let newX = dragInfo.current.initialX + deltaX;
        let newY = dragInfo.current.initialY + deltaY;

        newX = Math.max(0, Math.min(newX, parentRect.width - elRect.width));
        newY = Math.max(0, Math.min(newY, parentRect.height - elRect.height));

        onDrag(newX, newY);
    }, [onDrag, parentRef]);
    
    const handleMouseUp = useCallback(() => {
        if(dragInfo.current.isDragging) {
            dragInfo.current.isDragging = false;
            if (elRef.current) {
                elRef.current.style.cursor = 'grab';
            }
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);


    return (
        <div
            ref={elRef}
            onMouseDown={handleMouseDown}
            style={{ 
                position: 'absolute',
                left: `${x}px`,
                top: `${y}px`,
                cursor: 'grab'
            }}
        >
            {children}
        </div>
    );
};

export default Draggable;
