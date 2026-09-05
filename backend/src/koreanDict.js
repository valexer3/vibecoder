// Словарь перевода корейских названий Encar (марка/модель/комплектация) на
// русский/латиницу для отображения в каталоге. Марки и модели переводятся
// в общепринятые латинские названия (как принято на авторынке), связующие
// слова (поколение, гибрид, класс и т.п.) - на русский.
// Исходные корейские значения не теряются - они остаются в raw JSONB.

export const BRAND_MAP = {
  '현대': 'Hyundai',
  '기아': 'Kia',
  '제네시스': 'Genesis',
  'KG모빌리티(쌍용)': 'SsangYong',
  '쌍용': 'SsangYong',
  '르노코리아(삼성)': 'Renault Korea (Samsung)',
  '쉐보레(GM대우)': 'Chevrolet (GM Korea)',
  '벤츠': 'Mercedes-Benz',
  '아우디': 'Audi',
  '폭스바겐': 'Volkswagen',
  '토요타': 'Toyota',
  '렉서스': 'Lexus',
  '혼다': 'Honda',
  '닛산': 'Nissan',
  '볼보': 'Volvo',
  '랜드로버': 'Land Rover',
  '재규어': 'Jaguar',
  '포르쉐': 'Porsche',
  '지프': 'Jeep',
  '포드': 'Ford',
  '캐딜락': 'Cadillac',
  '링컨': 'Lincoln',
  '미니': 'MINI',
  '크라이슬러': 'Chrysler',
  '푸조': 'Peugeot',
  '시트로엥': 'Citroën',
  '피아트': 'Fiat',
  '스코다': 'Škoda',
  '스바루': 'Subaru',
  '마세라티': 'Maserati',
  '페라리': 'Ferrari',
  '람보르기니': 'Lamborghini',
  '벤틀리': 'Bentley',
  '롤스로이스': 'Rolls-Royce',
  '알파로메오': 'Alfa Romeo',
  '테슬라': 'Tesla',
};

