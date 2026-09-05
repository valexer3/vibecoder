import { useLayoutEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Topbar({ onLeadClick }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const setHeight = () => {
      document.documentElement.style.setProperty('--topbar-h', `${el.offsetHeight}px`);
    };
    setHeight();
    const observer = new ResizeObserver(setHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <header className="topbar" ref={ref}>
      <div className="topbar-inner">
        <Link to="/" className="logo">
          <span className="logo-mark">AJ</span>
          <span className="logo-word">Import</span>
        </Link>
        <nav>
          <NavLink to="/catalog" className={({ isActive }) => (isActive ? 'is-active' : undefined)}>Каталог</NavLink>
          <NavLink to="/services" className={({ isActive }) => (isActive ? 'is-active' : undefined)}>Услуги</NavLink>
          <NavLink to="/contacts" className={({ isActive }) => (isActive ? 'is-active' : undefined)}>Контакты</NavLink>
        </nav>
        <button className="cta-outline" onClick={onLeadClick}>Оставить заявку</button>
      </div>
    </header>
  );
}
