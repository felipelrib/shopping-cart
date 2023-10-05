import express from "express"
import shoppingCartRoutes from "./shopping-cart/ShoppingCartRoutes"

const app = express()

app.use(express.json())

app.use("/shopping-cart", shoppingCartRoutes)

export default app
