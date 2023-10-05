import express from "express"
import request from "supertest"

const processAddItemRequestMock = jest.fn()
const processRemoveItemRequestMock = jest.fn()
const processCloseCartRequestMock = jest.fn()

jest.mock("./ShoppingCartController", () => ({
  ShoppingCartController: jest.fn().mockImplementation(() => ({
    processAddItemRequest: processAddItemRequestMock,
    processRemoveItemRequest: processRemoveItemRequestMock,
    processCloseCartRequest: processCloseCartRequestMock,
  })),
}))

import ShoppingCartRoutes from "./ShoppingCartRoutes"

const app = express()

app.use("/", ShoppingCartRoutes)

describe("Shopping Cart Routes tests", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it("has a POST route to /addItem", async () => {
    processAddItemRequestMock.mockImplementationOnce((req, res) => {
      return res.send("success")
    })

    await request(app).post("/addItem")

    expect(processAddItemRequestMock).toHaveBeenCalled()
  })

  it("has a POST route to /removeItem", async () => {
    processRemoveItemRequestMock.mockImplementationOnce((req, res) => {
      return res.send("success")
    })

    await request(app).post("/removeItem")

    expect(processRemoveItemRequestMock).toHaveBeenCalled()
  })

  it("has a POST route to /closeCart", async () => {
    processCloseCartRequestMock.mockImplementationOnce((req, res) => {
      return res.send("success")
    })

    await request(app).post("/closeCart")

    expect(processCloseCartRequestMock).toHaveBeenCalled()
  })
})
