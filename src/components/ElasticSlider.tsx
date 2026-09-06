import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion';

const MAX_OVERFLOW = 18;

export interface ElasticSliderProps {
  defaultValue?: number;
  startingValue?: number;
  maxValue?: number;
  value?: number;
  onChange?: (value: number) => void;
  className?: string;
  isStepped?: boolean;
  stepSize?: number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showVolumeText?: boolean;
}

export const ElasticSlider: React.FC<ElasticSliderProps> = ({
  defaultValue = 70,
  startingValue = 0,
  maxValue = 100,
  value,
  onChange,
  className = '',
  isStepped = false,
  stepSize = 1,
  leftIcon,
  rightIcon,
  showVolumeText = true,
}) => {
  return (
    <div className={`relative flex flex-col items-center justify-center w-full max-w-[200px] sm:max-w-[240px] mx-auto overflow-visible ${className}`}>
      <Slider
        defaultValue={defaultValue}
        startingValue={startingValue}
        maxValue={maxValue}
        controlledValue={value}
        onChange={onChange}
        isStepped={isStepped}
        stepSize={stepSize}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        showVolumeText={showVolumeText}
      />
    </div>
  );
};

interface SliderProps {
  defaultValue: number;
  startingValue: number;
  maxValue: number;
  controlledValue?: number;
  onChange?: (value: number) => void;
  isStepped: boolean;
  stepSize: number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showVolumeText?: boolean;
}

const Slider: React.FC<SliderProps> = ({
  defaultValue,
  startingValue,
  maxValue,
  controlledValue,
  onChange,
  isStepped,
  stepSize,
  leftIcon,
  rightIcon,
  showVolumeText = true,
}) => {
  const [internalValue, setInternalValue] = useState<number>(
    controlledValue !== undefined ? controlledValue : defaultValue
  );

  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;

  const sliderRef = useRef<HTMLDivElement>(null);
  const [region, setRegion] = useState<'left' | 'middle' | 'right'>('middle');
  const clientX = useMotionValue(0);
  const overflow = useMotionValue(0);
  const scale = useMotionValue(1);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  useMotionValueEvent(clientX, 'change', (latest: number) => {
    if (sliderRef.current) {
      const { left, right } = sliderRef.current.getBoundingClientRect();
      let newValue: number;
      if (latest < left) {
        setRegion('left');
        newValue = left - latest;
      } else if (latest > right) {
        setRegion('right');
        newValue = latest - right;
      } else {
        setRegion('middle');
        newValue = 0;
      }
      overflow.jump(decay(newValue, MAX_OVERFLOW));
    }
  });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons > 0 && sliderRef.current) {
      const { left, width } = sliderRef.current.getBoundingClientRect();
      let newValue = startingValue + ((e.clientX - left) / width) * (maxValue - startingValue);
      if (isStepped) {
        newValue = Math.round(newValue / stepSize) * stepSize;
      }
      newValue = Math.min(Math.max(newValue, startingValue), maxValue);
      setInternalValue(newValue);
      onChange?.(newValue);
      clientX.jump(e.clientX);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    handlePointerMove(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = () => {
    animate(overflow, 0, { type: 'spring', bounce: 0.4 });
  };

  const getRangePercentage = (): number => {
    const totalRange = maxValue - startingValue;
    if (totalRange === 0) return 0;
    return ((currentValue - startingValue) / totalRange) * 100;
  };

  return (
    <div className="relative flex flex-col items-center w-full">
      <motion.div
        onHoverStart={() => animate(scale, 1.05)}
        onHoverEnd={() => animate(scale, 1)}
        onTouchStart={() => animate(scale, 1.05)}
        onTouchEnd={() => animate(scale, 1)}
        style={{
          scale,
          opacity: useTransform(scale, [1, 1.05], [0.9, 1]),
        }}
        className="flex w-full touch-none select-none items-center justify-between gap-2"
      >
        {leftIcon && (
          <motion.div
            animate={{
              scale: region === 'left' ? [1, 1.25, 1] : 1,
              transition: { duration: 0.2 },
            }}
            style={{
              x: useTransform(() => (region === 'left' ? -overflow.get() / scale.get() : 0)),
            }}
            className="shrink-0 flex items-center justify-center cursor-pointer text-[#EEDC9A] p-1"
            onClick={() => {
              const newVal = Math.max(startingValue, currentValue - 10);
              setInternalValue(newVal);
              onChange?.(newVal);
            }}
          >
            {leftIcon}
          </motion.div>
        )}

        <div
          ref={sliderRef}
          className="relative flex w-full flex-grow cursor-grab active:cursor-grabbing touch-none select-none items-center py-1.5"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onLostPointerCapture={handlePointerUp}
        >
          <motion.div
            style={{
              scaleX: useTransform(() => {
                if (sliderRef.current) {
                  const { width } = sliderRef.current.getBoundingClientRect();
                  return 1 + overflow.get() / width;
                }
                return 1;
              }),
              scaleY: useTransform(overflow, [0, MAX_OVERFLOW], [1, 0.85]),
              transformOrigin: useTransform(() => {
                if (sliderRef.current) {
                  const { left, width } = sliderRef.current.getBoundingClientRect();
                  return clientX.get() < left + width / 2 ? 'right' : 'left';
                }
                return 'center';
              }),
              height: useTransform(scale, [1, 1.05], [4, 6]),
            }}
            className="flex flex-grow items-center"
          >
            {/* Track Background */}
            <div className="relative h-full flex-grow overflow-hidden rounded-full bg-neutral-800 border border-white/10">
              {/* Active Soft Champagne Progress Fill */}
              <div
                className="absolute h-full rounded-full bg-gradient-to-r from-[#F6E7B8] via-[#EED89F] to-[#E3C887] shadow-[0_0_10px_rgba(238,220,154,0.4)] transition-[width] duration-75"
                style={{ width: `${getRangePercentage()}%` }}
              />
            </div>
          </motion.div>
        </div>

        {rightIcon && (
          <motion.div
            animate={{
              scale: region === 'right' ? [1, 1.25, 1] : 1,
              transition: { duration: 0.2 },
            }}
            style={{
              x: useTransform(() => (region === 'right' ? overflow.get() / scale.get() : 0)),
            }}
            className="shrink-0 flex items-center justify-center cursor-pointer text-[#EEDC9A] p-1"
            onClick={() => {
              const newVal = Math.min(maxValue, currentValue + 10);
              setInternalValue(newVal);
              onChange?.(newVal);
            }}
          >
            {rightIcon}
          </motion.div>
        )}
      </motion.div>

      {/* Numerical Volume Indicator */}
      {showVolumeText && (
        <span className="text-[10px] font-mono text-[#EEDC9A]/90 font-semibold tracking-wider mt-0.5 select-none">
          Vol: {Math.round(currentValue)}%
        </span>
      )}
    </div>
  );
};

function decay(value: number, max: number): number {
  if (max === 0) {
    return 0;
  }
  const entry = value / max;
  const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);
  return sigmoid * max;
}

export default ElasticSlider;
