import mongoose from "mongoose"
import { Cart } from "../../ShoppingCartTypes"
import { IProduct } from "./ProductMongoModel"

export type ICart = Cart &
  mongoose.Document & {
    productsData?: IProduct[]
  }

const CartSchema = new mongoose.Schema(
  {
    products: [
      {
        id: String,
        amount: Number,
      },
    ],
  },
  {
    virtuals: {
      productsData: {
        options: {
          ref: "Product",
          localField: "products.id",
          foreignField: "id",
          justOne: false,
        },
      },
    },
  }
)

export default mongoose.model<ICart>("Cart", CartSchema)
