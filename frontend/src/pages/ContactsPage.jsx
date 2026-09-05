import { CONTACT_PHONE, CONTACT_PHONE_HREF, TELEGRAM_HANDLE, TELEGRAM_URL, OFFICE_ADDRESS } from '../constants.js';

const CARDS = [
  { icon: '✈️', title: 'Telegram', value: TELEGRAM_HANDLE, href: TELEGRAM_URL, cta: 'Написать' },
  { icon: '📞', title: 'Телефон', value: CONTACT_PHONE, href: CONTACT_PHONE_HREF, cta: 'Позвонить' },
  { icon: '📍', title: 'Адрес офиса', value: OFFICE_ADDRESS, href: null, cta: null },
];

export default function ContactsPage() {
  return (
    <section className="section page-section">
      <div className="section-inner">
        <div className="page-head">
          <h1>Контакты</h1>
          <p>Свяжитесь с нами удобным способом — ответим и подберём вариант под ваш бюджет.</p>
        </div>

        <div className="contact-grid">
          {CARDS.map((c) => (
            <article key={c.title} className="contact-card">
              <span className="contact-icon" aria-hidden="true">{c.icon}</span>
              <h3>{c.title}</h3>
              <p>{c.value}</p>
              {c.href && (
                <a href={c.href} target="_blank" rel="noreferrer" className="contact-link">{c.cta} →</a>
              )}
            </article>
          ))}
        </div>

        <div className="map-placeholder">
          <span>Карта появится здесь после уточнения адреса офиса</span>
        </div>
      </div>
    </section>
  );
}
