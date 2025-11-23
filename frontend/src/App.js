import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Common/Header';
import Navbar from './components/Common/Navbar';
import Footer from './components/Common/Footer';
import InscriptionForm from './components/Inscription/InscriptionForm';
import DebatForm from './components/Debat/DebatForm';
import DebatList from './components/Debat/DebatList';
import CandidatList from './components/Candidat/CandidatList';
import CandidatProfile from './components/Candidat/CandidatProfile';
import Classement from './components/Candidat/Classement';
import SimpleRepartitionCalculator from './components/Finance/SimpleRepartitionCalculator';
import TransactionHistory from './components/Finance/TransactionHistory';
import RetraitForm from './components/Finance/RetraitForm';
import AdminPanel from './components/Admin/AdminPanel';
import ValidationPaiement from './components/Admin/ValidationPaiement';
import GestionDebats from './components/Admin/GestionDebats';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('accueil');

  return (
    <div className="App">
      <Header />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="app-main">
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Accueil />} />
          <Route path="/inscription" element={<InscriptionForm />} />
          <Route path="/debats" element={<DebatList />} />
          <Route path="/classement" element={<Classement />} />
          <Route path="/candidats" element={<CandidatList />} />
          <Route path="/candidat/:id" element={<CandidatProfile />} />
          <Route path="/calculateur" element={<SimpleRepartitionCalculator />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/retrait" element={<RetraitForm />} />
          
          {/* Routes admin */}
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/validation" element={<ValidationPaiement />} />
          <Route path="/admin/debats" element={<GestionDebats />} />
          <Route path="/admin/nouveau-debat" element={<DebatForm />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

// Composant Accueil
function Accueil() {
  return (
    <div className="accueil">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Bienvenue à L'Arbre à Palabres</h1>
          <p className="hero-subtitle">
            La plateforme de débats éducatifs qui récompense l'éloquence et le savoir
          </p>
          <div className="hero-stats">
            <div className="stat-card">
              <h3>500+</h3>
              <p>Candidats inscrits</p>
            </div>
            <div className="stat-card">
              <h3>50,000+</h3>
              <p>FCFA distribués</p>
            </div>
            <div className="stat-card">
              <h3>100+</h3>
              <p>Débats organisés</p>
            </div>
          </div>
          <div className="hero-actions">
            <button 
              className="btn-primary large"
              onClick={() => window.location.href = '/inscription'}
            >
              S'inscrire Maintenant
            </button>
            <button 
              className="btn-secondary large"
              onClick={() => window.location.href = '/debats'}
            >
              Voir les Débats
            </button>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2>Comment ça marche ?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>1. Inscription</h3>
              <p>Créez votre profil avec vos documents scolaires et payez les frais d'inscription selon votre catégorie</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>2. Participation</h3>
              <p>Participez à des débats passionnants avec des candidats de votre niveau</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>3. Gains</h3>
              <p>Gagnez 75% de la cagnotte lorsque vous remportez un débat</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>4. Retrait</h3>
              <p>Retirez vos gains facilement via Airtel Money ou autres méthodes</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing-section">
        <div className="container">
          <h2>Frais d'Inscription par Catégorie</h2>
          <div className="pricing-cards">
            <div className="pricing-card">
              <h3>Primaire</h3>
              <div className="price">500 FCFA</div>
              <p>10-12 ans</p>
              <ul>
                <li>Débats adaptés</li>
                <li>Thèmes éducatifs</li>
                <li>Encadrement spécial</li>
              </ul>
            </div>
            <div className="pricing-card featured">
              <h3>Collège/Lycée</h3>
              <div className="price">1,000 FCFA</div>
              <p>13-18 ans</p>
              <ul>
                <li>Débats challenges</li>
                <li>Thèmes actuels</li>
                <li>Prime de performance</li>
              </ul>
            </div>
            <div className="pricing-card">
              <h3>Universitaire</h3>
              <div className="price">2,000 FCFA</div>
              <p>19-40 ans</p>
              <ul>
                <li>Débats experts</li>
                <li>Thèmes complexes</li>
                <li>Trophées exclusifs</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;