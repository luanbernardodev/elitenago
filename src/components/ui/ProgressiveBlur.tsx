import React from 'react';

export interface ProgressiveBlurProps {
  position?: 'top' | 'bottom' | 'left' | 'right';
  height?: string;
  className?: string;
  layers?: number;
}

export const ProgressiveBlur: React.FC<ProgressiveBlurProps> = ({
  position = 'bottom',
  height = '40%',
  className = '',
  layers = 8
}) => {
  const isVertical = position === 'top' || position === 'bottom';

  return (
    <div
      className={`pointer-events-none absolute z-20 ${
        position === 'bottom'
          ? 'bottom-0 left-0 right-0'
          : position === 'top'
          ? 'top-0 left-0 right-0'
          : position === 'left'
          ? 'top-0 bottom-0 left-0'
          : 'top-0 bottom-0 right-0'
      } ${className}`.trim()}
      style={{
        [isVertical ? 'height' : 'width']: height
      }}
    >
      {Array.from({ length: layers }).map((_, index) => {
        const step = (index + 1) / layers;
        const blurAmount = Math.pow(step, 2) * 16;
        const opacity = Math.sin((step * Math.PI) / 2);

        const direction =
          position === 'bottom'
            ? 'to bottom'
            : position === 'top'
            ? 'to top'
            : position === 'left'
            ? 'to left'
            : 'to right';

        return (
          <div
            key={index}
            className="absolute inset-0 pointer-events-none"
            style={{
              backdropFilter: `blur(${blurAmount.toFixed(1)}px)`,
              WebkitBackdropFilter: `blur(${blurAmount.toFixed(1)}px)`,
              maskImage: `linear-gradient(${direction}, transparent ${((index / layers) * 100).toFixed(0)}%, black ${(((index + 1) / layers) * 100).toFixed(0)}%)`,
              WebkitMaskImage: `linear-gradient(${direction}, transparent ${((index / layers) * 100).toFixed(0)}%, black ${(((index + 1) / layers) * 100).toFixed(0)}%)`,
              opacity: opacity
            }}
          />
        );
      })}
    </div>
  );
};

export default ProgressiveBlur;
