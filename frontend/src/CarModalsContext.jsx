import { createContext, useContext, useState } from 'react';
import CarDetails from './components/CarDetails.jsx';
import LeadForm from './components/LeadForm.jsx';

const CarModalsContext = createContext(null);

export function CarModalsProvider({ children }) {
  const [leadCar, setLeadCar] = useState(undefined); // undefined = закрыто, null = общая заявка
  const [detailsCar, setDetailsCar] = useState(undefined); // undefined = закрыто

  const openLead = (car) => setLeadCar(car ?? null);
  const closeLead = () => setLeadCar(undefined);
  const openDetails = (car) => setDetailsCar(car);
  const closeDetails = () => setDetailsCar(undefined);

  return (
    <CarModalsContext.Provider value={{ openLead, openDetails }}>
      {children}

      {detailsCar !== undefined && (
        <CarDetails
          car={detailsCar}
          onClose={closeDetails}
          onRequestLead={(car) => { closeDetails(); openLead(car); }}
        />
      )}
      {leadCar !== undefined && <LeadForm car={leadCar} onClose={closeLead} />}
    </CarModalsContext.Provider>
  );
}

export function useCarModals() {
  const ctx = useContext(CarModalsContext);
  if (!ctx) throw new Error('useCarModals must be used within CarModalsProvider');
  return ctx;
}
