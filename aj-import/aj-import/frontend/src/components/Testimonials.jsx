const REVIEWS = [
  {
    name: 'Алексей',
    city: 'Москва',
    carBadge: 'Hyundai Sonata',
    text: 'Заказывал седан из Кореи — от выбора машины на площадке до постановки на учёт прошло чуть больше месяца. Всё совпало с описанием: пробег, комплектация, состояние салона. Растаможку и документы менеджер вёл сам, я только оплачивал счета.',
  },
  {
    name: 'Марина',
    city: 'Санкт-Петербург',
    carBadge: 'Geely Monjaro',
    text: 'Первый раз брала машину из Китая, переживала из-за расстояния и языка. Кроссовер пришёл вовремя, без сколов и косяков после перевозки. Отдельное спасибо, что прислали фото и видео перед отправкой — сомнений не было.',
  },
  {
    name: 'Дмитрий',
    city: 'Краснодар',
    carBadge: 'Genesis GV70',
    text: 'Смотрел премиум-сегмент, сравнивал с ценами у местных дилеров — с доставкой под ключ из Кореи вышло ощутимо дешевле. ЭПТС и СБКТС оформили без моего участия, забрал уже готовую машину с документами.',
  },
];

export default function Testimonials() {
  return (
    <section className="section testimonials">
      <div className="section-inner">
        <div className="section-head">
          <h2>Нам доверяют</h2>
        </div>

        <div className="review-grid">
          {REVIEWS.map((r) => (
            <article key={r.name} className="review-card">
              <div className="review-stars" aria-label="Оценка 5 из 5">★★★★★</div>
              <p className="review-text">{r.text}</p>
              <div className="review-footer">
                <span className="review-car-badge">{r.carBadge}</span>
                <span className="review-author">{r.name}, {r.city}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
