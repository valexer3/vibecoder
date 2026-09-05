import CarCard from './CarCard.jsx';

export default function CarGrid({ cars, loading, error, onSelect }) {
  if (loading) return <div className="state-msg">Загружаем каталог…</div>;
  if (error) return <div className="state-msg state-msg--error">{error}</div>;
  if (cars.length === 0) return <div className="state-msg">Ничего не найдено — попробуйте изменить фильтры</div>;

  return (
    <div className="car-grid">
      {cars.map((car) => (
        <CarCard key={`${car.source}-${car.id}`} car={car} onSelect={onSelect} />
      ))}
    </div>
  );
}
