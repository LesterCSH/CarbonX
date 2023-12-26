import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, Welcome, Footer, Services, Transactions } from './components';
//import Register from './components/Register';
//import RegisteredUsers from './components/RegisteredUser';

const App = () => (
  <Router>
    <div className="min-h-screen">
      <div className="gradient-bg-welcome">
      <Navbar />
        <Routes>
          <Route path="/" element={<Welcome />} />

        </Routes>
      </div>
      <Services />
      <Footer />
    </div>
  </Router>
);

export default App;
