import React from 'react'
import { NavLink } from 'react-router-dom'

const Header = () => {
    return (
        <>
            <nav className='row navbar m-0 p-0 w-100'>
                <div className='col-2'>Stock Search</div>
                <div className='col d-flex flex-row-reverse align-items-center'>
                    <div className='head-link p-2 me-5'>
                        <NavLink to="/portfolio">Portfolio</NavLink>
                    </div>
                    <div className='head-link p-2 me-1'>
                        <NavLink to="/watchlist">Watchlist</NavLink>
                    </div>
                    <div className='head-link p-2 me-1'>
                        <NavLink to="/search/home">Search</NavLink>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Header