import React from 'react';

const ClassementPage = () => {
    return (
        <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <h1 style={{ color: '#2d5016', marginBottom: '20px' }}>🏆 Classement Général</h1>
            <div style={{
                padding: '60px 20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '10px',
                maxWidth: '600px',
                margin: '0 auto'
            }}>
                <p style={{ fontSize: '18px', color: '#666', marginBottom: '15px' }}>
                    Le classement général des meilleurs candidats sera bientôt disponible.
                </p>
                <p style={{ fontSize: '14px', color: '#999' }}>
                    Cette fonctionnalité est en cours de développement.
                </p>
            </div>
        </div>
    );
};

export default ClassementPage;
