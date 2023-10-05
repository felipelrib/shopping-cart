import express from "express"
import { ShoppingCartController } from "./ShoppingCartController"
import { ShoppingCartMongoModel } from "./models/mongo/ShoppingCartMongoModel"

const router = express.Router()

const shoppingCartController = new ShoppingCartController(new ShoppingCartMongoModel())

router.post("/addItem", shoppingCartController.processAddItemRequest)
router.post("/removeItem", shoppingCartController.processRemoveItemRequest)
router.post("/closeCart", shoppingCartController.processCloseCartRequest)

export default router
