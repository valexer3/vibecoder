import { COMPANY_NAME, COMPANY_INN, COMPANY_OGRN, CONTACT_PHONE, TELEGRAM_HANDLE } from '../constants.js';

export default function FooterDisclaimer() {
  return (
    <div className="disclaimer">
      <div className="disclaimer-inner">
        <p>
          Настоящий сайт носит исключительно информационный характер и не является публичной офертой
          в соответствии со ст. 437 ГК РФ. Указанные цены и характеристики автомобилей формируются
          автоматически на основе данных зарубежных площадок и могут отличаться от фактических на
          момент покупки. Для расчёта точной стоимости под ключ с учётом доставки, растаможки и
          комиссии обращайтесь к менеджеру.
        </p>
        <p className="disclaimer-requisites">
          {COMPANY_NAME} · ИНН {COMPANY_INN} · ОГРН {COMPANY_OGRN} · {CONTACT_PHONE} · Telegram {TELEGRAM_HANDLE}
        </p>
      </div>
    </div>
  );
}
