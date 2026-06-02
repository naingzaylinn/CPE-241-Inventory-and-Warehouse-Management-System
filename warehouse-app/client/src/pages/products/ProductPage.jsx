import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { productsApi } from '../../api/products.api'
import { productTypesApi } from '../../api/productTypes.api'
import { unitsApi } from '../../api/units.api'

export default function ProductPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const isNew = !id || id === 'new'
  const [form, setForm] = useState({ product_name: '', type_id: '', unit_id: '', price: '0', has_bom: false })
  const [lines, setLines] = useState([])
  const [types, setTypes] = useState([])
  const [units, setUnits] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([productTypesApi.list(), unitsApi.list(), productsApi.list()]).then(([t, u, p]) => {
      setTypes(t); setUnits(u); setAllProducts(p)
    })
    
    if (!isNew) {
      productsApi.get(id).then(r => {
        setForm({ product_name: r.product_name, type_id: r.type_id, unit_id: r.unit_id, price: r.price, has_bom: r.has_bom })
        setLines(r.bom_lines || [])
      }).catch(() => nav('/products'))
    }
  }, [id, isNew, nav])

  const addLine = () => setLines([...lines, { material_code: '', quantity_needed: '1' }])
  const removeLine = (i) => setLines(lines.filter((_, idx) => idx !== i))
  const updateLine = (i, field, value) => {
    const updated = [...lines]
    updated[i][field] = value
    if (field === 'material_code') {
      const mat = allProducts.find(p => p.product_code === value)
      if (mat) { updated[i].unit_name = mat.unit_name; updated[i].unit_price = mat.price }
    }
    setLines(updated)
  }

  const save = async () => {
    try {
      setError('')
      const numPrice = parseFloat(form.price)
      if (isNaN(numPrice) || numPrice < 0) {
        setError('Price must be greater than or equal to 0[cite: 251].')
        return
      }

      const payload = { 
        ...form, 
        price: numPrice,
        line_items: form.has_bom ? lines.map(l => ({ 
          material_code: l.material_code, 
          quantity_needed: parseFloat(l.quantity_needed) || 0 
        })) : [] 
      }

      if (form.has_bom && payload.line_items.length === 0) {
        setError('Products with a Bill of Materials require at least 1 item row entry[cite: 19, 260].')
        return
      }

      if (isNew) await productsApi.create(payload)
      else await productsApi.update(id, payload)
      nav('/products')
    } catch (e) {
      const errData = e?.response?.data || e?.data || e
      setError(errData?.field_errors?.[0]?.reason || errData?.message || 'Error saving product')
    }
  }

  const totalBom = lines.reduce((s, l) => {
    const mat = allProducts.find(p => p.product_code === l.material_code)
    return s + (parseFloat(mat?.price || l.unit_price || 0)) * (parseFloat(l.quantity_needed) || 0)
  }, 0)

  return (
    <div>
      <div className="page-header">
        <span className="page-title">{isNew ? 'New Product' : `Edit — ${id}`}</span>
      </div>
      <div style={{ background: 'white', padding: 24, borderRadius: 8 }}>
        {!isNew && (
          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-group"><label>Product Code</label><input value={id} disabled /></div>
          </div>
        )}
        <div className="form-row">
          <div className="form-group">
            <label>Product Name *</label>
            <input value={form.product_name} onChange={e => setForm({ ...form, product_name: e.target.value })} placeholder="e.g. Steel Bolt" />
          </div>
          <div className="form-group">
            <label>Product Type *</label>
            <select value={form.type_id} onChange={e => setForm({ ...form, type_id: e.target.value })}>
              <option value="">— Select —</option>
              {types.map(t => <option key={t.type_id} value={t.type_id}>{t.type_name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row" style={{ marginTop: 12 }}>
          <div className="form-group">
            <label>Unit *</label>
            <select value={form.unit_id} onChange={e => setForm({ ...form, unit_id: e.target.value })}>
              <option value="">— Select —</option>
              {units.map(u => <option key={u.unit_id} value={u.unit_id}>{u.unit_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Price *</label>
            <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} min="0" step="0.01" />
          </div>
          <div className="form-group">
            <label>Has BOM</label>
            <select value={form.has_bom ? 'true' : 'false'} onChange={e => setForm({ ...form, has_bom: e.target.value === 'true' })}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>

        {form.has_bom && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
              <strong style={{ fontSize: 14 }}>Bill of Materials</strong>
              <button type="button" className="btn-primary" onClick={addLine}>+ Add Line</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', background: '#f5f5f5' }}>
                  <th style={{ padding: 8 }}>No</th>
                  <th style={{ padding: 8 }}>Material Code</th>
                  <th style={{ padding: 8 }}>Material Name</th>
                  <th style={{ padding: 8 }}>Qty Needed</th>
                  <th style={{ padding: 8 }}>Unit</th>
                  <th style={{ padding: 8 }}>Unit Price</th>
                  <th style={{ padding: 8 }}>Total Value</th>
                  <th style={{ padding: 8 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => {
                  const mat = allProducts.find(p => p.product_code === l.material_code)
                  const up = parseFloat(mat?.price || l.unit_price || 0)
                  const qty = parseFloat(l.quantity_needed) || 0
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: 8 }}>{i + 1}</td>
                      <td style={{ padding: 8 }}>
                        <select value={l.material_code} onChange={e => updateLine(i, 'material_code', e.target.value)} style={{ width: '100%' }}>
                          <option value="">— Select —</option>
                          {allProducts.filter(p => p.product_code !== id).map(p => (
                            <option key={p.product_code} value={p.product_code}>{p.product_code} ({p.product_name})</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: 8 }} className="text-muted">{mat?.product_name || '—'}</td>
                      <td style={{ padding: 8 }}><input type="number" value={l.quantity_needed} onChange={e => updateLine(i, 'quantity_needed', e.target.value)} style={{ width: 80 }} min="0.001" step="0.001" /></td>
                      <td style={{ padding: 8 }} className="text-muted">{mat?.unit_name || '—'}</td>
                      <td style={{ padding: 8 }} className="text-muted">{up.toFixed(2)}</td>
                      <td style={{ padding: 8 }} className="text-muted">{(up * qty).toFixed(2)}</td>
                      <td style={{ padding: 8 }}><button type="button" className="btn-danger" onClick={() => removeLine(i)}>Del</button></td>
                    </tr>
                  )
                })}
                {!lines.length && <tr><td colSpan={8} style={{ padding: 12, textAlign: 'center' }} className="text-muted">No lines — click + Add Line</td></tr>}
                {lines.length > 0 && (
                  <tr className="row-total" style={{ background: '#fafafa', fontWeight: 'bold' }}>
                    <td colSpan={6} style={{ padding: 8, textAlign: 'right' }}>TOTAL BOM COST</td>
                    <td style={{ padding: 8 }}>{totalBom.toFixed(2)}</td>
                    <td></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {error && <p className="error-text" style={{ color: 'red', marginTop: 12 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn-secondary" onClick={() => nav('/products')}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  )
}
