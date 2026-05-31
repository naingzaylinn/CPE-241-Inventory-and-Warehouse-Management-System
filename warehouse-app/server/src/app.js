const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

// Simple forms
app.use('/api/v1/product-types',     require('./routes/productTypes.routes'))
app.use('/api/v1/units',             require('./routes/units.routes'))
app.use('/api/v1/warehouses',        require('./routes/warehouses.routes'))
app.use('/api/v1/suppliers',         require('./routes/suppliers.routes'))
app.use('/api/v1/customers',         require('./routes/customers.routes'))

// Line item forms
app.use('/api/v1/products',          require('./routes/products.routes'))
app.use('/api/v1/stock/purchase',    require('./routes/stockPurchase.routes'))
app.use('/api/v1/stock/sales',       require('./routes/stockSales.routes'))
app.use('/api/v1/stock/adjustment',  require('./routes/stockAdjustment.routes'))

// Reports
app.use('/api/v1/reports',           require('./routes/reports.routes'))

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || '0.0.0.0'
app.listen(PORT, HOST, () => console.log(`Server running on ${HOST}:${PORT}`))
