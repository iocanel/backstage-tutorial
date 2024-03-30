import React, { useEffect, useRef } from 'react';
import Reveal from 'reveal.js';
import 'reveal.js/dist/reveal.css';
import './RevealPresentation.css'; 
import 'reveal.js/dist/theme/black.css'; // Optional theme

const RevealPresentation = () => {
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (revealRef.current) {
      const deck = new Reveal(revealRef.current);
      deck.initialize({
        hash: true,
        transition: 'slide',
        embedded: true,
        controls: true,
        progress: true,
        width: "100%",
        height: "100%",
        margin: 0,
        minScale: 1, // Adjust scale to fit the container
        maxScale: 1, // Prevent scaling beyond 100%
      });
    }
  }, []);

  return (
    <div className="reveal" ref={revealRef} style={{ width: '100vw', height: '100vh' }}>
      <div className="slides">
        <section>Slide 1</section>
        <section>Slide 2</section>
        <section>
          <h2>Slide 3</h2>
          <p>This is a slide with more content.</p>
        </section>
      </div>
    </div>
  );
};

export default RevealPresentation;
