import { Link } from 'react-router-dom';
import CarSilhouette from './CarSilhouette.jsx';
import { TELEGRAM_URL } from '../constants.js';

export default function Hero() {
  return (
    <section className="hero">
      <CarSilhouette type="sedan" className="hero-car hero-car--tl" />
      <CarSilhouette type="crossover" className="hero-car hero-car--tr" />
      <CarSilhouette type="ev" className="hero-car hero-car--bl" />
      <CarSilhouette type="coupe" className="hero-car hero-car--br" />

      <div className="hero-inner">
        <h1 className="hero-brand" aria-label="AJ Import">
          <span className="hero-brand-word hero-brand-word--1">AJ</span>
          <span className="hero-brand-word hero-brand-word--2">Import</span>
        </h1>
        <p className="hero-tagline">Автомобили со всего мира — из Кореи и Китая под ключ</p>

        <div className="hero-ctas">
          <Link to="/catalog" className="hero-cta hero-cta--primary">Открыть каталог</Link>
          <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="hero-cta hero-cta--secondary">
            <svg className="hero-cta-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M21.5 3.5 2.7 10.8c-1.1.4-1.1 1 .2 1.4l4.8 1.5 1.9 5.8c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.3-2.2 4.7 3.5c.8.5 1.4.2 1.6-.8L23 4.7c.3-1.2-.4-1.7-1.5-1.2Z" />
            </svg>
            Написать менеджеру
          </a>
        </div>
      </div>

      <div className="hero-scroll-cue">
        <span>Прокрутите вниз</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 4v16m0 0-6-6m6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}
