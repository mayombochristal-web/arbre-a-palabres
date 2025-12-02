import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { GraduationCap, School, BookOpen, Briefcase, Check, Star } from 'lucide-react';
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
      icon: <School size={40} />,
      description: 'Pour les élèves du primaire passionnés par le débat',
      features: ['Initiation au débat', 'Thèmes adaptés', 'Encadrement bienveillant'],
      color: '#FF6B6B',
      gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)'
    },
    {
      name: 'Collège/Lycée',
      ageRange: '13-18 ans',
      price: '1000 FCFA',
      image: '/images/categories/college_lycee.png',
      icon: <BookOpen size={40} />,
      description: 'Pour les collégiens et lycéens qui veulent s\'exprimer',
      features: ['Compétition inter-établissements', 'Sujets d\'actualité', 'Prix attractifs'],
      color: '#4ECDC4',
      gradient: 'linear-gradient(135deg, #4ECDC4 0%, #6EE7E0 100%)',
      popular: true
    },
    {
      name: 'Universitaire',
      ageRange: '19-40 ans',
      price: '2000 FCFA',
      image: '/images/categories/universitaire.png',
      icon: <GraduationCap size={40} />,
      description: 'Pour les étudiants et jeunes professionnels',
      features: ['Niveau élevé', 'Réseautage', 'Visibilité professionnelle'],
      color: '#45B7D1',
      gradient: 'linear-gradient(135deg, #45B7D1 0%, #6CDBEF 100%)'
    },
    {
      name: 'Entrepreneur',
      ageRange: 'Tous âges',
      price: '5000 FCFA',
      image: '/images/categories/entrepreneur.png',
      icon: <Briefcase size={40} />,
      description: 'Pour les entrepreneurs et leaders d\'opinion',
      features: ['Débats stratégiques', 'Opportunités d\'affaires', 'Prestige'],
      color: '#96CEB4',
      gradient: 'linear-gradient(135deg, #96CEB4 0%, #B8E4D0 100%)'
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
              <div
                key={index}
                className={`pricing-card ${cat.popular ? 'popular' : ''}`}
                style={{ '--accent-color': cat.color }}
              >
                {cat.popular && (
                  <div className="popular-badge">
                    <Star size={14} fill="white" /> Populaire
                  </div>
                )}

                <div className="card-image-container" style={{ background: cat.gradient }}>
                  {/* Fallback icon if image fails or while loading */}
                  <div className="card-icon">{cat.icon}</div>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="card-img"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>

                <div className="card-content">
                  <h3 style={{ color: cat.color }}>{cat.name}</h3>
                  <div className="age-badge">{cat.ageRange}</div>

                  <div className="price-tag">
                    <span className="amount">{cat.price}</span>
                  </div>

                  <p className="description">{cat.description}</p>

                  <ul className="features-list">
                    {cat.features.map((feature, idx) => (
                      <li key={idx}>
                        <Check size={16} color={cat.color} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className="btn-join"
                    style={{ background: cat.gradient }}
                    onClick={() => navigate('/inscription')}
                  >
                    Rejoindre
                  </button>
                </div>
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