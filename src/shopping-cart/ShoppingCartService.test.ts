import ApplicationError from "../errors/ApplicationError"
import { ShoppingCartMongoModel } from "./models/mongo/ShoppingCartMongoModel"
import { ShoppingCartService } from "./ShoppingCartService"

const getCartInstanceMock = jest.fn()
const updateCartMock = jest.fn()
const emptyCartMock = jest.fn()
const getDataFromProductsOnCartMock = jest.fn()
const existsProductWithGivenIdMock = jest.fn()

jest.mock("./models/mongo/ShoppingCartMongoModel", () => ({
  ShoppingCartMongoModel: jest.fn().mockImplementation(() => ({
    getCartInstance: getCartInstanceMock,
    updateCart: updateCartMock,
    emptyCart: emptyCartMock,
    getDataFromProductsOnCart: getDataFromProductsOnCartMock,
    existsProductWithGivenId: existsProductWithGivenIdMock,
  })),
}))

describe("Shopping Cart Routes tests", () => {
  const shoppingCartModel = new ShoppingCartMongoModel()
  const shoppingCartService = new ShoppingCartService(shoppingCartModel)

  beforeEach(() => {
    existsProductWithGivenIdMock.mockResolvedValue(true)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("Add items to cart", () => {
    it("adds an item to an empty cart", async () => {
      const id = "1"
      const amountToAdd = 2
      const initialCart = { id: "1", products: [] }
      const finalCart = { id: "1", products: [{ id, amount: amountToAdd }] }

      getCartInstanceMock.mockResolvedValueOnce(initialCart)

      await shoppingCartService.addItemToCart(id, amountToAdd)

      expect(updateCartMock).toHaveBeenCalledWith(finalCart)
    })

    it("adds an amount of an existing item in a cart", async () => {
      const id = "1"
      const initialAmount = 1
      const amountToAdd = 2
      const initialCart = { id: "1", products: [{ id, amount: initialAmount }] }
      const finalCart = { id: "1", products: [{ id, amount: initialAmount + amountToAdd }] }

      getCartInstanceMock.mockResolvedValueOnce(initialCart)

      await shoppingCartService.addItemToCart(id, amountToAdd)

      expect(updateCartMock).toHaveBeenCalledWith(finalCart)
    })

    it("adds an amount of item which is not yet in a cart", async () => {
      const id = "2"
      const amountToAdd = 2
      const initialCart = { id: "1", products: [{ id: "1", amount: 5 }] }
      const finalCart = {
        id: "1",
        products: [
          { id: "1", amount: 5 },
          { id, amount: amountToAdd },
        ],
      }

      getCartInstanceMock.mockResolvedValueOnce(initialCart)

      await shoppingCartService.addItemToCart(id, amountToAdd)

      expect(updateCartMock).toHaveBeenCalledWith(finalCart)
    })

    it("blocks addition of a product not present in the database", async () => {
      const id = "1"
      const amountToAdd = 2
      const expectedError = new ApplicationError(`There is no product with id "${id}".`)

      existsProductWithGivenIdMock.mockResolvedValueOnce(false)

      expect(shoppingCartService.addItemToCart(id, amountToAdd)).rejects.toThrow(expectedError)
    })
  })

  describe("Remove items to cart", () => {
    it("removes an amount of an item present in the cart", async () => {
      const id = "1"
      const initialAmount = 2
      const amountToRemove = 1
      const initialCart = { id: "1", products: [{ id, amount: initialAmount }] }
      const finalCart = { id: "1", products: [{ id, amount: initialAmount - amountToRemove }] }

      getCartInstanceMock.mockResolvedValueOnce(initialCart)

      await shoppingCartService.removeItemFromCart(id, amountToRemove)

      expect(updateCartMock).toHaveBeenCalledWith(finalCart)
    })

    it("removes all amount of an item present in the cart", async () => {
      const id = "1"
      const initialAmount = 2
      const amountToRemove = initialAmount
      const initialCart = { id: "1", products: [{ id, amount: initialAmount }] }
      const finalCart = { id: "1", products: [{ id, amount: 0 }] }

      getCartInstanceMock.mockResolvedValueOnce(initialCart)

      await shoppingCartService.removeItemFromCart(id, amountToRemove)

      expect(updateCartMock).toHaveBeenCalledWith(finalCart)
    })

    it("blocks removal of an amount higher than present in the cart", async () => {
      const id = "1"
      const initialAmount = 2
      const amountToRemove = 3
      const initialCart = { id: "1", products: [{ id, amount: initialAmount }] }
      const expectedError = new ApplicationError(
        `It is not possible to remove ${amountToRemove} items of the product "${id}" from the cart. ` +
          `The cart currently has ${initialAmount} items of this product.`
      )

      getCartInstanceMock.mockResolvedValueOnce(initialCart)

      expect(shoppingCartService.removeItemFromCart(id, amountToRemove)).rejects.toThrow(
        expectedError
      )
    })

    it("blocks removal of a product not present in the cart", async () => {
      const id = "2"
      const amountToRemove = 1
      const initialCart = { id: "1", products: [{ id: "1", amount: 3 }] }
      const expectedError = new ApplicationError(
        `The product with id "${id}" was not added in the cart.`
      )

      getCartInstanceMock.mockResolvedValueOnce(initialCart)

      expect(shoppingCartService.removeItemFromCart(id, amountToRemove)).rejects.toThrow(
        expectedError
      )
    })

    it("blocks removal of a product not present in the database", async () => {
      const id = "1"
      const amountToRemove = 2
      const expectedError = new ApplicationError(`There is no product with id "${id}".`)

      existsProductWithGivenIdMock.mockResolvedValueOnce(false)

      expect(shoppingCartService.removeItemFromCart(id, amountToRemove)).rejects.toThrow(
        expectedError
      )
    })
  })

  describe("Close the cart", () => {
    it("closes a cart without free items", async () => {
      const cart = { id: "1", products: [{ id: "1", amount: 2 }] }
      const productsData = [{ id: "1", price: 12.99 }]

      getCartInstanceMock.mockResolvedValueOnce(cart)
      getDataFromProductsOnCartMock.mockResolvedValueOnce(productsData)

      const finalPrice = await shoppingCartService.closeCart()

      expect(finalPrice).toBe(25.98)
      expect(emptyCartMock).toHaveBeenCalled()
    })

    it("closes a cart with one free item", async () => {
      const cart = { id: "1", products: [{ id: "1", amount: 3 }] }
      const productsData = [{ id: "1", price: 12.99 }]

      getCartInstanceMock.mockResolvedValueOnce(cart)
      getDataFromProductsOnCartMock.mockResolvedValueOnce(productsData)

      const finalPrice = await shoppingCartService.closeCart()

      expect(finalPrice).toBe(25.98)
      expect(emptyCartMock).toHaveBeenCalled()
    })

    it("closes a cart with different products and one free item", async () => {
      const cart = {
        id: "1",
        products: [
          { id: "1", amount: 2 },
          { id: "2", amount: 2 },
        ],
      }
      const productsData = [
        { id: "1", price: 12.99 },
        { id: "2", price: 25 },
      ]

      getCartInstanceMock.mockResolvedValueOnce(cart)
      getDataFromProductsOnCartMock.mockResolvedValueOnce(productsData)

      const finalPrice = await shoppingCartService.closeCart()

      expect(finalPrice).toBe(62.99)
      expect(emptyCartMock).toHaveBeenCalled()
    })

    it("closes a cart with different products and two free item from the cheapest products", async () => {
      const cart = {
        id: "1",
        products: [
          { id: "1", amount: 1 },
          { id: "2", amount: 2 },
          { id: "3", amount: 3 },
        ],
      }
      const productsData = [
        { id: "1", price: 12.99 },
        { id: "2", price: 25 },
        { id: "3", price: 20.65 },
      ]

      getCartInstanceMock.mockResolvedValueOnce(cart)
      getDataFromProductsOnCartMock.mockResolvedValueOnce(productsData)

      const finalPrice = await shoppingCartService.closeCart()

      expect(finalPrice).toBe(91.3)
      expect(emptyCartMock).toHaveBeenCalled()
    })

    it("blocks closing a cart with no items", async () => {
      const cart = {
        id: "1",
        products: [],
      }
      const expectedError = new ApplicationError(`The cart is empty.`)

      getCartInstanceMock.mockResolvedValueOnce(cart)

      expect(shoppingCartService.closeCart()).rejects.toThrow(expectedError)
    })

    it("blocks closing a cart with items summing up to 0 total amount", async () => {
      const cart = {
        id: "1",
        products: [
          { id: "1", amount: 0 },
          { id: "2", amount: 0 },
          { id: "3", amount: 0 },
        ],
      }
      const expectedError = new ApplicationError(`The cart is empty.`)

      getCartInstanceMock.mockResolvedValueOnce(cart)

      expect(shoppingCartService.closeCart()).rejects.toThrow(expectedError)
    })
  })
})
