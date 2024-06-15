import React, { useEffect, useRef, useState } from "react";

interface Props {
  priceMin: number;
  priceMax: number;
  currency: string;
}

export const InputRangeDouble: React.FC<Props> = ({
  priceMin,
  priceMax,
  currency,
}) => {
  const [percentMin, setPercentMin] = useState(0);
  const [priceRangeMin, setpriceRangeMin] = useState(priceMin);
  const [percentMax, setPercentMax] = useState(100);
  const [priceRangeMax, setpriceRangeMax] = useState(priceMax);
  const rangeLeftRef = useRef<HTMLDivElement>(null);
  const rangeRightRef = useRef<HTMLDivElement>(null);
  const barProgressRef = useRef<HTMLDivElement>(null);

  const widthRange = useRef(0);

  // Refs Left
  const positionLeftRef = useRef(0);
  const dragStartXLeftRef = useRef(0);
  const dragEndXLeftRef = useRef(0);
  // click Left
  const handleMouseDown = (event: React.MouseEvent) => {
    if (rangeLeftRef.current !== null) {
      widthRange.current = rangeLeftRef.current.offsetWidth;
    }
    dragStartXLeftRef.current = event.clientX;
    window.addEventListener("mousemove", handleMouseMove as any);
    window.addEventListener("mouseup", handleMouseUp as any);

    if (rangeLeftRef.current != null && rangeRightRef.current != null) {
      rangeLeftRef.current.style.zIndex = "11";
      rangeRightRef.current.style.zIndex = "10";
    }
  };
  const handleMouseMove = (event: React.MouseEvent) => {
    const currentX = event.clientX;
    const deltaX =
      dragEndXLeftRef.current + currentX - dragStartXLeftRef.current;
    if (barProgressRef.current !== null) {
      const widthBarProgress = barProgressRef.current.offsetWidth;
      const fullPercent = widthBarProgress - widthRange.current;
      positionLeftRef.current = deltaX;
      if (deltaX <= 0) {
        positionLeftRef.current = 0;
      }

      if (deltaX >= fullPercent - Math.abs(positionRightRef.current)) {
        positionLeftRef.current =
          fullPercent - Math.abs(positionRightRef.current);
      }

      if (rangeLeftRef.current != null) {
        rangeLeftRef.current.style.transform = `translateX(${positionLeftRef.current}px)`;
      }
      setPercentMin((positionLeftRef.current * 100) / fullPercent);
    }
  };
  const handleMouseUp = (event: React.MouseEvent) => {
    dragEndXLeftRef.current = positionLeftRef.current;
    window.removeEventListener("mousemove", handleMouseMove as any);
    window.removeEventListener("mouseup", handleMouseUp as any);
  };
  // touch left
  const handleTouchStartLeft = (event: React.TouchEvent) => {
    if (rangeLeftRef.current !== null) {
      widthRange.current = rangeLeftRef.current.offsetWidth;
    }
    dragStartXLeftRef.current = event.touches[0].clientX;
    window.addEventListener("touchmove", handleTouchMoveLeft as any);
    window.addEventListener("touchend", handleTouchEndLeft as any);
    if (rangeLeftRef.current != null && rangeRightRef.current != null) {
      rangeLeftRef.current.style.zIndex = "11";
      rangeRightRef.current.style.zIndex = "10";
    }
  };
  const handleTouchMoveLeft = (event: React.TouchEvent) => {
    const currentX = event.touches[0].clientX;
    const deltaX =
      dragEndXLeftRef.current + currentX - dragStartXLeftRef.current;
    if (barProgressRef.current !== null) {
      const widthBarProgress = barProgressRef.current.offsetWidth;
      const fullPercent = widthBarProgress - widthRange.current;
      positionLeftRef.current = deltaX;
      if (deltaX <= 0) {
        positionLeftRef.current = 0;
      }

      if (deltaX >= fullPercent - Math.abs(positionRightRef.current)) {
        positionLeftRef.current =
          fullPercent - Math.abs(positionRightRef.current);
      }

      if (rangeLeftRef.current != null) {
        rangeLeftRef.current.style.transform = `translateX(${positionLeftRef.current}px)`;
      }
      setPercentMin((positionLeftRef.current * 100) / fullPercent);
    }
  };
  const handleTouchEndLeft = (event: React.TouchEvent) => {
    dragEndXLeftRef.current = positionLeftRef.current;
    window.removeEventListener("touchmove", handleTouchMoveLeft as any);
    window.removeEventListener("touchup", handleTouchEndLeft as any);
  };

  // Refs Right
  const positionRightRef = useRef(0);
  const dragStartXRightRef = useRef(0);
  const dragEndXRightRef = useRef(0);
  // click right
  const handleMouseDownRight = (event: React.MouseEvent) => {
    if (rangeRightRef.current !== null) {
      widthRange.current = rangeRightRef.current.offsetWidth;
    }
    dragStartXRightRef.current = event.clientX;
    window.addEventListener("mousemove", handleMouseMoveRight as any);
    window.addEventListener("mouseup", handleMouseUpRight as any);
    if (rangeLeftRef.current != null && rangeRightRef.current != null) {
      rangeLeftRef.current.style.zIndex = "10";
      rangeRightRef.current.style.zIndex = "11";
    }
  };
  const handleMouseMoveRight = (event: React.MouseEvent) => {
    const currentX = event.clientX;
    const deltaX =
      dragEndXRightRef.current + currentX - dragStartXRightRef.current;
    if (barProgressRef.current !== null) {
      const widthBarProgress = barProgressRef.current.offsetWidth;
      const fullPercent = widthBarProgress - widthRange.current;

      positionRightRef.current = deltaX;
      if (deltaX >= 0) {
        positionRightRef.current = 0;
      }
      if (deltaX * -1 >= fullPercent - positionLeftRef.current) {
        positionRightRef.current = (fullPercent - positionLeftRef.current) * -1;
      }

      if (rangeRightRef.current != null) {
        rangeRightRef.current.style.transform = `translateX(${positionRightRef.current}px)`;
      }
      setPercentMax(100 - (positionRightRef.current * 100 * -1) / fullPercent);
    }
  };
  const handleMouseUpRight = (event: React.MouseEvent) => {
    dragEndXRightRef.current = positionRightRef.current;
    window.removeEventListener("mousemove", handleMouseMoveRight as any);
    window.removeEventListener("mouseup", handleMouseUpRight as any);
  };

  // Touch Right
  const handleTouchStartRight = (event: React.TouchEvent) => {
    if (rangeRightRef.current !== null) {
      widthRange.current = rangeRightRef.current.offsetWidth;
    }
    dragStartXRightRef.current = event.touches[0].clientX;
    window.addEventListener("touchmove", handleTouchMoveRight as any);
    window.addEventListener("touchend", handleTouchEndRight as any);
    if (rangeLeftRef.current != null && rangeRightRef.current != null) {
      rangeLeftRef.current.style.zIndex = "10";
      rangeRightRef.current.style.zIndex = "11";
    }
  };
  const handleTouchMoveRight = (event: React.TouchEvent) => {
    const currentX = event.touches[0].clientX;
    const deltaX =
      dragEndXRightRef.current + currentX - dragStartXRightRef.current;
    if (barProgressRef.current !== null) {
      const widthBarProgress = barProgressRef.current.offsetWidth;
      const fullPercent = widthBarProgress - widthRange.current;

      positionRightRef.current = deltaX;
      if (deltaX >= 0) {
        positionRightRef.current = 0;
      }
      if (deltaX * -1 >= fullPercent - positionLeftRef.current) {
        positionRightRef.current = (fullPercent - positionLeftRef.current) * -1;
      }

      if (rangeRightRef.current != null) {
        rangeRightRef.current.style.transform = `translateX(${positionRightRef.current}px)`;
      }
      setPercentMax(100 - (positionRightRef.current * 100 * -1) / fullPercent);
    }
  };
  const handleTouchEndRight = (event: React.TouchEvent) => {
    dragEndXRightRef.current = positionRightRef.current;
    window.removeEventListener("touchmove", handleTouchMoveRight as any);
    window.removeEventListener("touchup", handleTouchEndRight as any);
  };

  useEffect(() => {
    setpriceRangeMin(
      (priceMax - priceMin) * (Math.trunc(percentMin) / 100) + priceMin
    );
  }, [percentMin]);
  useEffect(() => {
    setpriceRangeMax(
      priceMax - ((100 - Math.trunc(percentMax)) * (priceMax - priceMin)) / 100
    );
  }, [percentMax]);

  return (
    <div className="w-full flex flex-col">
      <div className="flex justify-between items-center">
        <div className="w-1/2 flex items-start flex-col justify-center">
          <p >
            Mínimo
          </p>
          <p >
            {currency}
            {priceRangeMin}
          </p>
        </div>
        <div className="w-1/2 flex items-end justify-center flex-col">
          <p >
            Máximo
          </p>
          <p >
            {currency}
            {priceRangeMax}
          </p>
        </div>
      </div>
      <div className="w-full pt-1 px-0 pb-3 mt-4 relative block select-none">
        <div
          className="w-[24px] bg-white rounded-full h-[24px] border-[1px] border-brgrey1 absolute -top-[7px] block z-[11] left-0 hover:border-tprimary1"
          ref={rangeLeftRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStartLeft}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleTouchEndLeft}
        ></div>
        <div
          className="w-full rounded-full h-[2px] relative"
          style={{
            background: `linear-gradient(to right, rgb(9,9,9) ${percentMin}%, rgb(9,9,9) ${percentMin}%, rgb(71, 98, 239) 10.0999%, rgb(71, 98, 239) ${percentMax}%, rgb(9,9,9) ${percentMax}%, rgb(9,9,9) 100%)`,
          }}
          ref={barProgressRef}
        ></div>

        <div
          className="w-[24px] rounded-full h-[24px] border-[1px] border-brgrey1 absolute -top-[7px] block z-[10] right-0 bg-white hover:border-tprimary1"
          ref={rangeRightRef}
          onMouseDown={handleMouseDownRight}
          onTouchStart={handleTouchStartRight}
          onMouseUp={handleMouseUpRight}
          onTouchEnd={handleTouchEndRight}
        ></div>
      </div>
    </div>
  );
};
