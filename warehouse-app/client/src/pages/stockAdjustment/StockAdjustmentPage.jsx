import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { stockAdjustmentApi } from '../../api/stockAdjustment.api'
import { warehousesApi } from '../../api/warehouses.api'
import { productsApi } from '../../api/products.api'
import { formatDate, formatNumber } from '../../utils'

export default function StockAdjustmentPage() {
  const { id } = useParams()
  const nav = useNavigate()
  
  // FIX: Clear parameter stalls
  const isNew = !id || id === 'new'
  
  const [form, setForm] = useState({ stock_date: new Date().toISOString().split('T')[0], warehouse_id: '', reason_for_adjustment: '' })
  const [lines, setLines] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([warehousesApi.list(), productsApi.list()]).then(([w, p]) => {
      setWarehouses(w); setProducts(p)
    })
    if (!isNew) {
      stockAdjustmentApi.get(id).then(r => {
        setForm({ stock_date: formatDate(r.stock_date), warehouse_id: r.warehouse_id, reason_for_adjustment: r.reason_for_adjustment })
        setLines(r.line_items || [])
      }).catch(() => nav('/stock/adjustment'))
    }
  }, [id, isNew, nav])

  const addLine = () => setLines([...lines, { product_code: '', system_balance: 0, checked_balance: '0', quantity_adjust: 0 }])
  const removeLine = (i) => setLines(lines.filter((_, idx) => idx !== i))

  const updateLine = async (i, field, value) => {
    const updated = [...lines]
    updated[i][field] = value
    
    if (field === 'product_code' && value && form.warehouse_id) {
      try {
        const r = await stockAdjustmentApi.getBalance(form.warehouse_id, value)
        const sysBal = parseFloat(r?.balance || r?.system_balance || 0)
        updated[i].system_balance = sysBal
        updated[i].quantity_adjust = (parseFloat(updated[i].checked_balance) || 0) - sysBal
      } catch { 
        updated[i].system_balance = 0 
        updated[i].quantity_adjust = (parseFloat(updated[i].checked_balance) || 0)
      }
    }
    
    if (field === 'checked_balance') {
      const sys = parseFloat(updated[i].system_balance) || 0
      updated[i].quantity_adjust = (parseFloat(value) || 0) - sys
    }
    setLines([...updated])
  }

  const handleWarehouseChange = async (warehouse_id) => {
    setForm({ ...form, warehouse_id })
    const updated = await Promise.all(lines.map(async l => {
      if (l.product_code && warehouse_id) {
        try {
          const r = await stockAdjustmentApi.getBalance(warehouse_id, l.product_code)
          const sysBal = parseFloat(r?.balance || r?.system_balance || 0)
          return { ...l, system_balance: sysBal, quantity_adjust: (parseFloat(l.checked_balance) || 0) - sysBal }
        } catch { return { ...l, system_balance: 0, quantity_adjust: parseFloat(l.checked_balance) || 0 } }
      }
      return l
    }))
    setLines(updated)
  }

  const save = async () => {
    try {
      setError('')
      if (lines.length === 0) {
        setError('Adjustment documents require at least 1 counted line item entry.')
        return
      }
      if (!form.warehouse_id) {
        setError('Please select a targeted inventory warehouse facility context.')
        return
      }

      await stockAdjustmentApi.create({
        ...form,
        reason: "Stock Adjustment",
        line_items: lines.map(l => ({ 
          product_code: l.product_code, 
          checked_balance: parseFloat(l.checked_balance) || 0 
        }))
      })
      nav('/stock/adjustment')
    } catch (e) {
      const errData = e?.response?.data || e?.data || e
      setError(errData?.field_errors?.[0]?.reason || errData?.message || 'Error processing adjustment save')
    }
  }

  return (
    <div>
      <div className="page-header">
        <span className="page-title">{isNew ? 'New Stock Adjustment' : `Stock Adjustment — ${id}`}</span>
        {!isNew && <button className="btn-secondary" onClick={() => nav('/stock/adjustment')}>Back</button>}
      </div>
      <div style={{ background: 'white', padding: 24, borderRadius: 8 }}>
        {!isNew && <div className="form-row"><div className="form-group"><label>Stock No</label><input value={id} disabled /></div></div>}
        <div className="form-row">
          <div className="form-group">
            <label>Stock Date *</label>
            <input type="date" value={form.stock_date} disabled={!isNew} onChange={e => setForm({ ...form, stock_date: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Reason</label>
            <input value="Stock Adjustment" disabled />
          </div>
        </div>
        <div className="form-row" style={{ marginTop: 12 }}>
          <div className="form-group">
            <label>Warehouse *</label>
            <select value={form.warehouse_id} disabled={!isNew} onChange={e => handleWarehouseChange(e.target.value)}>
              <option value="">— Select —</option>
              {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_id} — {w.warehouse_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Reason for Adjustment *</label>
            <input value={form.reason_for_adjustment} disabled={!isNew}
              onChange={e => setForm({ ...form, reason_for_adjustment: e.target.value })}
              placeholder="e.g. Routine monthly count" />
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
                <th style={{ padding: 8 }}>Current System Balance</th>
                <th style={{ padding: 8 }}>Stock Balance After Check</th>
                <th style={{ padding: 8 }}>Qty Adjust IN/OUT</th>
                <th style={{ padding: 8 }}>Unit</th>
                {isNew && <th style={{ padding: 8 }}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => {
                const prod = products.find(p => p.product_code === l.product_code)
                const sys = parseFloat(l.system_balance) || 0
                const checked = parseFloat(l.checked_balance) || 0
                const adj = isNew ? checked - sys : parseFloat(l.quantity_adjust) || 0
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
                    <td style={{ padding: 8, background: '#f9f9f9', fontStyle: 'italic', color: '#555' }}>{sys.toFixed(3)}</td>
                    <td style={{ padding: 8 }}>{isNew
                      ? <input type="number" value={l.checked_balance} onChange={e => updateLine(i, 'checked_balance', e.target.value)} style={{ width: 90 }} min="0" step="0.001" />
                      : formatNumber(l.checked_balance, 3)}
                    </td>
                    <td style={{ padding: 8, fontWeight: 'bold', color: adj < 0 ? 'red' : adj > 0 ? 'green' : '#777' }}>
                      {adj >= 0 ? `+${adj.toFixed(3)}` : adj.toFixed(3)}
                    </td>
                    <td style={{ padding: 8 }} className="text-muted">{prod?.unit_name || l.unit_name || '—'}</td>
                    {isNew && <td style={{ padding: 8 }}><button type="button" className="btn-danger" onClick={() => removeLine(i)}>Del</button></td>}
                  </tr>
                )
              })}
              {!lines.length && <tr><td colSpan={isNew ? 8 : 7} style={{ padding: 12, textAlign: 'center' }} className="text-muted">No line rows generated — click + Add Row</td></tr>}
            </tbody>
          </table>
          <p style={{ fontSize: 12, color: '#888', marginTop: 10 }}>
            * Current System Balance fields are read-only. Qty Adjust = Balance After Check − System Balance. Negative variances reflect down-adjustments[cite: 2186].
          </p>
        </div>

        {error && <p className="error-text" style={{ color: 'red', marginTop: 12 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button type="button" className="btn-secondary" onClick={() => nav('/stock/adjustment')}>{isNew ? 'Cancel' : 'Close'}</button>
          {isNew && <button type="button" className="btn-primary" onClick={save}>Save</button>}
        </div>
      </div>
    </div>
  )
}
