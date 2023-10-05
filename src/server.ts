import app from "./app"
import { dbConnect, dbPopulate } from "./databases/MongoMemoryServer"

dbConnect().then(async (_) => {
  await dbPopulate()
  const PORT = process.env.PORT ?? 3000
  app.listen(PORT)
  console.log(`Server started at port ${PORT}`)
})
