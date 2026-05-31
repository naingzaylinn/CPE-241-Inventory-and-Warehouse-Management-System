import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { stockSalesApi } from '../../api/stockSales.api'
import { warehousesApi } from '../../api/warehouses.api'
import { customersApi } from '../../api/customers.api'
import { productsApi } from '../../api/products.api'
import { formatDate, formatNumber } from '../../utils'

export default function StockSalesPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const isNew = id === 'new'
  const [form, setForm] = useState({ stock_date: new Date().toISOString().split('T')[0], warehouse_id: '', reason: 'Sales', customer_id: '' })
  const [lines, setLines] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([warehousesApi.list(), customersApi.list(), productsApi.list()]).then(([w, c, p]) => {
      setWarehouses(w); setCustomers(c); setProducts(p)
    })
    if (!isNew) {
      stockSalesApi.get(id).then(r => {
        setForm({ stock_date: formatDate(r.stock_date), warehouse_id: r.warehouse_id, reason: r.reason, customer_id: r.customer_id })
        setLines(r.line_items)
      }).catch(() => nav('/stock/sales'))
    }
  }, [id])

  const addLine = () => setLines([...lines, { product_code: '', ref_so_no: '', quantity_out: '', quantity_in: '', unit_price: '' }])
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
      const payload = { ...form,
        line_items: lines.map(l => ({
          product_code: l.product_code,
          ref_so_no: l.ref_so_no || null,
          quantity_out: form.reason === 'Sales' ? parseFloat(l.quantity_out) : null,
          quantity_in: form.reason === 'Sales Return' ? parseFloat(l.quantity_in) : null,
          unit_price: parseFloat(l.unit_price)
        }))
      }
      await stockSalesApi.create(payload)
      nav('/stock/sales')
    } catch (e) {
      setError(e.data?.field_errors?.[0]?.reason || e.data?.message || 'Error')
    }
  }

  const total = lines.reduce((s, l) => {
    const qty = form.reason === 'Sales' ? parseFloat(l.quantity_out) || 0 : parseFloat(l.quantity_in) || 0
    return s + qty * (parseFloat(l.unit_price) || 0)
  }, 0)

  return (
    <div>
      <div className="page-header">
        <span className="page-title">{isNew ? 'New Stock Sales' : `Stock Record — ${id}`}</span>
        {!isNew && <button className="btn-secondary" onClick={() => nav('/stock/sales')}>Back</button>}
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
              <option value="Sales">Sales</option>
              <option value="Sales Return">Sales Return</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Warehouse *</label>
            <select value={form.warehouse_id} disabled={!isNew} onChange={e => setForm({ ...form, warehouse_id: e.target.value })}>
              <option value="">— Select —</option>
              {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_id} — {w.warehouse_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Customer *</label>
            <select value={form.customer_id} disabled={!isNew} onChange={e => setForm({ ...form, customer_id: e.target.value })}>
              <option value="">— Select —</option>
              {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.customer_id} — {c.customer_name}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <strong style={{ fontSize: 13 }}>Line Items</strong>
            {isNew && <button className="btn-primary" onClick={addLine}>+ Add Row</button>}
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th><th>Product Code</th><th>Product Name</th><th>Ref SO No</th>
                <th>{form.reason === 'Sales' ? 'Qty OUT *' : 'Qty IN *'}</th>
                <th>Unit</th><th>Unit Price</th><th>Extended Price</th>
                {isNew && <th></th>}
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => {
                const prod = products.find(p => p.product_code === l.product_code)
                const qty = form.reason === 'Sales' ? parseFloat(l.quantity_out) || 0 : parseFloat(l.quantity_in) || 0
                const up = parseFloat(l.unit_price) || 0
                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{isNew
                      ? <select value={l.product_code} onChange={e => updateLine(i, 'product_code', e.target.value)} style={{ width: 110 }}>
                          <option value="">— Select —</option>
                          {products.map(p => <option key={p.product_code} value={p.product_code}>{p.product_code}</option>)}
                        </select>
                      : l.product_code}
                    </td>
                    <td className="text-muted">{prod?.product_name || l.product_name || '—'}</td>
                    <td>{isNew
                      ? <input value={l.ref_so_no || ''} onChange={e => updateLine(i, 'ref_so_no', e.target.value)} style={{ width: 90 }} placeholder="SO-001" />
                      : l.ref_so_no || '—'}
                    </td>
                    <td>{isNew
                      ? <input type="number"
                          value={form.reason === 'Sales' ? l.quantity_out : l.quantity_in}
                          onChange={e => updateLine(i, form.reason === 'Sales' ? 'quantity_out' : 'quantity_in', e.target.value)}
                          style={{ width: 80 }} min="0" step="0.001" />
                      : formatNumber(form.reason === 'Sales' ? l.quantity_out : l.quantity_in, 3)}
                    </td>
                    <td className="text-muted">{prod?.unit_name || l.unit_name || '—'}</td>
                    <td>{isNew
                      ? <input type="number" value={l.unit_price} onChange={e => updateLine(i, 'unit_price', e.target.value)} style={{ width: 80 }} min="0" step="0.01" />
                      : formatNumber(l.unit_price)}
                    </td>
                    <td className="text-muted">{(qty * up).toFixed(2)}</td>
                    {isNew && <td><button className="btn-danger" onClick={() => removeLine(i)}>Del</button></td>}
                  </tr>
                )
              })}
              {!lines.length && <tr><td colSpan={isNew ? 9 : 8} className="text-center text-muted">No lines</td></tr>}
              {lines.length > 0 && (
                <tr className="row-total">
                  <td colSpan={isNew ? 7 : 6} className="text-right">TOTAL</td>
                  <td>{total.toFixed(2)}</td>
                  {isNew && <td></td>}
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {error && <p className="error-text" style={{ marginTop: 12 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn-secondary" onClick={() => nav('/stock/sales')}>{isNew ? 'Cancel' : 'Close'}</button>
          {isNew && <button className="btn-primary" onClick={save}>Save</button>}
        </div>
      </div>
    </div>
  )
}
