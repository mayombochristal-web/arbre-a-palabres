import React from 'react';
import './ErrorBoundary.css';

/**
 * ErrorBoundary Component
 * Capture les erreurs React et affiche une UI de fallback élégante
 * au lieu de faire crasher toute l'application
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        // Met à jour le state pour afficher l'UI de fallback
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log l'erreur pour le monitoring
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo,
            errorCount: this.state.errorCount + 1
        });

        // Si Sentry est configuré, envoyer l'erreur
        if (window.Sentry) {
            window.Sentry.captureException(error, {
                contexts: {
                    react: {
                        componentStack: errorInfo.componentStack
                    }
                }
            });
        }

        // Log dans la console en développement
        if (process.env.NODE_ENV === 'development') {
            console.group('🔴 Error Boundary');
            console.error('Error:', error);
            console.error('Error Info:', errorInfo);
            console.groupEnd();
        }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            const { error, errorInfo, errorCount } = this.state;
            const { fallback, showDetails = process.env.NODE_ENV === 'development' } = this.props;

            // Si un composant de fallback personnalisé est fourni
            if (fallback) {
                return fallback;
            }

            // UI de fallback par défaut
            return (
                <div className="error-boundary">
                    <div className="error-boundary-container">
                        <div className="error-icon">⚠️</div>

                        <h1 className="error-title">Oups ! Quelque chose s'est mal passé</h1>

                        <p className="error-message">
                            Une erreur inattendue s'est produite. Nos équipes ont été notifiées et
                            travaillent à résoudre le problème.
                        </p>

                        <div className="error-actions">
                            <button
                                className="btn-primary"
                                onClick={this.handleReset}
                            >
                                🔄 Réessayer
                            </button>

                            <button
                                className="btn-secondary"
                                onClick={this.handleReload}
                            >
                                🏠 Retour à l'accueil
                            </button>
                        </div>

                        {/* Détails techniques (uniquement en développement) */}
                        {showDetails && error && (
                            <details className="error-details">
                                <summary>Détails techniques (développement uniquement)</summary>

                                <div className="error-stack">
                                    <h3>Message d'erreur:</h3>
                                    <pre>{error.toString()}</pre>

                                    {errorInfo && (
                                        <>
                                            <h3>Stack trace:</h3>
                                            <pre>{errorInfo.componentStack}</pre>
                                        </>
                                    )}

                                    <p className="error-count">
                                        Nombre d'erreurs: {errorCount}
                                    </p>
                                </div>
                            </details>
                        )}

                        {/* Informations d'aide */}
                        <div className="error-help">
                            <p>Si le problème persiste:</p>
                            <ul>
                                <li>Videz le cache de votre navigateur</li>
                                <li>Vérifiez votre connexion internet</li>
                                <li>Contactez le support: <a href="mailto:mayombochristal@gmail.com">mayombochristal@gmail.com</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
