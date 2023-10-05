import Cart, { ICart } from "./CartMongoModel"
import Product, { IProduct } from "./ProductMongoModel"
import { ShoppingCartBaseModel } from "../ShoppingCartBaseModel"

export class ShoppingCartMongoModel extends ShoppingCartBaseModel {
  private createInitialCartInstance = async (): Promise<ICart> => {
    const cart = new Cart({ products: [] })
    await cart.save()

    return cart
  }

  getCartInstance = async (): Promise<ICart> => {
    let cart: ICart | null = await Cart.findOne()
    if (!cart) {
      cart = await this.createInitialCartInstance()
    }

    return cart
  }

  updateCart = async (cart: ICart): Promise<void> => {
    await cart.save()
  }

  emptyCart = async (cart: ICart): Promise<void> => {
    await Cart.deleteOne({ _id: cart._id })
    await this.createInitialCartInstance()
  }

  getDataFromProductsOnCart = async (cart: ICart): Promise<IProduct[]> => {
    const populatedCart = await cart.populate("productsData")
    return populatedCart.productsData ?? []
  }

  existsProductWithGivenId = async (id: string): Promise<boolean> => {
    const product = await Product.findOne({ id })
    return !!product
  }

  populateProductsContainer = async (products: IProduct[]): Promise<void> => {
    await Product.insertMany(products)
  }
}
