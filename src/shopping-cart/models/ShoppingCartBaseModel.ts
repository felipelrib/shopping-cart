import { Cart, Product } from "../ShoppingCartTypes"

export abstract class ShoppingCartBaseModel {
  abstract getCartInstance(): Cart | Promise<Cart>

  abstract updateCart(cart: Cart): void | Promise<void>

  abstract emptyCart(cart: Cart): void | Promise<void>

  abstract getDataFromProductsOnCart(cart: Cart): Product[] | Promise<Product[]>

  abstract existsProductWithGivenId(id: string): boolean | Promise<boolean>

  abstract populateProductsContainer(products: Product[]): void | Promise<void>
}
