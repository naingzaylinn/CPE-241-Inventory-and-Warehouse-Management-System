import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { customersApi } from '../../api/customers.api'

export default function CustomerPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const isNew = !id || id === 'new'
  const [form, setForm] = useState({ customer_id: '', customer_name: '', contact_info: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isNew) customersApi.get(id).then(r => setForm({ ...r, contact_info: r.contact_info || '' })).catch(() => nav('/customers'))
  }, [id, isNew, nav])

  const save = async () => {
    try {
      setError('')
      if (isNew) await customersApi.create(form)
      else await customersApi.update(id, { customer_name: form.customer_name, contact_info: form.contact_info })
      nav('/customers')
    } catch (e) {
      const errData = e?.response?.data || e?.data || e
      setError(errData?.field_errors?.[0]?.reason || errData?.message || 'Error saving customer')
    }
  }

  return (
    <div>
      <div className="page-header">
        <span className="page-title">{isNew ? 'New Customer' : `Edit — ${id}`}</span>
      </div>
      <div style={{ background: 'white', padding: 24, borderRadius: 8, maxWidth: 560 }}>
        <div className="form-row">
          <div className="form-group">
            <label>Customer ID *</label>
            <input value={form.customer_id} disabled={!isNew}
              onChange={e => setForm({ ...form, customer_id: e.target.value })} placeholder="e.g. CUS-01" />
          </div>
          <div className="form-group">
            <label>Customer Name *</label>
            <input value={form.customer_name}
              onChange={e => setForm({ ...form, customer_name: e.target.value })} placeholder="e.g. ABC Trading Co." />
          </div>
        </div>
        <div className="form-row" style={{ marginTop: 12 }}>
          <div className="form-group">
            <label>Contact Info</label>
            <input value={form.contact_info}
              onChange={e => setForm({ ...form, contact_info: e.target.value })} placeholder="e.g. 02-100-1111" />
          </div>
        </div>
        {error && <p className="error-text" style={{ color: 'red', marginTop: 12 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn-secondary" onClick={() => nav('/customers')}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  )
}
