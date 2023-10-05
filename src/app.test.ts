import request from "supertest"
import app from "./app"
import { dbConnect, dbDisconnect, dbPopulate } from "./databases/MongoMemoryServer"

jest.setTimeout(20 * 1000)

describe("App e2e test", () => {
  beforeAll(async () => {
    await dbConnect()
    await dbPopulate()
  })

  afterAll(async () => {
    await dbDisconnect()
  })

  it("closes a cart without discount", async () => {
    await request(app).post("/shopping-cart/addItem").send({ id: "1", amount: 2 })
    const response = await request(app).post("/shopping-cart/closeCart")
    expect(response.statusCode).toBe(200)
    expect(response.body.message).toBe("Success")
    expect(response.body.totalPrice).toBe(25.98)
  })

  it("closes a cart with discount on lowest prices products", async () => {
    await request(app).post("/shopping-cart/addItem").send({ id: "1", amount: 3 })
    await request(app).post("/shopping-cart/addItem").send({ id: "2", amount: 3 })
    await request(app).post("/shopping-cart/addItem").send({ id: "3", amount: 3 })
    await request(app).post("/shopping-cart/removeItem").send({ id: "1", amount: 2 })
    await request(app).post("/shopping-cart/removeItem").send({ id: "2", amount: 1 })
    const response = await request(app).post("/shopping-cart/closeCart")
    expect(response.statusCode).toBe(200)
    expect(response.body.message).toBe("Success")
    expect(response.body.totalPrice).toBe(91.3)
  })

  it("returns a bad request response when there is an application exception", async () => {
    const response = await request(app)
      .post("/shopping-cart/removeItem")
      .send({ id: "1", amount: 1 })
    expect(response.statusCode).toBe(400)
    expect(response.text).toBe(`The product with id "1" was not added in the cart.`)
  })
})
