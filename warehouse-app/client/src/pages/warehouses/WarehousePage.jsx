import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { warehousesApi } from '../../api/warehouses.api'

export default function WarehousePage() {
  const { id } = useParams()
  const nav = useNavigate()
  const isNew = !id || id === 'new'
  const [form, setForm] = useState({ warehouse_id: '', warehouse_name: '', location: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isNew) warehousesApi.get(id).then(r => setForm({ ...r, location: r.location || '' })).catch(() => nav('/warehouses'))
  }, [id, isNew, nav])

  const save = async () => {
    try {
      setError('')
      if (isNew) await warehousesApi.create(form)
      else await warehousesApi.update(id, { warehouse_name: form.warehouse_name, location: form.location })
      nav('/warehouses')
    } catch (e) {
      const errData = e?.response?.data || e?.data || e
      setError(errData?.field_errors?.[0]?.reason || errData?.message || 'Error saving warehouse')
    }
  }

  return (
    <div>
      <div className="page-header">
        <span className="page-title">{isNew ? 'New Warehouse' : `Edit — ${id}`}</span>
      </div>
      <div style={{ background: 'white', padding: 24, borderRadius: 8, maxWidth: 560 }}>
        <div className="form-row">
          <div className="form-group">
            <label>Warehouse ID *</label>
            <input value={form.warehouse_id} disabled={!isNew}
              onChange={e => setForm({ ...form, warehouse_id: e.target.value })} placeholder="e.g. WH-01" />
          </div>
          <div className="form-group">
            <label>Warehouse Name *</label>
            <input value={form.warehouse_name}
              onChange={e => setForm({ ...form, warehouse_name: e.target.value })} placeholder="e.g. Main Warehouse" />
          </div>
        </div>
        <div className="form-row" style={{ marginTop: 12 }}>
          <div className="form-group">
            <label>Location</label>
            <input value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Bangkok Zone A" />
          </div>
        </div>
        {error && <p className="error-text" style={{ color: 'red', marginTop: 12 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn-secondary" onClick={() => nav('/warehouses')}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  )
}
