import React, { useState } from 'react';

const PaymentValidationPage = () => {
    // Mock data - replace with actual API call
    const [payments, setPayments] = useState([
        {
            id: 1,
            candidateName: 'Grace Mbina',
            category: 'Primaire',
            amount: 500,
            phoneNumber: '+241 77 12 34 56',
            proofUrl: null,
            status: 'pending',
            date: '2024-11-29'
        },
        {
            id: 2,
            candidateName: 'Sarah Obiang',
            category: 'Collège',
            amount: 1000,
            phoneNumber: '+241 77 98 76 54',
            proofUrl: null,
            status: 'pending',
            date: '2024-11-29'
        },
        {
            id: 3,
            candidateName: 'Christelle Mboumba',
            category: 'Universitaire',
            amount: 2000,
            phoneNumber: '+241 77 55 44 33',
            proofUrl: null,
            status: 'pending',
            date: '2024-11-28'
        }
    ]);

    const handleValidate = (paymentId) => {
        setPayments(payments.map(p =>
            p.id === paymentId ? { ...p, status: 'approved' } : p
        ));
        alert('Paiement validé avec succès !');
    };

    const handleReject = (paymentId) => {
        if (window.confirm('Êtes-vous sûr de vouloir rejeter ce paiement ?')) {
            setPayments(payments.map(p =>
                p.id === paymentId ? { ...p, status: 'rejected' } : p
            ));
            alert('Paiement rejeté.');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: { backgroundColor: '#fff3cd', color: '#856404', text: '⏳ En attente' },
            approved: { backgroundColor: '#d4edda', color: '#155724', text: '✅ Validé' },
            rejected: { backgroundColor: '#f8d7da', color: '#721c24', text: '❌ Rejeté' }
        };
        const style = styles[status] || styles.pending;
        return (
            <span style={{
                padding: '5px 12px',
                borderRadius: '15px',
                fontSize: '14px',
                fontWeight: 'bold',
                ...style
            }}>
                {style.text}
            </span>
        );
    };

    const pendingPayments = payments.filter(p => p.status === 'pending');
    const processedPayments = payments.filter(p => p.status !== 'pending');

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ color: '#2d5016', marginBottom: '10px' }}>💳 Validation des Paiements</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Vérifiez et approuvez les paiements effectués via Airtel Money au <strong>+241 77 76 54 96</strong>
            </p>

            {/* Paiements en attente */}
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ color: '#2d5016', marginBottom: '20px' }}>
                    ⏳ Paiements en Attente ({pendingPayments.length})
                </h2>

                {pendingPayments.length === 0 ? (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '10px',
                        color: '#666'
                    }}>
                        Aucun paiement en attente de validation
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {pendingPayments.map(payment => (
                            <div key={payment.id} style={{
                                backgroundColor: '#fff',
                                padding: '25px',
                                borderRadius: '10px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                border: '2px solid #ffc107'
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '20px', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '18px' }}>
                                            {payment.candidateName}
                                        </p>
                                        <p style={{ margin: 0, color: '#666' }}>
                                            {payment.category} • {payment.date}
                                        </p>
                                    </div>

                                    <div>
                                        <p style={{ margin: '0 0 5px 0', color: '#666' }}>Montant</p>
                                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '20px', color: '#2d5016' }}>
                                            {payment.amount} FCFA
                                        </p>
                                    </div>

                                    <div>
                                        <p style={{ margin: '0 0 5px 0', color: '#666' }}>Téléphone</p>
                                        <p style={{ margin: 0, fontWeight: 'bold' }}>
                                            {payment.phoneNumber}
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => handleValidate(payment.id)}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: '#28a745',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '5px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            ✅ Valider
                                        </button>
                                        <button
                                            onClick={() => handleReject(payment.id)}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: '#dc3545',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '5px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            ❌ Rejeter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Historique des paiements */}
            <div>
                <h2 style={{ color: '#2d5016', marginBottom: '20px' }}>
                    📜 Historique ({processedPayments.length})
                </h2>

                {processedPayments.length === 0 ? (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '10px',
                        color: '#666'
                    }}>
                        Aucun paiement traité
                    </div>
                ) : (
                    <div style={{ backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Candidat</th>
                                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Catégorie</th>
                                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Montant</th>
                                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Téléphone</th>
                                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Date</th>
                                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processedPayments.map(payment => (
                                    <tr key={payment.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>{payment.candidateName}</td>
                                        <td style={{ padding: '15px' }}>{payment.category}</td>
                                        <td style={{ padding: '15px', fontWeight: 'bold', color: '#2d5016' }}>{payment.amount} FCFA</td>
                                        <td style={{ padding: '15px' }}>{payment.phoneNumber}</td>
                                        <td style={{ padding: '15px' }}>{payment.date}</td>
                                        <td style={{ padding: '15px' }}>{getStatusBadge(payment.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Info box */}
            <div style={{
                marginTop: '40px',
                padding: '20px',
                backgroundColor: '#e7f3ff',
                borderRadius: '10px',
                border: '1px solid #b3d9ff'
            }}>
                <h3 style={{ marginTop: 0, color: '#2d5016' }}>ℹ️ Informations Importantes</h3>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>Vérifiez toujours le numéro de téléphone et le montant avant de valider</li>
                    <li>Les paiements sont effectués exclusivement via <strong>Airtel Money</strong></li>
                    <li>Numéro de réception : <strong>+241 77 76 54 96</strong></li>
                    <li>En cas de doute, contactez le candidat pour confirmation</li>
                </ul>
            </div>
        </div>
    );
};

export default PaymentValidationPage;
