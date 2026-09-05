import { useState } from 'react';
import { submitLead } from '../api.js';

export default function LeadForm({ car, onClose }) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('idle');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      await submitLead({ car_id: car?.id, name, phone, message: car ? `${car.brand} ${car.model}` : '' });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="lead-overlay" onClick={onClose}>
      <div className="lead-modal" onClick={(e) => e.stopPropagation()}>
        <button className="lead-close" onClick={onClose} aria-label="Закрыть">×</button>

        {car && (
          <p className="lead-car">Заявка по авто: {car.brand} {car.model}, {car.year}</p>
        )}

        {status === 'sent' ? (
          <p className="lead-success">Заявка отправлена. Менеджер AJ Import свяжется с вами в течение часа.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3>Оставить заявку</h3>
            <label>
              <span>Имя</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Как к вам обращаться" />
            </label>
            <label>
              <span>Телефон</span>
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 900 000-00-00" />
            </label>
            <button type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Отправляем…' : 'Отправить заявку'}
            </button>
            {status === 'error' && <p className="lead-error">Не получилось отправить, попробуйте ещё раз.</p>}
          </form>
        )}
      </div>
    </div>
  );
}
