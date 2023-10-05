import { Request, Response } from "express"
import ApplicationError from "../errors/ApplicationError"
import { ShoppingCartService } from "./ShoppingCartService"
import { ShoppingCartBaseModel } from "./models/ShoppingCartBaseModel"

export class ShoppingCartController {
  private shoppingCartService: ShoppingCartService

  constructor(shoppingCartModel: ShoppingCartBaseModel) {
    this.shoppingCartService = new ShoppingCartService(shoppingCartModel)
  }

  private idIsValid = (id: string): boolean => {
    return !!id && typeof id === "string" && id !== ""
  }

  private amountIsValid = (amount: number): boolean => {
    return !!amount && Number.isInteger(amount) && amount > 0
  }

  private validateParameters = (
    id: string,
    amount: number
  ): { parametersAreValid: boolean; errorMessage: string } => {
    let errorMessage: string = ""

    if (!this.idIsValid(id)) {
      errorMessage += `Id "${id}" must be a non-empty string.\n`
    }
    if (!this.amountIsValid(amount)) {
      errorMessage += `Amount "${amount}" must be a positive integer.\n`
    }

    return { parametersAreValid: !errorMessage, errorMessage }
  }

  private handleError = (error: Error | unknown, res: Response): void => {
    if (error instanceof ApplicationError) {
      res.status(400).send(error.message)
    } else {
      res.status(500).send(`Internal server error: ${error}`)
    }
  }

  processAddItemRequest = async (req: Request, res: Response) => {
    try {
      const { id, amount }: { id: string; amount: number } = req.body

      const { parametersAreValid, errorMessage } = this.validateParameters(id, amount)
      if (!parametersAreValid) {
        return res.status(400).send(errorMessage)
      }

      await this.shoppingCartService.addItemToCart(id, amount)

      res.status(200).json({ message: "Success" })
    } catch (error) {
      this.handleError(error, res)
    }
  }

  processRemoveItemRequest = async (req: Request, res: Response) => {
    try {
      const { id, amount }: { id: string; amount: number } = req.body

      const { parametersAreValid, errorMessage } = this.validateParameters(id, amount)
      if (!parametersAreValid) {
        return res.status(400).send(errorMessage)
      }

      await this.shoppingCartService.removeItemFromCart(id, amount)

      res.status(200).json({ message: "Success" })
    } catch (error) {
      this.handleError(error, res)
    }
  }

  processCloseCartRequest = async (_req: Request, res: Response) => {
    try {
      const totalPrice: number = await this.shoppingCartService.closeCart()

      res.status(200).json({ message: "Success", totalPrice })
    } catch (error) {
      this.handleError(error, res)
    }
  }
}
