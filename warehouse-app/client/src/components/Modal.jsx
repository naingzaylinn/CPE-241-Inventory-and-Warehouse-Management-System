export function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ minWidth: '340px' }}>
        <p style={{ marginBottom: '20px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

export function AlertModal({ message, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ minWidth: '340px' }}>
        <p style={{ marginBottom: '20px' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  )
}
