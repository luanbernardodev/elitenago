import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef
} from 'react';
import gsap from 'gsap';

export interface CardSwapProps {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  onCardClick?: (idx: number) => void;
  onActiveIndexChange?: (idx: number) => void;
  activeIndex?: number;
  skewAmount?: number;
  easing?: 'linear' | 'elastic';
  className?: string;
  children: ReactNode;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  customClass?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ customClass, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    className={`absolute top-1/2 left-1/2 rounded-2xl border border-white/20 bg-neutral-950 overflow-hidden shadow-2xl [transform-style:preserve-3d] [will-change:transform] [backface-visibility:hidden] cursor-pointer pointer-events-auto ${customClass ?? ''} ${rest.className ?? ''}`.trim()}
  />
));
Card.displayName = 'Card';

type CardRef = RefObject<HTMLDivElement | null>;
interface Slot {
  x: number;
  y: number;
  scale: number;
  zIndex: number;
}

const makeSlot = (i: number, distX: number, distY: number, total: number): Slot => ({
  x: i * distX,
  y: -i * distY,
  scale: 1 - i * 0.04,
  zIndex: (total - i) * 10
});

const placeNow = (el: HTMLElement, slot: Slot, skew: number) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    scale: slot.scale,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true
  });

export const CardSwap: React.FC<CardSwapProps> = ({
  width = 310,
  height = 420,
  cardDistance = 38,
  verticalDistance = 44,
  delay = 4500,
  pauseOnHover = true,
  onCardClick,
  onActiveIndexChange,
  activeIndex,
  skewAmount = 3,
  className = '',
  children
}) => {
  const childArr = useMemo(() => Children.toArray(children) as ReactElement<CardProps>[], [children]);
  const refs = useMemo<CardRef[]>(() => childArr.map(() => React.createRef<HTMLDivElement>()), [childArr.length]);
  const order = useRef<number[]>(Array.from({ length: childArr.length }, (_, i) => i));
  const intervalRef = useRef<number>(0);
  const container = useRef<HTMLDivElement>(null);

  const total = childArr.length;

  const animateToOrder = (newOrder: number[], isFast: boolean = false) => {
    const dur = isFast ? 0.6 : 0.8;
    const ease = 'power3.out';

    newOrder.forEach((cardIdx, slotIndex) => {
      const el = refs[cardIdx]?.current;
      if (!el) return;
      const slot = makeSlot(slotIndex, cardDistance, verticalDistance, total);

      // Card moving to front gets top zIndex immediately so it glides smoothly on top
      if (slotIndex === 0) {
        gsap.set(el, { zIndex: total * 10 + 20 });
      }

      gsap.to(el, {
        x: slot.x,
        y: slot.y,
        scale: slot.scale,
        xPercent: -50,
        yPercent: -50,
        skewY: skewAmount,
        duration: dur,
        ease: ease,
        onComplete: () => {
          gsap.set(el, { zIndex: slot.zIndex });
        }
      });
    });

    order.current = newOrder;
    onActiveIndexChange?.(newOrder[0]);
  };

  const swapToNext = () => {
    if (total < 2) return;
    const [front, ...rest] = order.current;
    const nextOrder = [...rest, front];
    animateToOrder(nextOrder);
  };

  const bringToFront = (clickedIdx: number) => {
    const currentOrder = order.current;
    const posInOrder = currentOrder.indexOf(clickedIdx);
    if (posInOrder === -1) return;

    // Reset auto-swap timer on user click
    clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(swapToNext, delay);

    // If clicking front card, cycle to next
    if (posInOrder === 0) {
      swapToNext();
      return;
    }

    // Bring clicked card directly to index 0, preserving remaining sequence
    const nextOrder = [clickedIdx, ...currentOrder.filter((id) => id !== clickedIdx)];
    animateToOrder(nextOrder, true);
  };

  // Synchronize external activeIndex changes
  useEffect(() => {
    if (activeIndex !== undefined && activeIndex !== order.current[0]) {
      bringToFront(activeIndex);
    }
  }, [activeIndex]);

  useEffect(() => {
    refs.forEach((r, i) => {
      if (r.current) {
        placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount);
      }
    });

    intervalRef.current = window.setInterval(swapToNext, delay);

    if (pauseOnHover && container.current) {
      const node = container.current;
      const pause = () => clearInterval(intervalRef.current);
      const resume = () => {
        clearInterval(intervalRef.current);
        intervalRef.current = window.setInterval(swapToNext, delay);
      };
      node.addEventListener('mouseenter', pause);
      node.addEventListener('mouseleave', resume);
      return () => {
        node.removeEventListener('mouseenter', pause);
        node.removeEventListener('mouseleave', resume);
        clearInterval(intervalRef.current);
      };
    }

    return () => clearInterval(intervalRef.current);
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, total]);

  const rendered = childArr.map((child, i) =>
    isValidElement<CardProps>(child)
      ? cloneElement(child, {
        key: i,
        ref: refs[i],
        style: { width, height, ...(child.props.style ?? {}) },
        onClick: e => {
          e.stopPropagation();
          bringToFront(i);
          child.props.onClick?.(e as React.MouseEvent<HTMLDivElement>);
          onCardClick?.(i);
        }
      } as CardProps & React.RefAttributes<HTMLDivElement>)
      : child
  );

  return (
    <div
      ref={container}
      className={`relative perspective-[1000px] overflow-visible select-none mx-auto origin-center transition-transform duration-300 ${className}`}
      style={{ width, height }}
    >
      {rendered}
    </div>
  );
};

export default CardSwap;
