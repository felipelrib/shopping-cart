import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import { dbConnect, dbDisconnect, dbPopulate } from "./MongoMemoryServer"

const mongoMemoryServerCreateMock = MongoMemoryServer.create as jest.Mock
const mongooseConnectMock = mongoose.connect as jest.Mock
const mongooseDisconnectMock = mongoose.disconnect as jest.Mock
const getUriMock = jest.fn()
const stopMock = jest.fn()
const populateProductsMock = jest.fn()

mongoMemoryServerCreateMock.mockResolvedValue({
  getUri: getUriMock,
  stop: stopMock,
})

jest.mock("mongoose")
jest.mock("mongodb-memory-server")
jest.mock("../shopping-cart/models/mongo/ShoppingCartMongoModel", () => ({
  ShoppingCartMongoModel: jest.fn().mockImplementation(() => ({
    populateProductsContainer: populateProductsMock,
  })),
}))

describe("Mongo Memory Server tests", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it("starts a server and connect mongoose to it", async () => {
    const uriMock = "test"
    getUriMock.mockReturnValueOnce(uriMock)

    await dbConnect()

    expect(mongoMemoryServerCreateMock).toHaveBeenCalled()
    expect(mongooseConnectMock).toHaveBeenCalledWith(uriMock)
  })

  it("disconnects mongoose and stops the server", async () => {
    await dbDisconnect()

    expect(stopMock).toHaveBeenCalled()
    expect(mongooseDisconnectMock).toHaveBeenCalled()
  })

  it("populate the server with initial data", async () => {
    const expectedData = [{ id: "1" }, { id: "2" }, { id: 3 }]

    jest.mock("../shopping-cart/products.json", () => expectedData)

    await dbPopulate()

    expect(populateProductsMock).toBeCalledWith(expectedData)
  })
})