// Точные переводы для конкретных моделей (ключ - оригинальная корейская
// марка, вложенный ключ - оригинальная корейская модель).
export const MODEL_MAP = {
  'BMW': {
    '5시리즈 (G30)': '5 серии (G30)',
    '5시리즈 (G60)': '5 серии (G60)',
    '6시리즈 GT (G32)': '6 серии GT (G32)',
    '7시리즈 (G70)': '7 серии (G70)',
    'X5 (G05)': 'X5 (G05)',
    'X6 (G06)': 'X6 (G06)',
    'X7 (G07)': 'X7 (G07)',
    'XM (G09)': 'XM (G09)',
  },
  'KG모빌리티(쌍용)': {
    '더 뉴 렉스턴 스포츠': 'New Rexton Sport',
    '더 뉴 코란도 스포츠': 'New Korando Sport',
    '베리 뉴 티볼리': 'Tivoli (обновлённый)',
    '뷰티풀 코란도': 'Korando Beautiful',
    '코란도 스포츠': 'Korando Sport',
    '티볼리 아머': 'Tivoli Armor',
  },
  '기아': {
    'EV6': 'EV6',
    'K3': 'K3',
    'K7': 'K7',
    'K9': 'K9',
    '더 뉴 K3': 'New K3',
    '더 뉴 K3 2세대': 'New K3 2 поколение',
    '더 뉴 레이': 'New Ray',
    '더 뉴 모하비': 'New Mohave',
    '더 뉴 쏘렌토': 'New Sorento',
    '더 뉴 쏘렌토 4세대': 'New Sorento 4 поколение',
    '더 뉴 카니발': 'New Carnival',
    '레이': 'Ray',
    '모하비 더 마스터': 'Mohave The Master',
    '셀토스': 'Seltos',
    '스포티지 R': 'Sportage R',
    '쏘렌토 4세대': 'Sorento 4 поколение',
    '올 뉴 K3': 'Полностью новый K3',
    '올 뉴 모닝': 'Полностью новый Morning',
    '올 뉴 모닝 (JA)': 'Полностью новый Morning (JA)',
    '올 뉴 쏘렌토': 'Полностью новый Sorento',
    '올 뉴 카니발': 'Полностью новый Carnival',
    '카니발 4세대': 'Carnival 4 поколение',
  },
  '랜드로버': {
    '레인지로버 5세대': 'Range Rover 5 поколение',
    '레인지로버 이보크': 'Range Rover Evoque',
  },
  '르노코리아(삼성)': {
    'QM3': 'QM3',
    'QM6': 'QM6',
    'SM6': 'SM6',
    'SM7 노바': 'SM7 Nova',
    '뉴QM3': 'New QM3',
  },
  '미니': {
    '쿠퍼': 'Cooper',
  },
  '벤츠': {
    'AMG GT C192': 'AMG GT C192',
    'C-클래스 W206': 'C-класс W206',
    'CLE-클래스 C236': 'CLE-класс C236',
    'CLS-클래스 C257': 'CLS-класс C257',
    'GLB-클래스 X247': 'GLB-класс X247',
    'GLE-클래스 W167': 'GLE-класс W167',
    'S-클래스 W221': 'S-класс W221',
    'S-클래스 W222': 'S-класс W222',
    'SL-클래스 R232': 'SL-класс R232',
  },
  '볼보': {
    'XC40': 'XC40',
  },
  '쉐보레(GM대우)': {
    '더 뉴 말리부': 'New Malibu',
    '스파크': 'Spark',
  },
  '아우디': {
    'Q7 (4M)': 'Q7 (4M)',
    'R8 (4S)': 'R8 (4S)',
  },
  '재규어': {
    'F-PACE': 'F-PACE',
    'New XF': 'New XF',
  },
  '제네시스': {
    'G80': 'G80',
    'G80 (RG3)': 'G80 (RG3)',
    'G90': 'G90',
    'GV80': 'GV80',
  },
  '지프': {
    '체로키(KL)': 'Cherokee (KL)',
  },
  '포드': {
    '익스플로러': 'Explorer',
    '익스플로러 6세대': 'Explorer 6 поколение',
  },
  '포르쉐': {
    '718 박스터': '718 Boxster',
    '박스터': 'Boxster',
  },
  '폭스바겐': {
    '더 뉴 파사트': 'New Passat',
  },
  '푸조': {
    '2008': '2008',
  },
  '현대': {
    'LF 쏘나타': 'Sonata LF',
    '그랜드 스타렉스': 'Grand Starex',
    '그랜저 HG': 'Grandeur HG',
    '그랜저 HG 하이브리드': 'Grandeur HG гибрид',
    '그랜저 IG': 'Grandeur IG',
    '그랜저 하이브리드 (GN7)': 'Grandeur гибрид (GN7)',
    '뉴 투싼 ix': 'New Tucson ix',
    '더 뉴 그랜드 스타렉스': 'New Grand Starex',
    '더 뉴 그랜저 IG': 'New Grandeur IG',
    '더 뉴 싼타페': 'New Santa Fe',
    '더 뉴 아반떼': 'New Avante',
    '더 뉴 팰리세이드': 'New Palisade',
    '스타리아': 'Staria',
    '싼타페 (MX5)': 'Santa Fe (MX5)',
    '쏘나타 (DN8)': 'Sonata (DN8)',
    '쏘나타 디 엣지 하이브리드(DN8)': 'Sonata The Edge гибрид (DN8)',
    '아반떼 (CN7)': 'Avante (CN7)',
    '아반떼 AD': 'Avante AD',
    '아반떼 MD': 'Avante MD',
    '아이오닉5': 'Ioniq 5',
    '에쿠스(신형)': 'Equus (новое поколение)',
    '캐스퍼': 'Casper',
    '코나 하이브리드': 'Kona гибрид',
    '투싼 (NX4)': 'Tucson (NX4)',
    '투싼 ix': 'Tucson ix',
    '팰리세이드': 'Palisade',
  },
};

// Двухсловные фразы (пробел внутри) - проверяются раньше одиночных токенов.
const PHRASE_MAP = {
  '더 뉴': 'New',
  '올 뉴': 'Полностью новый',
  '베리 뉴': 'Обновлённый',
};

// Общий словарь связующих/описательных слов - используется как запасной
// вариант для моделей/комплектаций, которых нет в MODEL_MAP выше (например,
// новые объявления после следующей синхронизации). Заменяются только целые
// токены (по границам пробелов), а не произвольные подстроки - иначе,
// например, "뉴" ("New") ложно сработает внутри "에비뉴" ("Avenue").
const WORD_MAP = {
  '뉴': 'New',
  '신형': 'новое поколение',
  '하이브리드': 'гибрид',
  '세대': 'поколение',
  '시리즈': 'серии',
  '클래스': 'класс',
  '퍼포먼스': 'Performance',
  '쿠페': 'Купе',
  '스포츠': 'Спорт',
  '프리미엄': 'Премиум',
  '럭셔리': 'Люкс',
  '디럭스': 'Делюкс',
  '익스클루시브': 'Exclusive',
  '스타일': 'Style',
  '다이나믹': 'Dynamic',
  '어드밴스드': 'Advanced',
  '프레스티지': 'Prestige',
  '스마트': 'Smart',
  '모던': 'Modern',
  '인스퍼레이션': 'Inspiration',
  '노블레스': 'Noblesse',
  '캘리그래피': 'Calligraphy',
  '세단': 'седан',
  '왜건': 'универсал',
  '웨건': 'универсал',
  '해치백': 'хэтчбек',
  '가솔린': 'бензин',
  '디젤': 'дизель',
  '전기': 'электро',
  '터보': 'турбо',
  '리미티드': 'Limited',
  '콰트로': 'quattro',
  '포트폴리오': 'Portfolio',
  '인스크립션': 'Inscription',
  '스페셜': 'Special',
  '얼티메이트': 'Ultimate',
  '브라이트': 'Bright',
  '시그니처': 'Signature',
  '에디션': 'Edition',
  '삼바': 'Samba',
  '케어': 'Care',
  '플러스': 'Plus',
  '밸류': 'Value',
  '프레지던트': 'President',
  '에비뉴': 'Avenue',
  '펠린': 'Feline',
  '레드라인': 'Redline',
  '케어플러스': 'Care Plus',
  '렌터카용': 'для проката',
  '밴': 'фургон',
  '카고': 'Cargo',
  '캠핑카': 'дом на колёсах',
  '롱레인지': 'Long Range',
  '스탠다드': 'Стандарт',
  '트렌디': 'Trendy',
  '어린이보호차': 'автобус для перевозки детей',
};

