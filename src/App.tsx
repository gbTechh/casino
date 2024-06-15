
import './App.css'

import { Route, Routes } from 'react-router';
import Kabala from './Kabala';
import { Ruleta } from './Ruleta';
import { Link } from 'react-router-dom';



function App() {

  
  return (
    <>
      <nav className='absolute top-0 flex gap-4'>
        <ul className='w-full flex gap-4 items-center justify-center'>
          <li><Link to={'/'}>Ruleta</Link></li>
          <li><Link to={'/kabala'}>Kabala</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Ruleta/>}/>        
        <Route path="/kabala" element={<Kabala/>}/>        
      </Routes>
      
    </>
  );
}

export default App
