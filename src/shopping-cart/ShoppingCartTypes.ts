export type Product = {
  id: string
  name: string
  price: number
}

export type Cart = {
  id: string
  products: {
    id: string
    amount: number
  }[]
}
