import React from 'react'
import 'bootstrap-icons/font/bootstrap-icons.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"
import {
  Routes,
  Route,
  Navigate,
  BrowserRouter,
} from 'react-router-dom'
import Search from './page/Search';
import Portfolio from "./page/Portfolio";
import Watchlist from './page/Watchlist';
import Header from './page/Header';
import Footer from './page/Footer';

const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <div className='centered-content'>
        <Routes>
          <Route path='/' element={<Navigate replace to="/search/home" />} />
          <Route path='/search/home' element={<Search />} />
          <Route path='/search/:ticker' element={<Search />} />
          <Route path='/watchlist' element={<Watchlist />} />
          <Route path='/portfolio' element={<Portfolio />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App
