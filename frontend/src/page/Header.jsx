import React from 'react'
import { NavLink } from 'react-router-dom'

const Header = () => {
    return (
        <>
            <nav className='navbar d-flex align-items-center justify-content-between p-2'>
                <div className='navbar-brand ms-3'>
                    Stock Search
                </div>
                <ul className='nav'>
                    <li className='nav-item me-2'>
                        <NavLink className="nav-link" activeClassName="active" to="/search/home">Search</NavLink>
                    </li>
                    <li className='nav-item me-2'>
                        <NavLink className="nav-link" activeClassName="active" to="/watchlist">Watchlist</NavLink>
                    </li>
                    <li className='nav-item me-3'>
                        <NavLink className="nav-link" activeClassName="active" to="/portfolio">Portfolio</NavLink>
                    </li>
                </ul>
            </nav>
        </>
    )
}

export default Header