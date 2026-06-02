import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { suppliersApi } from '../../api/suppliers.api'

export default function SupplierPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const isNew = !id || id === 'new'
  const [form, setForm] = useState({ supplier_id: '', supplier_name: '', contact_info: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isNew) suppliersApi.get(id).then(r => setForm({ ...r, contact_info: r.contact_info || '' })).catch(() => nav('/suppliers'))
  }, [id, isNew, nav])

  const save = async () => {
    try {
      setError('')
      if (isNew) await suppliersApi.create(form)
      else await suppliersApi.update(id, { supplier_name: form.supplier_name, contact_info: form.contact_info })
      nav('/suppliers')
    } catch (e) {
      const errData = e?.response?.data || e?.data || e
      setError(errData?.field_errors?.[0]?.reason || errData?.message || 'Error saving supplier')
    }
  }

  return (
    <div>
      <div className="page-header">
        <span className="page-title">{isNew ? 'New Supplier' : `Edit — ${id}`}</span>
      </div>
      <div style={{ background: 'white', padding: 24, borderRadius: 8, maxWidth: 560 }}>
        <div className="form-row">
          <div className="form-group">
            <label>Supplier ID *</label>
            <input value={form.supplier_id} disabled={!isNew}
              onChange={e => setForm({ ...form, supplier_id: e.target.value })} placeholder="e.g. SUP-01" />
          </div>
          <div className="form-group">
            <label>Supplier Name *</label>
            <input value={form.supplier_name}
              onChange={e => setForm({ ...form, supplier_name: e.target.value })} placeholder="e.g. Bangkok Steel Co." />
          </div>
        </div>
        <div className="form-row" style={{ marginTop: 12 }}>
          <div className="form-group">
            <label>Contact Info</label>
            <input value={form.contact_info}
              onChange={e => setForm({ ...form, contact_info: e.target.value })} placeholder="e.g. 02-111-2233" />
          </div>
        </div>
        {error && <p className="error-text" style={{ color: 'red', marginTop: 12 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn-secondary" onClick={() => nav('/suppliers')}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  )
}
