import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import { ShoppingCartMongoModel } from "../shopping-cart/models/mongo/ShoppingCartMongoModel"

let mongoServer: MongoMemoryServer | null = null

export const dbConnect = async () => {
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()

    await mongoose.connect(uri)
    console.log(`MongoDB Memory Server started at ${uri}`)
  }
}

export const dbDisconnect = async () => {
  if (mongoServer) {
    await mongoose.disconnect()
    await mongoServer.stop()

    mongoServer = null
  }
}

export const dbPopulate = async () => {
  const productsData = require("../shopping-cart/products.json")
  const shoppingCartMongoModel = new ShoppingCartMongoModel()
  await shoppingCartMongoModel.populateProductsContainer(productsData)
}
