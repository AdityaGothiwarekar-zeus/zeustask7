import React, { useEffect, useRef, useState } from "react";

class DraggableBoxDiv {
  box: HTMLDivElement;
  container: HTMLDivElement;
  updatePositionCallback: (x: number, y: number) => void;
  offset = { x: 0, y: 0 };
  isDragging = false;

  constructor(
    container: HTMLDivElement,
    updatePositionCallback: (x: number, y: number) => void,
    initialX: number,
    initialY: number,
    boxClassName: string
  ) {
    this.container = container;
    this.updatePositionCallback = updatePositionCallback;

    this.box = document.createElement("div");
    this.box.className = boxClassName;

    this.container.appendChild(this.box);

    this.updatePosition(initialX, initialY);

    this.box.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
  }

  updatePosition = (x: number, y: number) => {
    const containerRect = this.container.getBoundingClientRect();
    const boxRect = this.box.getBoundingClientRect();
    const maxX = containerRect.width - boxRect.width;
    const maxY = containerRect.height - boxRect.height;

    const clampedX = Math.max(0, Math.min(x, maxX));
    const clampedY = Math.max(0, Math.min(y, maxY));

    this.box.style.left = `${clampedX}px`;
    this.box.style.top = `${clampedY}px`;

    this.updatePositionCallback(clampedX, clampedY);
  };

  onPointerDown = (e: PointerEvent) => {
    e.preventDefault();
    this.isDragging = true;

    const rect = this.box.getBoundingClientRect();
    this.offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    this.box.setPointerCapture(e.pointerId);
  };

  onPointerMove = (e: PointerEvent) => {
    if (!this.isDragging) return;
    e.preventDefault();

    const containerRect = this.container.getBoundingClientRect();

    const newX = e.clientX - containerRect.left - this.offset.x;
    const newY = e.clientY - containerRect.top - this.offset.y;

    this.updatePosition(newX, newY);
  };

  onPointerUp = (e: PointerEvent) => {
    if (!this.isDragging) return;
    e.preventDefault();

    this.isDragging = false;
    this.box.releasePointerCapture(e.pointerId);
  };

  remove() {
    this.box.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);

    if (this.container.contains(this.box)) {
      this.container.removeChild(this.box);
    }
  }
}

const DraggableBoxes: React.FC = () => {
  const containerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const draggableBoxesRefs = useRef<DraggableBoxDiv[][]>([]); 

  const [positions, setPositions] = useState<
    { x: number; y: number }[][]
  >(
    Array(4)
      .fill(0)
      .map(() => Array(4).fill({ x: 0, y: 0 }))
  );

 useEffect(() => {
    draggableBoxesRefs.current = [];

    containerRefs.current.forEach((container, quadrantIndex) => {
      if (!container) return;

      draggableBoxesRefs.current[quadrantIndex] = [];

      for (let boxIndex = 0; boxIndex < 4; boxIndex++) {
        const initialX = 20 + boxIndex * 60;
        const initialY = 20 + boxIndex * 60;

        const boxClass =
          boxIndex === 3 ? "draggable-box special-box" : "draggable-box";

        const box = new DraggableBoxDiv(
          container,
          (x, y) => {
            setPositions((prev) => {
              const newPositions = prev.map((arr) => arr.slice());
              newPositions[quadrantIndex][boxIndex] = { x, y };
              return newPositions;
            });
          },
          initialX,
          initialY,
          boxClass
        );

        draggableBoxesRefs.current[quadrantIndex].push(box);
      }
    });


    const onResize = () => {
      draggableBoxesRefs.current.forEach((boxes, qIndex) => {
        boxes.forEach((box) => {
          const rect = box.box.getBoundingClientRect();
          const containerRect = box.container.getBoundingClientRect();
          const relativeX = rect.left - containerRect.left;
          const relativeY = rect.top - containerRect.top;
          box.updatePosition(relativeX, relativeY);
        });
      });
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);

      draggableBoxesRefs.current.forEach((boxes) =>
        boxes.forEach((box) => box.remove())
      );
    };
  }, []);

  return (
    <div className="main-container">
      {[0, 1, 2, 3].map((q) => (
  <div
    key={q}
    className="quadrant"
    ref={(el) => {
      containerRefs.current[q] = el;
    }}
  />
))}

    </div>
  );
};

export default DraggableBoxes;
