import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { unitsApi } from '../../api/units.api'

export default function UnitPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const isNew = !id || id === 'new'
  const [form, setForm] = useState({ unit_id: '', unit_name: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isNew) unitsApi.get(id).then(setForm).catch(() => nav('/units'))
  }, [id, isNew, nav])

  const save = async () => {
    try {
      setError('')
      if (isNew) await unitsApi.create(form)
      else await unitsApi.update(id, { unit_name: form.unit_name })
      nav('/units')
    } catch (e) {
      const errData = e?.response?.data || e?.data || e
      setError(errData?.field_errors?.[0]?.reason || errData?.message || 'Error saving unit')
    }
  }

  return (
    <div>
      <div className="page-header">
        <span className="page-title">{isNew ? 'New Unit' : `Edit — ${id}`}</span>
      </div>
      <div style={{ background: 'white', padding: 24, borderRadius: 8, maxWidth: 480 }}>
        <div className="form-row">
          <div className="form-group">
            <label>Unit ID *</label>
            <input value={form.unit_id} disabled={!isNew}
              onChange={e => setForm({ ...form, unit_id: e.target.value })} placeholder="e.g. U01" />
          </div>
          <div className="form-group">
            <label>Unit Name *</label>
            <input value={form.unit_name}
              onChange={e => setForm({ ...form, unit_name: e.target.value })} placeholder="e.g. Piece" />
          </div>
        </div>
        {error && <p className="error-text" style={{ color: 'red', marginTop: 12 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn-secondary" onClick={() => nav('/units')}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  )
}
