import app from "./app"
import connectDB from "./config/db.config";

const port = 5000

app.listen(port, async ():Promise<void> => {
    await connectDB()
    console.log(`Server started on port ${port}`)
})