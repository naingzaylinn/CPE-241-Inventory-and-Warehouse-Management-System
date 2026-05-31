import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import './index.css'

// Simple form pages
import ProductTypeList from './pages/productTypes/ProductTypeList'
import ProductTypePage from './pages/productTypes/ProductTypePage'
import UnitList        from './pages/units/UnitList'
import UnitPage        from './pages/units/UnitPage'
import WarehouseList   from './pages/warehouses/WarehouseList'
import WarehousePage   from './pages/warehouses/WarehousePage'
import SupplierList    from './pages/suppliers/SupplierList'
import SupplierPage    from './pages/suppliers/SupplierPage'
import CustomerList    from './pages/customers/CustomerList'
import CustomerPage    from './pages/customers/CustomerPage'

// Line item form pages
import ProductList        from './pages/products/ProductList'
import ProductPage        from './pages/products/ProductPage'
import StockPurchaseList  from './pages/stockPurchase/StockPurchaseList'
import StockPurchasePage  from './pages/stockPurchase/StockPurchasePage'
import StockSalesList     from './pages/stockSales/StockSalesList'
import StockSalesPage     from './pages/stockSales/StockSalesPage'
import StockAdjustmentList from './pages/stockAdjustment/StockAdjustmentList'
import StockAdjustmentPage from './pages/stockAdjustment/StockAdjustmentPage'

// Report pages
import ReportProductList       from './pages/reports/ReportProductList'
import ReportBomPrint          from './pages/reports/ReportBomPrint'
import ReportStockByType       from './pages/reports/ReportStockByType'
import ReportPurchaseList      from './pages/reports/ReportPurchaseList'
import ReportReceivingVoucher  from './pages/reports/ReportReceivingVoucher'
import ReportPurchaseBySupplier from './pages/reports/ReportPurchaseBySupplier'
import ReportSalesList         from './pages/reports/ReportSalesList'
import ReportDeliveryVoucher   from './pages/reports/ReportDeliveryVoucher'
import ReportSalesByProduct    from './pages/reports/ReportSalesByProduct'
import ReportStockBalance      from './pages/reports/ReportStockBalance'
import ReportStockCard         from './pages/reports/ReportStockCard'
import ReportAdjustmentByProduct from './pages/reports/ReportAdjustmentByProduct'

function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <h1>STOCKER</h1>
        <p>Warehouse Management</p>
      </div>

      <p className="nav-section">Setup</p>
      <NavLink to="/product-types"><span>Product Types</span></NavLink>
      <NavLink to="/units"><span>Units</span></NavLink>
      <NavLink to="/warehouses"><span>Warehouses</span></NavLink>
      <NavLink to="/suppliers"><span>Suppliers</span></NavLink>
      <NavLink to="/customers"><span>Customers</span></NavLink>
      <NavLink to="/products"><span>Products</span></NavLink>

      <p className="nav-section">Transactions</p>
      <NavLink to="/stock/purchase"><span>Stock Purchase</span></NavLink>
      <NavLink to="/stock/sales"><span>Stock Sales</span></NavLink>
      <NavLink to="/stock/adjustment"><span>Stock Adjustment</span></NavLink>

      <p className="nav-section">Reports — Lae Lae</p>
      <NavLink to="/reports/product-list"><span>#01 Product List</span></NavLink>
      <NavLink to="/reports/bom-print"><span>#02 BOM Print</span></NavLink>
      <NavLink to="/reports/stock-by-type"><span>#03 Stock by Type</span></NavLink>

      <p className="nav-section">Reports — Moe Htet</p>
      <NavLink to="/reports/purchase-list"><span>#04 Purchase List</span></NavLink>
      <NavLink to="/reports/receiving-voucher"><span>#05 Receiving Voucher</span></NavLink>
      <NavLink to="/reports/purchase-by-supplier"><span>#06 Purchase by Supplier</span></NavLink>

      <p className="nav-section">Reports — Naing Zay</p>
      <NavLink to="/reports/sales-list"><span>#07 Sales List</span></NavLink>
      <NavLink to="/reports/delivery-voucher"><span>#08 Delivery Voucher</span></NavLink>
      <NavLink to="/reports/sales-by-product"><span>#09 Sales by Product</span></NavLink>

      <p className="nav-section">Reports — Thu Thu</p>
      <NavLink to="/reports/stock-balance"><span>#10 Stock Balance</span></NavLink>
      <NavLink to="/reports/stock-card"><span>#11 Stock Card</span></NavLink>
      <NavLink to="/reports/adjustment-by-product"><span>#12 Adjustment by Product</span></NavLink>
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
            {/* Setup */}
            <Route path="/"                       element={<ProductTypeList />} />
            <Route path="/product-types"          element={<ProductTypeList />} />
            <Route path="/product-types/new"      element={<ProductTypePage />} />
            <Route path="/product-types/:id"      element={<ProductTypePage />} />
            <Route path="/units"                  element={<UnitList />} />
            <Route path="/units/new"              element={<UnitPage />} />
            <Route path="/units/:id"              element={<UnitPage />} />
            <Route path="/warehouses"             element={<WarehouseList />} />
            <Route path="/warehouses/new"         element={<WarehousePage />} />
            <Route path="/warehouses/:id"         element={<WarehousePage />} />
            <Route path="/suppliers"              element={<SupplierList />} />
            <Route path="/suppliers/new"          element={<SupplierPage />} />
            <Route path="/suppliers/:id"          element={<SupplierPage />} />
            <Route path="/customers"              element={<CustomerList />} />
            <Route path="/customers/new"          element={<CustomerPage />} />
            <Route path="/customers/:id"          element={<CustomerPage />} />
            <Route path="/products"               element={<ProductList />} />
            <Route path="/products/new"           element={<ProductPage />} />
            <Route path="/products/:id"           element={<ProductPage />} />
            {/* Transactions */}
            <Route path="/stock/purchase"         element={<StockPurchaseList />} />
            <Route path="/stock/purchase/new"     element={<StockPurchasePage />} />
            <Route path="/stock/purchase/:id"     element={<StockPurchasePage />} />
            <Route path="/stock/sales"            element={<StockSalesList />} />
            <Route path="/stock/sales/new"        element={<StockSalesPage />} />
            <Route path="/stock/sales/:id"        element={<StockSalesPage />} />
            <Route path="/stock/adjustment"       element={<StockAdjustmentList />} />
            <Route path="/stock/adjustment/new"   element={<StockAdjustmentPage />} />
            <Route path="/stock/adjustment/:id"   element={<StockAdjustmentPage />} />
            {/* Reports */}
            <Route path="/reports/product-list"          element={<ReportProductList />} />
            <Route path="/reports/bom-print"             element={<ReportBomPrint />} />
            <Route path="/reports/stock-by-type"         element={<ReportStockByType />} />
            <Route path="/reports/purchase-list"         element={<ReportPurchaseList />} />
            <Route path="/reports/receiving-voucher"     element={<ReportReceivingVoucher />} />
            <Route path="/reports/purchase-by-supplier"  element={<ReportPurchaseBySupplier />} />
            <Route path="/reports/sales-list"            element={<ReportSalesList />} />
            <Route path="/reports/delivery-voucher"      element={<ReportDeliveryVoucher />} />
            <Route path="/reports/sales-by-product"      element={<ReportSalesByProduct />} />
            <Route path="/reports/stock-balance"         element={<ReportStockBalance />} />
            <Route path="/reports/stock-card"            element={<ReportStockCard />} />
            <Route path="/reports/adjustment-by-product" element={<ReportAdjustmentByProduct />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
