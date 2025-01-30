import React, { useState } from "react";
import { IEvent } from "@/lib/models/Event";
import { MdOutlineArrowBackIos } from "react-icons/md";
import { MdOutlineArrowForwardIos } from "react-icons/md";

interface CarouselProps<T> {
  items: T[];
  ItemComponent: React.ComponentType<{ event: T; onClick: () => void }>;
  onItemClick: (event: T) => void;
}

const Carousel = <T extends IEvent>({ items, ItemComponent, onItemClick }: CarouselProps<T>) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? items.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === items.length - 1 ? 0 : prevIndex + 1));
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  if (!items.length) return null;

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full">
        <ItemComponent event={items[currentIndex]} onClick={() => onItemClick(items[currentIndex])} />

        <div className="absolute top-4 left-4 flex gap-2 z-10">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-white w-4" : "bg-white/60 hover:bg-white/80 drop-shadow-lg"
              }`}
              aria-label={`Go to item ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <button
        onClick={handlePrevious}
        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 
                 flex items-center justify-center bg-white/80 hover:bg-white 
                 rounded-full shadow-lg transition-all"
        aria-label="Previous item"
      >
        <MdOutlineArrowBackIos size={20} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-10 h-10 
                 flex items-center justify-center bg-white/80 hover:bg-white 
                 rounded-full shadow-lg transition-all"
        aria-label="Next item"
      >
        <MdOutlineArrowForwardIos size={20} />
      </button>
    </div>
  );
};

export default Carousel;
