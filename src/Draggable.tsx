import React, { useState, useRef, useEffect } from 'react';

const DraggableBox: React.FC = () => {
  const backgroundElement = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ x: 100, y: 100 });

  const offsetRef = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false); 

  const updatePosition = (x: number, y: number) => {
    if (boxRef.current && backgroundElement.current) {
      const bgRect = backgroundElement.current.getBoundingClientRect();
      const maxX = bgRect.width - 50;
      const maxY = bgRect.height - 50;

      const clampedX = Math.max(0, Math.min(x, maxX));
      const clampedY = Math.max(0, Math.min(y, maxY));

      boxRef.current.style.left = `${clampedX}px`;
      boxRef.current.style.top = `${clampedY}px`;
      setPosition({ x: clampedX, y: clampedY });
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    if (boxRef.current) {
      isDragging.current = true; 
      const rect = boxRef.current.getBoundingClientRect();
      offsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      boxRef.current.setPointerCapture(e.pointerId);
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    if (isDragging.current && boxRef.current && backgroundElement.current) {
      const newX = e.clientX - offsetRef.current.x;
      const newY = e.clientY - offsetRef.current.y;
      updatePosition(newX, newY);
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    if (boxRef.current) {
      isDragging.current = false; 
      boxRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const onWindowResize = () => {
    updatePosition(position.x, position.y);
  };

  useEffect(() => {
    const background = document.createElement('div');
    background.style.position = 'fixed';
    background.style.top = '0';
    background.style.left = '0';
    background.style.width = '100vw';
    background.style.height = '100vh';
    background.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    background.style.overflow = 'hidden';

    document.body.appendChild(background);
    backgroundElement.current = background;

    const box = document.createElement('div');
    box.style.position = 'absolute';
    box.style.width = '50px';
    box.style.height = '50px';
    box.style.backgroundColor = 'blue';
    box.style.borderRadius = '5px';
    box.style.touchAction = 'none'; 
    background.appendChild(box);
    boxRef.current = box;

    updatePosition(position.x, position.y);

    box.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('resize', onWindowResize);

    return () => {
      box.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onWindowResize);
      document.body.removeChild(background);
    };
  }, []);

  return null;
};

export default DraggableBox;
