const express = require('express')
const cors = require('cors')
const app = express()
const router = express.Router()
const PORT = process.env.port || 4000
const {db} = require("./firebase");
const PaymentRequestRef = db.collection("PaymentRequests")

// Middlewares
app.use(cors())
app.use(express.json())

/* ----- Define Routes ----- */

// Landing Route
router.get("/", (req,res) => {
    res.send("<h1>Server On!!!</h1>")
})

// POST Request: Create a "payment request document" to the "payment request collection" 
// returns back the newly created document id 
router.post('/create-payment-request', async (req,res) => {
    try {
        const {payment_requester, request_recipient, ether_amount} = req.body

        const data = {
            payment_requester : payment_requester,
            request_recipient : request_recipient,
            ether_amount : ether_amount,
            transaction_state : "Pending"
        }
        
        // Add a new payment request document with an auto-generated ID.
        const newDocumentRef = await PaymentRequestRef.add(data)
        console.log(`Added new payment request document with id: ${newDocumentRef.id}`)
        res.status(200).json(newDocumentRef.id)

    } 
    catch(error) {
        res.status(500).send(error.message)
    }
})

//GET Request: Query payment by request recipient
// Returns back an array of payment request document
router.get('/get-payment-request/:requestRecipient', async (req,res) => {
    try {
        const queryResult = []
        const queryResultId = []
        const request_recipient = req.params.requestRecipient
        const query = PaymentRequestRef.where('request_recipient', '==', request_recipient)
        const querySnapshot = await query.get()
        querySnapshot.forEach(documentSnapshot => {
            const documentData = documentSnapshot.data()
            queryResultId.push(documentSnapshot.id)
            queryResult.push(documentData)
        })
        console.log(`These document matchs the query: ${queryResultId}`)
        res.status(200).json(queryResult)
    } 
    catch(error) {
        res.status(500).send(error.message)
    }
})

/* ----- Start Server ----- */
app.use('/', router)

app.listen(PORT, ()=> {
    console.log(`Server listening on ${PORT}`)
})