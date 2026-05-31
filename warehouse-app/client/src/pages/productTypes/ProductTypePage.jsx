import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { productTypesApi } from '../../api/productTypes.api'

export default function ProductTypePage() {
  const { id } = useParams()
  const nav = useNavigate()
  const isNew = id === 'new'
  const [form, setForm] = useState({ type_id: '', type_name: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isNew) productTypesApi.get(id).then(setForm).catch(() => nav('/product-types'))
  }, [id])

  const save = async () => {
    try {
      if (isNew) await productTypesApi.create(form)
      else await productTypesApi.update(id, { type_name: form.type_name })
      nav('/product-types')
    } catch (e) {
      setError(e.data?.field_errors?.[0]?.reason || e.data?.message || 'Error')
    }
  }

  return (
    <div>
      <div className="page-header">
        <span className="page-title">{isNew ? 'New Product Type' : `Edit — ${id}`}</span>
      </div>
      <div style={{ background: 'white', padding: 24, borderRadius: 8, maxWidth: 480 }}>
        <div className="form-row">
          <div className="form-group">
            <label>Type ID *</label>
            <input value={form.type_id} disabled={!isNew}
              onChange={e => setForm({ ...form, type_id: e.target.value })} placeholder="e.g. T01" />
          </div>
          <div className="form-group">
            <label>Type Name *</label>
            <input value={form.type_name}
              onChange={e => setForm({ ...form, type_name: e.target.value })} placeholder="e.g. Raw Material" />
          </div>
        </div>
        {error && <p className="error-text">{error}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={() => nav('/product-types')}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  )
}
