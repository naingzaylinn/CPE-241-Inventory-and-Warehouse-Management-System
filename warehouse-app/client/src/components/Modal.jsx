export function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <p className="modal-title">Confirm Action</p>
        <p style={{ marginBottom: 20, color: 'var(--text-muted)', fontSize: 14 }}>{message}</p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Confirm Delete</button>
        </div>
      </div>
    </div>
  )
}

export function AlertModal({ message, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <p className="modal-title">Notice</p>
        <p style={{ marginBottom: 20, color: 'var(--text-muted)', fontSize: 14 }}>{message}</p>
        <div className="modal-actions">
          <button className="btn-primary" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  )
}