const FUEL_MAP = {
  '가솔린': 'Бензин',
  '디젤': 'Дизель',
  '전기': 'Электро',
  '가솔린+전기': 'Гибрид',
  '가솔린+전기(하이브리드)': 'Гибрид',
  'LPG': 'LPG',
  'LPG(일반인 구입)': 'LPG',
};

export function translateFuelType(koreanFuel) {
  if (!koreanFuel) return koreanFuel;
  return FUEL_MAP[koreanFuel] ?? translateWords(koreanFuel);
}

// Категории кузова Encar (spec.bodyName в detail-ответе) - полный список
// стандартных категорий классификации Encar, не только те, что встретились
// в тестовой выборке (경차/소형차/준중형차/중형차/대형차 - линейка легковых
// по классу размера, а не по форме кузова, как принято на корейском рынке).
const BODY_TYPE_MAP = {
  '경차': 'Малолитражный автомобиль',
  '소형차': 'Малый класс',
  '준중형차': 'Компактный класс',
  '중형차': 'Средний класс',
  '대형차': 'Представительский класс',
  'SUV': 'SUV',
  '스포츠카': 'Спорткар',
  '승합차': 'Микроавтобус',
  '화물차': 'Грузовой автомобиль',
  'RV': 'Минивэн',
};

export function translateBodyType(koreanBodyType) {
  if (!koreanBodyType) return koreanBodyType;
  return BODY_TYPE_MAP[koreanBodyType] ?? translateWords(koreanBodyType);
}

// Тип коробки передач (spec.transmissionName в detail-ответе).
const TRANSMISSION_MAP = {
  '오토': 'Автомат',
  '수동': 'Механика',
  '세미오토': 'Робот',
  'CVT': 'Вариатор',
};

export function translateTransmission(koreanTransmission) {
  if (!koreanTransmission) return koreanTransmission;
  return TRANSMISSION_MAP[koreanTransmission] ?? translateWords(koreanTransmission);
}

export function translateBrand(koreanBrand) {
  if (!koreanBrand) return koreanBrand;
  return BRAND_MAP[koreanBrand] ?? translateWords(koreanBrand);
}

export function translateModel(koreanBrand, koreanModel) {
  if (!koreanModel) return koreanModel;
  const exact = MODEL_MAP[koreanBrand]?.[koreanModel];
  if (exact) return exact;
  return translateWords(koreanModel);
}

// Best-effort замена известных корейских слов на русские/английские
// эквиваленты, только по целым токенам (разделённым пробелами), плюс
// суффиксы "<число>인승" (мест) и "<число>도어" (дверей). Непереведённые
// токены (нет в словаре) остаются как есть.
export function translateWords(text) {
  if (!text) return text;
  const withSuffixes = text
    .replace(/([^\s(])\(/g, '$1 (') // "디젤(e-VGT)" -> "디젤 (e-VGT)", чтобы токены не склеивались со скобкой
    .replace(/(\d+)인승/g, '$1-местный')
    .replace(/(\d+)도어/g, '$1-дверный')
    .replace(/\(([가-힣]+)\)/g, (m, inner) => `(${WORD_MAP[inner] ?? inner})`);

  const tokens = withSuffixes.split(' ');
  const out = [];
  for (let i = 0; i < tokens.length; i++) {
    const phrase = tokens.slice(i, i + 2).join(' ');
    if (PHRASE_MAP[phrase]) {
      out.push(PHRASE_MAP[phrase]);
      i++;
      continue;
    }
    out.push(WORD_MAP[tokens[i]] ?? tokens[i]);
  }
  return out.join(' ').replace(/\s+/g, ' ').trim();
}
