import ApplicationError from "../errors/ApplicationError"
import { Cart, Product } from "./ShoppingCartTypes"
import { ShoppingCartBaseModel } from "./models/ShoppingCartBaseModel"

export class ShoppingCartService {
  private shoppingCartModel: ShoppingCartBaseModel

  constructor(shoppingCartModel: ShoppingCartBaseModel) {
    this.shoppingCartModel = shoppingCartModel
  }

  addItemToCart = async (id: string, amount: number): Promise<void> => {
    if (!(await this.shoppingCartModel.existsProductWithGivenId(id))) {
      throw new ApplicationError(`There is no product with id "${id}".`)
    }

    const cart = await this.shoppingCartModel.getCartInstance()

    let product = cart.products.find((product) => product.id === id)
    if (!product) {
      cart.products.push({ id, amount })
    } else {
      product.amount += amount
    }

    await this.shoppingCartModel.updateCart(cart)
  }

  removeItemFromCart = async (id: string, amount: number): Promise<void> => {
    if (!(await this.shoppingCartModel.existsProductWithGivenId(id))) {
      throw new ApplicationError(`There is no product with id "${id}".`)
    }

    const cart = await this.shoppingCartModel.getCartInstance()

    let product = cart.products.find((product) => product.id === id)
    if (!product) {
      throw new ApplicationError(`The product with id "${id}" was not added in the cart.`)
    }
    if (product.amount - amount < 0) {
      throw new ApplicationError(
        `It is not possible to remove ${amount} items of the product "${id}" from the cart. ` +
          `The cart currently has ${product.amount} items of this product.`
      )
    }

    product.amount -= amount

    await this.shoppingCartModel.updateCart(cart)
  }

  private getTotalItemsAmount = (cart: Cart): number => {
    return cart.products.reduce(
      (itemsAmount, currentProduct) => itemsAmount + currentProduct.amount,
      0
    )
  }

  private calculateCartValue = (cart: Cart, productsData: Product[]): number => {
    const cartProductsWithPrice = cart.products.map((product) => {
      const productData = productsData.find((productData) => productData.id === product.id)
      return {
        amount: product.amount,
        price: productData!.price,
      }
    })
    const cartProductsOrderedByLowestPrice = cartProductsWithPrice.sort((a, b) => a.price - b.price)

    const totalItemsAmount = this.getTotalItemsAmount(cart)
    let freeItemsAmount = Math.floor(totalItemsAmount / 3)
    for (const product of cartProductsOrderedByLowestPrice) {
      if (freeItemsAmount === 0) break
      const amountToReduceFromProduct = Math.min(freeItemsAmount, product.amount)
      product.amount -= amountToReduceFromProduct
      freeItemsAmount -= amountToReduceFromProduct
    }

    const cartValueAfterDiscounts = cartProductsOrderedByLowestPrice.reduce(
      (cartValue, product) => cartValue + product.amount * product.price,
      0
    )

    return cartValueAfterDiscounts
  }

  closeCart = async (): Promise<number> => {
    const cart = await this.shoppingCartModel.getCartInstance()

    if (this.getTotalItemsAmount(cart) === 0) {
      throw new ApplicationError(`The cart is empty.`)
    }

    const productsData = await this.shoppingCartModel.getDataFromProductsOnCart(cart)
    const finalCartValue = this.calculateCartValue(cart, productsData)
    await this.shoppingCartModel.emptyCart(cart)

    return finalCartValue
  }
}
