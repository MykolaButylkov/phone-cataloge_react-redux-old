/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {
  useState, useEffect, cloneElement, useRef,
} from 'react';
import classNames from 'classnames';
import '../../styles/styles.scss';

type Props = {
  children: JSX.Element[];
};

const PICTURE_SIZE = 100;
const INTERVAL_DELAY = 5000;

export const PreviewSlider: React.FC<Props> = React.memo(({ children }) => {
  const [pages, setPages] = useState<JSX.Element[]>(children);
  const [offset, setOffset] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0); // Track the active slide index
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  function handleLeftClick() {
    setOffset((prevOffset) => {
      const newOffset = prevOffset + PICTURE_SIZE;
      const minOffset = -(PICTURE_SIZE * (pages.length - 1));

      if (newOffset > 0) {
        setActiveIndex(pages.length - 1); // Set activeIndex to the last slide index

        return minOffset;
      }

      setActiveIndex((prevIndex) => Math.max(prevIndex - 1, 0)); // Decrease activeIndex

      return newOffset;
    });

    resetInterval();
  }

  function handleRightClick() {
    setOffset((prevOffset) => {
      const newOffset = prevOffset - PICTURE_SIZE;

      if (newOffset < -(PICTURE_SIZE * (pages.length - 1))) {
        setActiveIndex(0);

        return 0;
      }

      setActiveIndex(
        (prevIndex) => Math.min(prevIndex + 1, pages.length - 1),
      );

      return newOffset;
    });

    resetInterval();
  }

  function resetInterval() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      handleRightClick();
    }, INTERVAL_DELAY);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    setTouchStartX(event.touches[0].clientX);
  }

  function handleTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX === null) {
      return;
    }

    setTouchEndX(event.touches[0].clientX);
  }

  function handleTouchEnd() {
    if (touchStartX === null || touchEndX === null) {
      return;
    }

    const deltaX = touchEndX - touchStartX;

    if (deltaX > 50) {
      handleLeftClick();
    } else if (deltaX < -50) {
      handleRightClick();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  }

  // Function to handle pagination clicks
  function handlePaginationClick(index: number) {
    setActiveIndex(index); // Set the active slide index
    setOffset(-PICTURE_SIZE * index); // Set the offset to display the selected slide
    resetInterval(); // Reset the interval to pause auto-scrolling on manual navigation
  }

  useEffect(() => {
    resetInterval();
  }, []);

  useEffect(() => {
    setPages((prev) => {
      return prev.map((child) => {
        return cloneElement(child, {
          key: child.key,
          style: {
            transition: '500ms',
            transform: `translateX(${offset}%)`,
          },
        });
      });
    });
  }, [offset]);

  return (
    <>
      <button
        type="button"
        className="preview-slider__button"
        onClick={handleLeftClick}
      >
        <img src="images/icons/ArrowLeft.svg" alt="" />
      </button>
      <div
        className="preview-slider__container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="preview-slider__pictures pictures">{pages}</div>
        <div className="preview-slider__pagination pagination">
          {pages.map((page, index) => (
            <button
              type="button"
              key={`paginationit${page.key}`}
              className={classNames(
                'pagination__indicator',
                { 'pagination__indicator--active': index === activeIndex },
              )}
              onClick={() => handlePaginationClick(index)}
            />
          ))}
        </div>
      </div>
      <button
        type="button"
        className="preview-slider__button"
        onClick={handleRightClick}
      >
        <img src="images/icons/ArrowRight.svg" alt="" />
      </button>
    </>
  );
});
