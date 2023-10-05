import { Request, Response } from "express"
import { ShoppingCartController } from "./ShoppingCartController"
import { ShoppingCartMongoModel } from "./models/mongo/ShoppingCartMongoModel"
import ApplicationError from "../errors/ApplicationError"

const jsonMock = jest.fn()
const sendMock = jest.fn()
const statusMock = jest.fn()
const res = {
  json: jsonMock.mockReturnThis(),
  send: sendMock.mockReturnThis(),
  status: statusMock.mockReturnThis(),
} as unknown as Response

const addItemToCartMock = jest.fn()
const removeItemFromCartMock = jest.fn()
const closeCartMock = jest.fn()

jest.mock("./models/mongo/ShoppingCartMongoModel")
jest.mock("./ShoppingCartService", () => ({
  ShoppingCartService: jest.fn().mockImplementation(() => ({
    addItemToCart: addItemToCartMock,
    removeItemFromCart: removeItemFromCartMock,
    closeCart: closeCartMock,
  })),
}))

describe("Shopping Cart Controller tests", () => {
  const shoppingCartModel = new ShoppingCartMongoModel()
  const shoppingCartController = new ShoppingCartController(shoppingCartModel)

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("Process Add Item Request tests", () => {
    it("processes a successful request to add item to a cart", async () => {
      const body = { id: "1", amount: 1 }
      const req = { body } as Request

      await shoppingCartController.processAddItemRequest(req, res)

      expect(addItemToCartMock).toHaveBeenCalledWith(body.id, body.amount)
      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith({ message: "Success" })
    })

    it("sends an error when the id is missing", async () => {
      const body = { amount: 1 }
      const req = { body } as Request

      await shoppingCartController.processAddItemRequest(req, res)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(sendMock).toHaveBeenCalledWith(`Id "undefined" must be a non-empty string.\n`)
    })

    it("sends an error when the id is not a string", async () => {
      const body = { id: 1, amount: 1 }
      const req = { body } as Request

      await shoppingCartController.processAddItemRequest(req, res)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(sendMock).toHaveBeenCalledWith(`Id "1" must be a non-empty string.\n`)
    })

    it("sends an error when the amount is missing", async () => {
      const body = { id: "1" }
      const req = { body } as Request

      await shoppingCartController.processAddItemRequest(req, res)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(sendMock).toHaveBeenCalledWith(`Amount "undefined" must be a positive integer.\n`)
    })

    it("sends an error when the amount is not a number", async () => {
      const body = { id: "1", amount: "1" }
      const req = { body } as Request

      await shoppingCartController.processAddItemRequest(req, res)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(sendMock).toHaveBeenCalledWith(`Amount "1" must be a positive integer.\n`)
    })

    it("sends an error when the amount is not an integer", async () => {
      const body = { id: "1", amount: 1.5 }
      const req = { body } as Request

      await shoppingCartController.processAddItemRequest(req, res)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(sendMock).toHaveBeenCalledWith(`Amount "1.5" must be a positive integer.\n`)
    })

    it("sends an error when the amount is not a positive integer", async () => {
      const body = { id: "1", amount: -1 }
      const req = { body } as Request

      await shoppingCartController.processAddItemRequest(req, res)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(sendMock).toHaveBeenCalledWith(`Amount "-1" must be a positive integer.\n`)
    })

    it("sends an error when both the amount and the id are missing", async () => {
      const body = {}
      const req = { body } as Request

      await shoppingCartController.processAddItemRequest(req, res)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(sendMock).toHaveBeenCalledWith(
        `Id "undefined" must be a non-empty string.\nAmount "undefined" must be a positive integer.\n`
      )
    })

    it("sends an error when an application exception occurs", async () => {
      const body = { id: "1", amount: 1 }
      const req = { body } as Request
      const expectedError = new ApplicationError("test")

      addItemToCartMock.mockRejectedValueOnce(expectedError)
      await shoppingCartController.processAddItemRequest(req, res)

      expect(addItemToCartMock).toHaveBeenCalledWith(body.id, body.amount)
      expect(statusMock).toHaveBeenCalledWith(400)
      expect(sendMock).toHaveBeenCalledWith(`${expectedError.message}`)
    })

    it("sends an error when an unexpected exception occurs", async () => {
      const body = { id: "1", amount: 1 }
      const req = { body } as Request
      const expectedError = new Error("test")

      addItemToCartMock.mockRejectedValueOnce(expectedError)
      await shoppingCartController.processAddItemRequest(req, res)

      expect(addItemToCartMock).toHaveBeenCalledWith(body.id, body.amount)
      expect(statusMock).toHaveBeenCalledWith(500)
      expect(sendMock).toHaveBeenCalledWith(`Internal server error: ${expectedError.toString()}`)
    })
  })

  describe("Process Remove Item Request tests", () => {
    it("processes a successful request to remove item from a cart", async () => {
      const body = { id: "1", amount: 1 }
      const req = { body } as Request

      await shoppingCartController.processRemoveItemRequest(req, res)

      expect(removeItemFromCartMock).toHaveBeenCalledWith(body.id, body.amount)
      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith({ message: "Success" })
    })

    it("sends an error when the id is missing", async () => {
      const body = { amount: 1 }
      const req = { body } as Request

      await shoppingCartController.processRemoveItemRequest(req, res)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(sendMock).toHaveBeenCalledWith(`Id "undefined" must be a non-empty string.\n`)
    })

    it("sends an error when the id is not a string", async () => {
      const body = { id: 1, amount: 1 }
      const req = { body } as Request

      await shoppingCartController.processRemoveItemRequest(req, res)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(sendMock).toHaveBeenCalledWith(`Id "1" must be a non-empty string.\n`)
    })

    it("sends an error when the amount is missing", async () => {
      const body = { id: "1" }
      const req = { body } as Request

      await shoppingCartController.processRemoveItemRequest(req, res)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(sendMock).toHaveBeenCalledWith(`Amount "undefined" must be a positive integer.\n`)
    })

    it("sends an error when the amount is not a number", async () => {
      const body = { id: "1", amount: "1" }
      const req = { body } as Request

      await shoppingCartController.processRemoveItemRequest(req, res)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(sendMock).toHaveBeenCalledWith(`Amount "1" must be a positive integer.\n`)
    })

    it("sends an error when the amount is not an integer", async () => {
      const body = { id: "1", amount: 1.5 }
      const req = { body } as Request

      await shoppingCartController.processRemoveItemRequest(req, res)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(sendMock).toHaveBeenCalledWith(`Amount "1.5" must be a positive integer.\n`)
    })

    it("sends an error when the amount is not a positive integer", async () => {
      const body = { id: "1", amount: -1 }
      const req = { body } as Request

      await shoppingCartController.processRemoveItemRequest(req, res)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(sendMock).toHaveBeenCalledWith(`Amount "-1" must be a positive integer.\n`)
    })

    it("sends an error when both the amount and the id are missing", async () => {
      const body = {}
      const req = { body } as Request

      await shoppingCartController.processRemoveItemRequest(req, res)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(sendMock).toHaveBeenCalledWith(
        `Id "undefined" must be a non-empty string.\nAmount "undefined" must be a positive integer.\n`
      )
    })

    it("sends an error when an application exception occurs", async () => {
      const body = { id: "1", amount: 1 }
      const req = { body } as Request
      const expectedError = new ApplicationError("test")

      removeItemFromCartMock.mockRejectedValueOnce(expectedError)
      await shoppingCartController.processRemoveItemRequest(req, res)

      expect(removeItemFromCartMock).toHaveBeenCalledWith(body.id, body.amount)
      expect(statusMock).toHaveBeenCalledWith(400)
      expect(sendMock).toHaveBeenCalledWith(`${expectedError.message}`)
    })

    it("sends an error when an unexpected exception occurs", async () => {
      const body = { id: "1", amount: 1 }
      const req = { body } as Request
      const expectedError = new Error("test")

      removeItemFromCartMock.mockRejectedValueOnce(expectedError)
      await shoppingCartController.processRemoveItemRequest(req, res)

      expect(removeItemFromCartMock).toHaveBeenCalledWith(body.id, body.amount)
      expect(statusMock).toHaveBeenCalledWith(500)
      expect(sendMock).toHaveBeenCalledWith(`Internal server error: ${expectedError.toString()}`)
    })
  })

  describe("Process Close Cart Request tests", () => {
    it("processes a successful request to close a cart", async () => {
      const req = {} as Request
      const totalPrice = 35.45

      closeCartMock.mockResolvedValueOnce(totalPrice)
      await shoppingCartController.processCloseCartRequest(req, res)

      expect(closeCartMock).toHaveBeenCalledWith()
      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith({ message: "Success", totalPrice })
    })

    it("sends an error when an application exception occurs", async () => {
      const req = {} as Request
      const expectedError = new ApplicationError("test")

      closeCartMock.mockRejectedValueOnce(expectedError)
      await shoppingCartController.processCloseCartRequest(req, res)

      expect(closeCartMock).toHaveBeenCalledWith()
      expect(statusMock).toHaveBeenCalledWith(400)
      expect(sendMock).toHaveBeenCalledWith(`${expectedError.message}`)
    })

    it("sends an error when an unexpected exception occurs", async () => {
      const req = {} as Request
      const expectedError = new Error("test")

      closeCartMock.mockRejectedValueOnce(expectedError)
      await shoppingCartController.processCloseCartRequest(req, res)

      expect(closeCartMock).toHaveBeenCalledWith()
      expect(statusMock).toHaveBeenCalledWith(500)
      expect(sendMock).toHaveBeenCalledWith(`Internal server error: ${expectedError.toString()}`)
    })
  })
})
