import mongoose from "mongoose"
import { Product } from "../../ShoppingCartTypes"

export type IProduct = Product & mongoose.Document

const ProductSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
})

export default mongoose.model<IProduct>("Product", ProductSchema)
