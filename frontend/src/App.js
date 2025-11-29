import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Common/Header';
import Navbar from './components/Common/Navbar';
import Footer from './components/Common/Footer';
import InscriptionForm from './components/Inscription/InscriptionForm';
import DebatList from './components/Debat/DebatList';
import CandidatList from './components/Candidat/CandidatList';
import CandidatProfile from './components/Candidat/CandidatProfile';
import SimpleRepartitionCalculator from './components/Finance/SimpleRepartitionCalculator';
import AdminPanel from './components/Admin/AdminPanel';
import LoginPage from './components/Auth/LoginPage';
import CreateDebatPage from './components/Admin/CreateDebatPage';
import PaymentValidationPage from './components/Admin/PaymentValidationPage';
import GestionDebatsPage from './components/Admin/GestionDebatsPage';
import ClassementPage from './components/Candidat/ClassementPage';
import RetraitPage from './components/Finance/RetraitPage';
import TransactionsPage from './components/Finance/TransactionsPage';

import './App.css';

// Page d'accueil
function Accueil() {
  const navigate = useNavigate();

  return (
    <div className="accueil-page">
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">Défiez vos idées, Gagnez de l'argent.</h1>
          <p className="hero-subtitle">
            La plateforme éducative de débats qui récompense l'éloquence et le savoir de la jeunesse gabonaise.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/inscription')}>Je m'inscris</button>
            <button className="btn-secondary" onClick={() => navigate('/debats')}>Voir les débats</button>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2>Pourquoi L'Arbre à Palabres ?</h2>
          <p>Le dialogue, au cœur du vivre-ensemble.</p>
        </div>
      </section>

      <section className="pricing-section">
        <div className="container">
          <h2>Frais d'Inscription par Catégorie</h2>
        </div>
      </section>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Header />
      <Navbar />

      <main className="app-main">
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Accueil />} />
          <Route path="/inscription" element={<InscriptionForm />} />
          <Route path="/debats" element={<DebatList />} />
          <Route path="/candidats" element={<CandidatList />} />
          <Route path="/candidats/:id" element={<CandidatProfile />} />
          <Route path="/calculateur" element={<SimpleRepartitionCalculator />} />

          {/* Routes utilisateur */}
          <Route path="/classement" element={<ClassementPage />} />
          <Route path="/retrait" element={<RetraitPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />

          {/* Routes Admin */}
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/validation" element={<PaymentValidationPage />} />
          <Route path="/admin/debats" element={<GestionDebatsPage />} />
          <Route path="/admin/nouveau-debat" element={<CreateDebatPage />} />
          <Route path="/connexion" element={<LoginPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;