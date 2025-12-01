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

// Resource pages
import EducationPage from './components/Resources/EducationPage';
import RewardsPage from './components/Resources/RewardsPage';
import CulturePage from './components/Resources/CulturePage';
import CompetitionPage from './components/Resources/CompetitionPage';

import './App.css';

// Page d'accueil améliorée
function Accueil() {
  const navigate = useNavigate();

  const categories = [
    {
      name: 'Primaire',
      ageRange: '10-12 ans',
      price: '500 FCFA',
      image: '/images/categories/primaire.png',
      description: 'Pour les élèves du primaire passionnés par le débat',
      color: '#FF6B6B'
    },
    {
      name: 'Collège/Lycée',
      ageRange: '13-18 ans',
      price: '1000 FCFA',
      image: '/images/categories/college_lycee.png',
      description: 'Pour les collégiens et lycéens qui veulent s\'exprimer',
      color: '#4ECDC4'
    },
    {
      name: 'Universitaire',
      ageRange: '19-40 ans',
      price: '2000 FCFA',
      image: '/images/categories/universitaire.png',
      description: 'Pour les étudiants et jeunes professionnels',
      color: '#45B7D1'
    },
    {
      name: 'Entrepreneur',
      ageRange: 'Tous âges',
      price: '5000 FCFA',
      image: '/images/categories/entrepreneur.png',
      description: 'Pour les entrepreneurs et leaders d\'opinion',
      color: '#96CEB4'
    }
  ];

  return (
    <div className="accueil-page">
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">Défiez vos idées, Gagnez de l'argent.</h1>
          <p className="hero-subtitle">
            La plateforme éducative de débats qui récompense l'éloquence et le savoir de la jeunesse gabonaise.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/inscription')}>
              Je m'inscris maintenant
            </button>
            <button className="btn-secondary" onClick={() => navigate('/debats')}>
              Voir les débats en cours
            </button>
          </div>
        </div>
      </section>

      <section className="why-section">
        <div className="container">
          <h2>Pourquoi L'Arbre à Palabres ?</h2>
          <p className="subtitle">Le dialogue, au cœur du vivre-ensemble.</p>

          <div className="why-grid">
            <div className="why-card" onClick={() => navigate('/ressources/education')} style={{ cursor: 'pointer' }}>
              <div className="why-icon">🎓</div>
              <h3>Éducation</h3>
              <p>Développez vos compétences en argumentation et expression orale</p>
            </div>
            <div className="why-card" onClick={() => navigate('/ressources/recompenses')} style={{ cursor: 'pointer' }}>
              <div className="why-icon">💰</div>
              <h3>Récompenses</h3>
              <p>Gagnez de l'argent en participant aux débats et en remportant des victoires</p>
            </div>
            <div className="why-card" onClick={() => navigate('/ressources/culture')} style={{ cursor: 'pointer' }}>
              <div className="why-icon">🌍</div>
              <h3>Culture</h3>
              <p>Valorisez la tradition africaine du dialogue sous l'arbre à palabres</p>
            </div>
            <div className="why-card" onClick={() => navigate('/ressources/competition')} style={{ cursor: 'pointer' }}>
              <div className="why-icon">🏆</div>
              <h3>Compétition</h3>
              <p>Affrontez les meilleurs orateurs et grimpez dans le classement</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing-section">
        <div className="container">
          <h2>Frais d'Inscription par Catégorie</h2>
          <p className="subtitle">Choisissez votre catégorie et commencez à débattre</p>

          <div className="pricing-grid">
            {categories.map((cat, index) => (
              <div key={index} className="pricing-card" style={{ borderTopColor: cat.color }}>
                <div className="pricing-image">
                  <img src={cat.image} alt={cat.name} />
                </div>
                <h3>{cat.name}</h3>
                <div className="age-range">{cat.ageRange}</div>
                <div className="price">{cat.price}</div>
                <p className="description">{cat.description}</p>
                <button
                  className="btn-join"
                  style={{ backgroundColor: cat.color }}
                  onClick={() => navigate('/inscription')}
                >
                  Rejoindre
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Prêt à relever le défi ?</h2>
          <p>Inscrivez-vous maintenant et participez à votre premier débat</p>
          <button className="btn-cta" onClick={() => navigate('/inscription')}>
            Commencer l'aventure
          </button>
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

          {/* Routes ressources */}
          <Route path="/ressources/education" element={<EducationPage />} />
          <Route path="/ressources/recompenses" element={<RewardsPage />} />
          <Route path="/ressources/culture" element={<CulturePage />} />
          <Route path="/ressources/competition" element={<CompetitionPage />} />

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