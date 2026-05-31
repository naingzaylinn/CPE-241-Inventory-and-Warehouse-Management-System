import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { customersApi } from '../../api/customers.api'
import { ConfirmModal, AlertModal } from '../../components/Modal'

export default function CustomerList() {
  const nav = useNavigate()
  const [list, setList] = useState([])
  const [confirm, setConfirm] = useState(null)
  const [alert, setAlert] = useState('')

  const load = () => customersApi.list().then(setList)
  useEffect(() => { load() }, [])

  const del = async (id) => {
    try { await customersApi.delete(id); load() }
    catch (e) { setAlert(e.data?.message || 'Cannot delete') }
    setConfirm(null)
  }

  return (
    <div>
      {alert && <AlertModal message={alert} onClose={() => setAlert('')} />}
      {confirm && <ConfirmModal message={`Delete "${confirm.id}"?`} onConfirm={() => del(confirm.id)} onCancel={() => setConfirm(null)} />}
      <div className="page-header">
        <span className="page-title">Customer</span>
        <button className="btn-primary" onClick={() => nav('/customers/new')}>+ New</button>
      </div>
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Contact</th><th style={{width:140}}>Actions</th></tr></thead>
        <tbody>
          {list.map(r => (
            <tr key={r.customer_id}>
              <td>{r.customer_id}</td><td>{r.customer_name}</td><td>{r.contact_info || '—'}</td>
              <td>
                <button className="btn-primary" style={{marginRight:6}} onClick={() => nav(`/customers/${r.customer_id}`)}>Edit</button>
                <button className="btn-danger" onClick={() => setConfirm({ id: r.customer_id })}>Delete</button>
              </td>
            </tr>
          ))}
          {!list.length && <tr><td colSpan={4} className="text-center text-muted">No records</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
