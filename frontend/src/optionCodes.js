// Расшифровка кодов cars.options[] (см. backend/src/parsers/encar.js) - коды,
// которые сам JSON detail-ответ Encar не расшифровывает вообще.
//
// Источник: живой фасет-эндпоинт десктопной страницы поиска Encar -
//   GET https://api.encar.com/search/car/list/general?count=true&q=...&inav=|Metadata|Sort
// Ответ содержит iNav.Nodes[], среди них узел Name:"Options" (옵션) с
// facet-списком {Metadata.Code, DisplayValue, Metadata.Expression (группа)}.
// Найдено через Puppeteer (перехват реального XHR браузера при открытии
// страницы поиска - fc_carsearchlist.do), НЕ через документированный API.
// Одноразовая разведка, headless-браузер в проде не используется и не
// нужен - см. историю проекта. Перекрёстно проверено: все 35 кодов,
// найденных ранее в JS-бандле fem.encar.com, совпали с этим источником.
// Покрывает 62 кода - полный список facet "Options" на странице поиска.
// Коды вне словаря считаются в CarDetails.jsx как "+N ещё", а не
// переводятся наугад (facet мог быть неполным, либо появятся новые опции).
// Хранится только здесь (не дублируется в backend) - backend хранит в БД
// сырые коды как есть, расшифровка нужна только для отображения.
export const OPTION_GROUPS = {
  safety: 'Безопасность',
  comfort: 'Комфорт и мультимедиа',
  exterior: 'Экстерьер и интерьер',
  seats: 'Сиденья',
};

export const OPTION_MAP = {
  '001': { name: 'ABS (антиблокировочная система)', icon: '🛑', group: 'safety' },
  '002': { name: 'Электронная адаптивная подвеска (ECS)', icon: '🌀', group: 'safety' },
  '003': { name: 'CD-плеер', icon: '💿', group: 'comfort' },
  '004': { name: 'Монитор для передних сидений', icon: '📺', group: 'comfort' },
  '005': { name: 'Навигация', icon: '🧭', group: 'comfort' },
  '006': { name: 'Центральный замок', icon: '🔒', group: 'exterior' },
  '007': { name: 'Электростеклоподъёмники', icon: '🪟', group: 'exterior' },
  '008': { name: 'Электроусилитель руля', icon: '🔧', group: 'exterior' },
  '010': { name: 'Люк', icon: '☀️', group: 'exterior' },
  '014': { name: 'Кожаный салон', icon: '🛋️', group: 'seats' },
  '015': { name: 'Беспроводной замок дверей', icon: '🔑', group: 'comfort' },
  '017': { name: 'Легкосплавные диски', icon: '🛞', group: 'exterior' },
  '019': { name: 'Противобуксовочная система (TCS)', icon: '🚫', group: 'safety' },
  '020': { name: 'Боковые подушки безопасности', icon: '🛡️', group: 'safety' },
  '021': { name: 'Электросиденье водителя', icon: '💺', group: 'seats' },
  '022': { name: 'Подогрев передних сидений', icon: '♨️', group: 'seats' },
  '023': { name: 'Автокондиционер (климат-контроль)', icon: '❄️', group: 'comfort' },
  '024': { name: 'Складные боковые зеркала (электро)', icon: '🪞', group: 'exterior' },
  '026': { name: 'Подушка безопасности водителя', icon: '🛡️', group: 'safety' },
  '027': { name: 'Подушка безопасности пассажира', icon: '🛡️', group: 'safety' },
  '029': { name: 'HID-фары', icon: '💡', group: 'exterior' },
  '030': { name: 'Зеркало с автозатемнением', icon: '🌓', group: 'exterior' },
  '031': { name: 'Мультируль', icon: '🎛️', group: 'exterior' },
  '032': { name: 'Задние парктроники', icon: '📡', group: 'safety' },
  '033': { name: 'Датчик давления в шинах (TPMS)', icon: '📟', group: 'safety' },
  '034': { name: 'Вентиляция сиденья водителя', icon: '💨', group: 'seats' },
  '035': { name: 'Электросиденье пассажира', icon: '💺', group: 'seats' },
  '051': { name: 'Память сиденья водителя', icon: '🧠', group: 'seats' },
  '054': { name: 'Монитор для задних сидений', icon: '📺', group: 'comfort' },
  '055': { name: 'Система стабилизации (ESC)', icon: '⚙️', group: 'safety' },
  '056': { name: 'Шторные подушки безопасности', icon: '🛡️', group: 'safety' },
  '057': { name: 'Смарт-ключ', icon: '🗝️', group: 'comfort' },
  '058': { name: 'Камера заднего вида', icon: '📷', group: 'safety' },
  '059': { name: 'Электропривод багажника', icon: '🧳', group: 'exterior' },
  '062': { name: 'Рейлинги на крыше', icon: '📦', group: 'exterior' },
  '063': { name: 'Подогрев задних сидений', icon: '♨️', group: 'seats' },
  '068': { name: 'Круиз-контроль (обычный)', icon: '🚦', group: 'comfort' },
  '071': { name: 'Разъём AUX', icon: '🔌', group: 'comfort' },
  '072': { name: 'USB-разъём', icon: '🔌', group: 'comfort' },
  '074': { name: 'Hi-Pass (транспондер платных дорог)', icon: '🛣️', group: 'exterior' },
  '075': { name: 'LED-фары', icon: '💡', group: 'exterior' },
  '077': { name: 'Вентиляция сиденья пассажира', icon: '💨', group: 'seats' },
  '078': { name: 'Память сиденья пассажира', icon: '🧠', group: 'seats' },
  '079': { name: 'Адаптивный круиз-контроль', icon: '🚦', group: 'comfort' },
  '080': { name: 'Плавное закрывание дверей', icon: '🚪', group: 'exterior' },
  '081': { name: 'Датчик дождя', icon: '🌧️', group: 'comfort' },
  '082': { name: 'Подогрев руля', icon: '♨️', group: 'exterior' },
  '083': { name: 'Электрорегулировка руля', icon: '🎛️', group: 'exterior' },
  '084': { name: 'Подрулевые лепестки переключения передач', icon: '🏎️', group: 'exterior' },
  '085': { name: 'Передние парктроники', icon: '📡', group: 'safety' },
  '086': { name: 'Система бокового/заднего предупреждения', icon: '⚠️', group: 'safety' },
  '087': { name: 'Круговой обзор 360°', icon: '🔄', group: 'safety' },
  '088': { name: 'Система предупреждения о выходе из полосы (LDWS)', icon: '🛣️', group: 'safety' },
  '089': { name: 'Электросиденье заднего ряда', icon: '💺', group: 'seats' },
  '090': { name: 'Вентиляция задних сидений', icon: '💨', group: 'seats' },
  '091': { name: 'Массажное сиденье', icon: '💆', group: 'seats' },
  '092': { name: 'Шторка заднего стекла', icon: '🪟', group: 'comfort' },
  '093': { name: 'Шторки задних дверей', icon: '🪟', group: 'comfort' },
  '094': { name: 'Электронный стояночный тормоз (EPB)', icon: '🅿️', group: 'comfort' },
  '095': { name: 'Проекционный дисплей (HUD)', icon: '📽️', group: 'comfort' },
  '096': { name: 'Bluetooth', icon: '📶', group: 'comfort' },
  '097': { name: 'Автоматическое включение фар', icon: '💡', group: 'comfort' },
};
