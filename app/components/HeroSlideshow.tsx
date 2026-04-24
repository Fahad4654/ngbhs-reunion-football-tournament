'use client';

import { useState, useEffect } from 'react';

const slides = [
  '/slides/slide1.png',
  '/slides/slide2.png',
  '/slides/slide3.png',
];

export default function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
      overflow: 'hidden'
    }}>
      {slides.map((slide, index) => (
        <div
          key={slide}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${slide})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: index === currentSlide ? 0.4 : 0,
            transition: 'opacity 1.5s ease-in-out',
            zIndex: index === currentSlide ? 1 : 0
          }}
        />
      ))}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(to bottom, rgba(10, 11, 13, 0.8) 0%, rgba(10, 11, 13, 0.4) 50%, rgba(10, 11, 13, 0.9) 100%)',
        zIndex: 2
      }} />
    </div>
  );
}
