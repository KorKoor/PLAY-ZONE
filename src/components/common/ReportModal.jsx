// src/components/common/ReportModal.jsx
import React, { useState } from 'react';
import { 
    FaFlag, 
    FaTimes, 
    FaExclamationTriangle,
    FaInfoCircle,
    FaSpinner,
    FaCheckCircle
} from 'react-icons/fa';
import './ReportModal.css';
import { useReports } from '../../hooks/useReports';

const ReportModal = ({ 
    isOpen, 
    onClose, 
    contentId, 
    contentType, 
    contentTitle,
    reportedUser,
    reportedUserId,
    onReportSubmitted 
}) => {
    const { 
        submitReport, 
        isSubmittingReport, 
        reportError, 
        reportSuccess, 
        getReportReasons,
        clearReportState 
    } = useReports();

    const [reason, setReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [description, setDescription] = useState('');

    const reportReasons = getReportReasons();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!reason || (reason === 'other' && !customReason.trim())) {
            return;
        }

        const reportData = {
            contentId,
            contentType,
            reason: reason === 'other' ? customReason : reason,
            description: description.trim(),
            reportedUserId: reportedUserId
        };

        const success = await submitReport(reportData);
        
        if (success) {
            // Notificar al componente padre
            if (onReportSubmitted) {
                onReportSubmitted(reportData);
            }

            // Cerrar modal después de 2 segundos
            setTimeout(() => {
                handleClose();
            }, 2000);
        }
    };

    const handleClose = () => {
        if (isSubmittingReport) return; // Prevenir cierre durante envío
        
        setReason('');
        setCustomReason('');
        setDescription('');
        clearReportState();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="report-modal-overlay" onClick={handleClose}>
            <div className="report-modal" onClick={(e) => e.stopPropagation()}>
                <div className="report-modal-header">
                    <h2>
                        <FaFlag /> Reportar Contenido
                    </h2>
                    <button 
                        className="close-btn" 
                        onClick={handleClose}
                        disabled={isSubmittingReport}
                    >
                        <FaTimes />
                    </button>
                </div>

                {reportSuccess ? (
                    <div className="report-success">
                        <FaCheckCircle className="success-icon" />
                        <h3>¡Reporte Enviado!</h3>
                        <p>Gracias por ayudarnos a mantener la comunidad segura.</p>
                        <p>Revisaremos tu reporte y tomaremos las acciones necesarias.</p>
                    </div>
                ) : (
                    <>
                        <div className="report-modal-body">
                            <div className="content-info">
                                <p><strong>Reportando:</strong> {contentType === 'post' ? 'Publicación' : 'Guía'}</p>
                                {contentTitle && (
                                    <p className="content-title">"{contentTitle}"</p>
                                )}
                                {reportedUser && (
                                    <p><strong>Usuario:</strong> {reportedUser}</p>
                                )}
                            </div>

                            {reportError && (
                                <div className="error-message" style={{
                                    background: reportError.includes('desarrollo') ? '#fef3c7' : '#fee2e2',
                                    border: `1px solid ${reportError.includes('desarrollo') ? '#fed7aa' : '#fecaca'}`,
                                    color: reportError.includes('desarrollo') ? '#92400e' : '#dc2626',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '8px'
                                }}>
                                    {reportError.includes('desarrollo') ? (
                                        <FaInfoCircle style={{ marginTop: '2px', flexShrink: 0 }} />
                                    ) : (
                                        <FaExclamationTriangle style={{ marginTop: '2px', flexShrink: 0 }} />
                                    )}
                                    <span>{reportError}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="report-form">
                                <div className="form-group">
                                    <label htmlFor="reason">
                                        <FaExclamationTriangle /> ¿Cuál es el problema?
                                    </label>
                                    <select
                                        id="reason"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        required
                                        disabled={isSubmittingReport}
                                    >
                                        <option value="">Selecciona un motivo</option>
                                        {reportReasons.map(reasonOption => (
                                            <option key={reasonOption.value} value={reasonOption.value}>
                                                {reasonOption.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {reason === 'other' && (
                                    <div className="form-group">
                                        <label htmlFor="customReason">Especifica el motivo:</label>
                                        <input
                                            type="text"
                                            id="customReason"
                                            value={customReason}
                                            onChange={(e) => setCustomReason(e.target.value)}
                                            placeholder="Describe brevemente el problema"
                                            maxLength={100}
                                            required
                                            disabled={isSubmittingReport}
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label htmlFor="description">
                                        Detalles adicionales (opcional):
                                    </label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Proporciona más detalles sobre el problema si es necesario"
                                        rows={4}
                                        maxLength={500}
                                        disabled={isSubmittingReport}
                                    />
                                    <div className="char-count">
                                        {description.length}/500 caracteres
                                    </div>
                                </div>

                                <div className="report-warning">
                                    <FaExclamationTriangle />
                                    <span>
                                        Los reportes falsos pueden resultar en acciones contra tu cuenta. 
                                        Solo reporta contenido que viole nuestras normas de la comunidad.
                                    </span>
                                </div>
                            </form>
                        </div>

                        <div className="report-modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={handleClose}
                                disabled={isSubmittingReport}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-danger"
                                onClick={handleSubmit}
                                disabled={isSubmittingReport || !reason || (reason === 'other' && !customReason.trim())}
                            >
                                {isSubmittingReport ? (
                                    <>
                                        <FaSpinner className="spinner" /> Enviando...
                                    </>
                                ) : (
                                    <>
                                        <FaFlag /> Enviar Reporte
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportModal;