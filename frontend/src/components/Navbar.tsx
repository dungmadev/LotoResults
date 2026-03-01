import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">🎰</span>
                    <span>XỔ SỐ LIVE</span>
                </Link>

                <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? '✕' : '☰'}
                </button>

                <ul className={`navbar-nav ${isOpen ? 'open' : ''}`}>
                    <li>
                        <Link to="/" className={isActive('/')} onClick={() => setIsOpen(false)}>
                            🏠 Trang chủ
                        </Link>
                    </li>
                    <li>
                        <Link to="/search" className={isActive('/search')} onClick={() => setIsOpen(false)}>
                            🔍 Tra cứu
                        </Link>
                    </li>
                    <li>
                        <Link to="/history" className={isActive('/history')} onClick={() => setIsOpen(false)}>
                            📅 Lịch sử
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
