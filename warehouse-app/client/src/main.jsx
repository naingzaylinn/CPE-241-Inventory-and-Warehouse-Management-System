import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import './index.css'

// Pages — simple forms
import ProductTypeList from './pages/productTypes/ProductTypeList'
import ProductTypePage from './pages/productTypes/ProductTypePage'
import UnitList from './pages/units/UnitList'
import UnitPage from './pages/units/UnitPage'
import WarehouseList from './pages/warehouses/WarehouseList'
import WarehousePage from './pages/warehouses/WarehousePage'
import SupplierList from './pages/suppliers/SupplierList'
import SupplierPage from './pages/suppliers/SupplierPage'
import CustomerList from './pages/customers/CustomerList'
import CustomerPage from './pages/customers/CustomerPage'

// Pages — line item forms
import ProductList from './pages/products/ProductList'
import ProductPage from './pages/products/ProductPage'
import StockPurchaseList from './pages/stockPurchase/StockPurchaseList'
import StockPurchasePage from './pages/stockPurchase/StockPurchasePage'
import StockSalesList from './pages/stockSales/StockSalesList'
import StockSalesPage from './pages/stockSales/StockSalesPage'
import StockAdjustmentList from './pages/stockAdjustment/StockAdjustmentList'
import StockAdjustmentPage from './pages/stockAdjustment/StockAdjustmentPage'

// Pages — reports
import ReportProductList from './pages/reports/ReportProductList'
import ReportBomPrint from './pages/reports/ReportBomPrint'
import ReportStockByType from './pages/reports/ReportStockByType'
import ReportPurchaseList from './pages/reports/ReportPurchaseList'
import ReportReceivingVoucher from './pages/reports/ReportReceivingVoucher'
import ReportPurchaseBySupplier from './pages/reports/ReportPurchaseBySupplier'
import ReportSalesList from './pages/reports/ReportSalesList'
import ReportDeliveryVoucher from './pages/reports/ReportDeliveryVoucher'
import ReportSalesByProduct from './pages/reports/ReportSalesByProduct'
import ReportStockBalance from './pages/reports/ReportStockBalance'
import ReportStockCard from './pages/reports/ReportStockCard'
import ReportAdjustmentByProduct from './pages/reports/ReportAdjustmentByProduct'

function Sidebar() {
  return (
    <nav className="sidebar">
      <h2>STOCKER</h2>

      <p className="nav-section">Setup</p>
      <NavLink to="/product-types">Product Types</NavLink>
      <NavLink to="/units">Units</NavLink>
      <NavLink to="/warehouses">Warehouses</NavLink>
      <NavLink to="/suppliers">Suppliers</NavLink>
      <NavLink to="/customers">Customers</NavLink>
      <NavLink to="/products">Products</NavLink>

      <p className="nav-section">Transactions</p>
      <NavLink to="/stock/purchase">Stock Purchase</NavLink>
      <NavLink to="/stock/sales">Stock Sales</NavLink>
      <NavLink to="/stock/adjustment">Stock Adjustment</NavLink>

      <p className="nav-section">Reports — Lae Lae</p>
      <NavLink to="/reports/product-list">#01 Product List</NavLink>
      <NavLink to="/reports/bom-print">#02 BOM Print</NavLink>
      <NavLink to="/reports/stock-by-type">#03 Stock by Type</NavLink>

      <p className="nav-section">Reports — Moe Htet</p>
      <NavLink to="/reports/purchase-list">#04 Purchase List</NavLink>
      <NavLink to="/reports/receiving-voucher">#05 Receiving Voucher</NavLink>
      <NavLink to="/reports/purchase-by-supplier">#06 Purchase by Supplier</NavLink>

      <p className="nav-section">Reports — Naing Zay</p>
      <NavLink to="/reports/sales-list">#07 Sales List</NavLink>
      <NavLink to="/reports/delivery-voucher">#08 Delivery Voucher</NavLink>
      <NavLink to="/reports/sales-by-product">#09 Sales by Product</NavLink>

      <p className="nav-section">Reports — Thu Thu</p>
      <NavLink to="/reports/stock-balance">#10 Stock Balance</NavLink>
      <NavLink to="/reports/stock-card">#11 Stock Card</NavLink>
      <NavLink to="/reports/adjustment-by-product">#12 Adjustment by Product</NavLink>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar />
        <main className="main">
          <Routes>
            <Route path="/product-types" element={<ProductTypeList />} />
            <Route path="/product-types/new" element={<ProductTypePage />} />
            <Route path="/product-types/:id" element={<ProductTypePage />} />
            <Route path="/units" element={<UnitList />} />
            <Route path="/units/new" element={<UnitPage />} />
            <Route path="/units/:id" element={<UnitPage />} />
            <Route path="/warehouses" element={<WarehouseList />} />
            <Route path="/warehouses/new" element={<WarehousePage />} />
            <Route path="/warehouses/:id" element={<WarehousePage />} />
            <Route path="/suppliers" element={<SupplierList />} />
            <Route path="/suppliers/new" element={<SupplierPage />} />
            <Route path="/suppliers/:id" element={<SupplierPage />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/new" element={<CustomerPage />} />
            <Route path="/customers/:id" element={<CustomerPage />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/new" element={<ProductPage />} />
            <Route path="/products/:id" element={<ProductPage />} />
            <Route path="/stock/purchase" element={<StockPurchaseList />} />
            <Route path="/stock/purchase/new" element={<StockPurchasePage />} />
            <Route path="/stock/purchase/:id" element={<StockPurchasePage />} />
            <Route path="/stock/sales" element={<StockSalesList />} />
            <Route path="/stock/sales/new" element={<StockSalesPage />} />
            <Route path="/stock/sales/:id" element={<StockSalesPage />} />
            <Route path="/stock/adjustment" element={<StockAdjustmentList />} />
            <Route path="/stock/adjustment/new" element={<StockAdjustmentPage />} />
            <Route path="/stock/adjustment/:id" element={<StockAdjustmentPage />} />
            <Route path="/reports/product-list" element={<ReportProductList />} />
            <Route path="/reports/bom-print" element={<ReportBomPrint />} />
            <Route path="/reports/stock-by-type" element={<ReportStockByType />} />
            <Route path="/reports/purchase-list" element={<ReportPurchaseList />} />
            <Route path="/reports/receiving-voucher" element={<ReportReceivingVoucher />} />
            <Route path="/reports/purchase-by-supplier" element={<ReportPurchaseBySupplier />} />
            <Route path="/reports/sales-list" element={<ReportSalesList />} />
            <Route path="/reports/delivery-voucher" element={<ReportDeliveryVoucher />} />
            <Route path="/reports/sales-by-product" element={<ReportSalesByProduct />} />
            <Route path="/reports/stock-balance" element={<ReportStockBalance />} />
            <Route path="/reports/stock-card" element={<ReportStockCard />} />
            <Route path="/reports/adjustment-by-product" element={<ReportAdjustmentByProduct />} />
            <Route path="/" element={<ProductTypeList />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
