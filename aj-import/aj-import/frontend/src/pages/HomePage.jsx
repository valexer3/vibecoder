import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
// import BrandsMarquee from '../components/BrandsMarquee.jsx'; // отключено: секция "Работаем с брендами" убрана с главной
import FeaturedSection from '../components/FeaturedSection.jsx';
import BrandsShowcase from '../components/BrandsShowcase.jsx';
import Testimonials from '../components/Testimonials.jsx';
import { useCarModals } from '../CarModalsContext.jsx';

export default function HomePage() {
  const { openDetails } = useCarModals();

  return (
    <>
      <Hero />
      {/* <BrandsMarquee /> */}
      <FeaturedSection onSelectCar={openDetails} />
      <BrandsShowcase />
      <Testimonials />

      <section className="section teaser-section">
        <div className="section-inner teaser-grid">
          <div className="teaser-card">
            <h3>Оформление под ключ</h3>
            <p>ЭПТС, СБКТС, растаможка и логистика — берём весь процесс на себя.</p>
            <Link to="/services" className="section-link">Все услуги →</Link>
          </div>
          <div className="teaser-card">
            <h3>Остались вопросы?</h3>
            <p>Расскажем про сроки, стоимость под ключ и ответим в Telegram или по телефону.</p>
            <Link to="/contacts" className="section-link">Контакты →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
