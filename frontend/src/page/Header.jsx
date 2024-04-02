import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const Header = () => {
    const location = useLocation();
    const isSearchActive = () => location.pathname.startsWith('/search');
    return (
        <>
            <nav className='navbar d-flex align-items-center justify-content-between p-2'>
                <div className='h3 ms-3'>
                    Stock Search
                </div>
                <ul className='head'>
                    <li className='head-item me-2'>
                        <NavLink className={() => isSearchActive() ? "head-link active" : "head-link"} to="/search/home">Search</NavLink>
                    </li>
                    <li className='nav-item me-2'>
                        <NavLink className={({ isActive }) => isActive ? "head-link active" : "head-link"} to="/watchlist">Watchlist</NavLink>
                    </li>
                    <li className='head-item me-3'>
                        <NavLink className={({ isActive }) => isActive ? "head-link active" : "head-link"} to="/portfolio">Portfolio</NavLink>
                    </li>
                </ul>
            </nav>
        </>
    )
}

export default Header