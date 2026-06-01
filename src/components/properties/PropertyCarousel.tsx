"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PropertyCarouselProps {
  images: string[];
  title: string;
}

export default function PropertyCarousel({ images, title }: PropertyCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images || images.length === 0) {
    return null;
  }

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <>
      {/* Main Carousel */}
      <div className="relative w-full h-64 bg-slate-100 overflow-hidden rounded-t-lg">
        {/* Current Image */}
        <Image
          src={images[currentIndex]}
          alt={`${title} - ${currentIndex + 1}`}
          fill
          className="object-cover cursor-zoom-in"
          onClick={() => setIsFullscreen(true)}
          priority={currentIndex === 0}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}

        {/* Image Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`h-2.5 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/70 w-2.5"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-2 overflow-x-auto">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex
                  ? "border-emerald-500 ring-2 ring-emerald-300"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              aria-label={`Go to image ${index + 1}`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors z-60"
            aria-label="Close fullscreen"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Fullscreen Image */}
          <div className="relative w-full h-full max-w-4xl max-h-[90vh]">
            <Image
              src={images[currentIndex]}
              alt={`${title} - ${currentIndex + 1} - Fullscreen`}
              fill
              className="object-contain"
              priority
            />

            {/* Navigation Arrows - Fullscreen */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Counter - Fullscreen */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails - Fullscreen */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 relative w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? "border-emerald-400 ring-2 ring-emerald-300"
                      : "border-white/30 hover:border-white/50"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
