import React from 'react';

const RetraitPage = () => {
    return (
        <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <h1 style={{ color: '#2d5016', marginBottom: '20px' }}>💰 Demander un Retrait</h1>
            <div style={{
                padding: '60px 20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '10px',
                maxWidth: '600px',
                margin: '0 auto'
            }}>
                <p style={{ fontSize: '18px', color: '#666', marginBottom: '15px' }}>
                    La fonctionnalité de retrait sera bientôt disponible.
                </p>
                <p style={{ fontSize: '14px', color: '#999' }}>
                    Vous pourrez bientôt demander le retrait de vos gains.
                </p>
            </div>
        </div>
    );
};

export default RetraitPage;
