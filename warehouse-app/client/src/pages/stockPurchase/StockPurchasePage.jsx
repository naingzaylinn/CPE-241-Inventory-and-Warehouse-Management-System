import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { stockPurchaseApi } from '../../api/stockPurchase.api'
import { warehousesApi } from '../../api/warehouses.api'
import { suppliersApi } from '../../api/suppliers.api'
import { productsApi } from '../../api/products.api'
import { formatDate, formatNumber } from '../../utils'

export default function StockPurchasePage() {
  const { id } = useParams()
  const nav = useNavigate()
  
  // FIX: Safe route parameter evaluation interceptor
  const isNew = !id || id === 'new'
  
  const [form, setForm] = useState({ stock_date: new Date().toISOString().split('T')[0], warehouse_id: '', reason: 'Purchase', supplier_id: '' })
  const [lines, setLines] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([warehousesApi.list(), suppliersApi.list(), productsApi.list()]).then(([w, s, p]) => {
      setWarehouses(w); setSuppliers(s); setProducts(p)
    })
    if (!isNew) {
      stockPurchaseApi.get(id).then(r => {
        setForm({ stock_date: formatDate(r.stock_date), warehouse_id: r.warehouse_id, reason: r.reason, supplier_id: r.supplier_id })
        setLines(r.line_items || [])
      }).catch(() => nav('/stock/purchase'))
    }
  }, [id, isNew, nav])

  const addLine = () => setLines([...lines, { product_code: '', ref_po_no: '', quantity_in: '1', quantity_out: '1', unit_price: '0' }])
  const removeLine = (i) => setLines(lines.filter((_, idx) => idx !== i))
  const updateLine = (i, field, value) => {
    const updated = [...lines]
    updated[i][field] = value
    if (field === 'product_code') {
      const prod = products.find(p => p.product_code === value)
      if (prod) { updated[i].unit_name = prod.unit_name; updated[i].unit_price = prod.price }
    }
    setLines(updated)
  }

  const save = async () => {
    try {
      setError('')
      if (lines.length === 0) {
        setError('Transaction documents require at least 1 line item entry.')
        return
      }

      const payload = { 
        ...form,
        line_items: lines.map(l => ({
          product_code: l.product_code,
          ref_po_no: l.ref_po_no || null,
          quantity_in: form.reason === 'Purchase' ? parseFloat(l.quantity_in) || 0 : null,
          quantity_out: form.reason === 'Purchase Return' ? parseFloat(l.quantity_out) || 0 : null,
          unit_price: parseFloat(l.unit_price) || 0
        }))
      }
      await stockPurchaseApi.create(payload)
      nav('/stock/purchase')
    } catch (e) {
      const errData = e?.response?.data || e?.data || e
      setError(errData?.field_errors?.[0]?.reason || errData?.message || 'Error processing purchase save')
    }
  }

  const total = lines.reduce((s, l) => {
    const qty = form.reason === 'Purchase' ? parseFloat(l.quantity_in) || 0 : parseFloat(l.quantity_out) || 0
    return s + qty * (parseFloat(l.unit_price) || 0)
  }, 0)

  return (
    <div>
      <div className="page-header">
        <span className="page-title">{isNew ? 'New Stock Purchase' : `Stock Record — ${id}`}</span>
        {!isNew && <button className="btn-secondary" onClick={() => nav('/stock/purchase')}>Back</button>}
      </div>
      <div style={{ background: 'white', padding: 24, borderRadius: 8 }}>
        {!isNew && <div className="form-row"><div className="form-group"><label>Stock No</label><input value={id} disabled /></div></div>}
        <div className="form-row">
          <div className="form-group">
            <label>Stock Date *</label>
            <input type="date" value={form.stock_date} disabled={!isNew} onChange={e => setForm({ ...form, stock_date: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Reason *</label>
            <select value={form.reason} disabled={!isNew} onChange={e => setForm({ ...form, reason: e.target.value })}>
              <option value="Purchase">Purchase</option>
              <option value="Purchase Return">Purchase Return</option>
            </select>
          </div>
        </div>
        <div className="form-row" style={{ marginTop: 12 }}>
          <div className="form-group">
            <label>Warehouse *</label>
            <select value={form.warehouse_id} disabled={!isNew} onChange={e => setForm({ ...form, warehouse_id: e.target.value })}>
              <option value="">— Select —</option>
              {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_id} — {w.warehouse_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Supplier *</label>
            <select value={form.supplier_id} disabled={!isNew} onChange={e => setForm({ ...form, supplier_id: e.target.value })}>
              <option value="">— Select —</option>
              {suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_id} — {s.supplier_name}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
            <strong style={{ fontSize: 14 }}>Line Items</strong>
            {isNew && <button type="button" className="btn-primary" onClick={addLine}>+ Add Row</button>}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: '#f5f5f5' }}>
                <th style={{ padding: 8 }}>No</th>
                <th style={{ padding: 8 }}>Product Code</th>
                <th style={{ padding: 8 }}>Product Name</th>
                <th style={{ padding: 8 }}>Ref PO No</th>
                <th style={{ padding: 8 }}>{form.reason === 'Purchase' ? 'Qty IN *' : 'Qty OUT *'}</th>
                <th style={{ padding: 8 }}>Unit</th>
                <th style={{ padding: 8 }}>Unit Price</th>
                <th style={{ padding: 8 }}>Extended Price</th>
                {isNew && <th style={{ padding: 8 }}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => {
                const prod = products.find(p => p.product_code === l.product_code)
                const qty = form.reason === 'Purchase' ? parseFloat(l.quantity_in) || 0 : parseFloat(l.quantity_out) || 0
                const up = parseFloat(l.unit_price) || 0
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: 8 }}>{i + 1}</td>
                    <td style={{ padding: 8 }}>{isNew
                      ? <select value={l.product_code} onChange={e => updateLine(i, 'product_code', e.target.value)} style={{ width: 120 }}>
                          <option value="">— Select —</option>
                          {products.map(p => <option key={p.product_code} value={p.product_code}>{p.product_code} ({p.product_name})</option>)}
                        </select>
                      : l.product_code}
                    </td>
                    <td style={{ padding: 8 }} className="text-muted">{prod?.product_name || l.product_name || '—'}</td>
                    <td style={{ padding: 8 }}>{isNew
                      ? <input value={l.ref_po_no || ''} onChange={e => updateLine(i, 'ref_po_no', e.target.value)} style={{ width: 90 }} placeholder="PO-001" />
                      : l.ref_po_no || '—'}
                    </td>
                    <td style={{ padding: 8 }}>{isNew
                      ? <input type="number" value={form.reason === 'Purchase' ? l.quantity_in : l.quantity_out}
                          onChange={e => updateLine(i, form.reason === 'Purchase' ? 'quantity_in' : 'quantity_out', e.target.value)}
                          style={{ width: 80 }} min="0.001" step="0.001" />
                      : formatNumber(form.reason === 'Purchase' ? l.quantity_in : l.quantity_out, 3)}
                    </td>
                    <td style={{ padding: 8 }} className="text-muted">{prod?.unit_name || l.unit_name || '—'}</td>
                    <td style={{ padding: 8 }}>{isNew
                      ? <input type="number" value={l.unit_price} onChange={e => updateLine(i, 'unit_price', e.target.value)} style={{ width: 80 }} min="0" step="0.01" />
                      : formatNumber(l.unit_price)}
                    </td>
                    <td style={{ padding: 8 }} className="text-muted">{(qty * up).toFixed(2)}</td>
                    {isNew && <td style={{ padding: 8 }}><button type="button" className="btn-danger" onClick={() => removeLine(i)}>Del</button></td>}
                  </tr>
                )
              })}
              {!lines.length && <tr><td colSpan={isNew ? 9 : 8} style={{ padding: 12, textAlign: 'center' }} className="text-center text-muted">No line rows generated — click + Add Row</td></tr>}
              {lines.length > 0 && (
                <tr className="row-total" style={{ background: '#fafafa', fontWeight: 'bold' }}>
                  <td colSpan={isNew ? 7 : 6} style={{ padding: 8, textAlign: 'right' }}>TOTAL VALUE</td>
                  <td style={{ padding: 8 }}>{total.toFixed(2)}</td>
                  {isNew && <td></td>}
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {error && <p className="error-text" style={{ color: 'red', marginTop: 12 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button type="button" className="btn-secondary" onClick={() => nav('/stock/purchase')}>{isNew ? 'Cancel' : 'Close'}</button>
          {isNew && <button type="button" className="btn-primary" onClick={save}>Save</button>}
        </div>
      </div>
    </div>
  )
}
