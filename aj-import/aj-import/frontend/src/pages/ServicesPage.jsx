const SERVICES = [
  {
    icon: '📄',
    title: 'Оформление ЭПТС',
    text: 'Электронный паспорт транспортного средства — оформляем полностью сами, без вашего участия и визитов в инстанции.',
  },
  {
    icon: '🛡️',
    title: 'Оформление СБКТС',
    text: 'Свидетельство о безопасности конструкции ТС — обязательный документ для постановки авто на учёт в РФ.',
  },
  {
    icon: '🚢',
    title: 'Услуги таможенного брокера',
    text: 'Ведём растаможку под ключ: расчёт пошлин, декларирование, взаимодействие с таможней от вашего имени.',
  },
  {
    icon: '🚚',
    title: 'Логистика и доставка',
    text: 'Доставка от продавца в Корее или Китае до вашего города — морем, ж/д платформой или автовозом.',
  },
];

export default function ServicesPage() {
  return (
    <section className="section page-section">
      <div className="section-inner">
        <div className="page-head">
          <h1>Услуги</h1>
          <p>Берём на себя весь процесс покупки и оформления автомобиля из-за рубежа.</p>
        </div>

        <div className="service-grid">
          {SERVICES.map((s) => (
            <article key={s.title} className="service-card">
              <span className="service-icon" aria-hidden="true">{s.icon}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
