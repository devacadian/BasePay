const express = require('express')
const cors = require('cors')
const firebase = require('firebase');
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
        const {payment_requester, request_recipient, ether_amount, transaction_message} = req.body

        const data = {
            payment_requester : payment_requester,
            request_recipient : request_recipient,
            ether_amount : ether_amount,
            transaction_message : transaction_message,
            transaction_state : "Pending",
            request_time: firebase.firestore.FieldValue.serverTimestamp(),
            transaction_completion_time: false
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

//PATCH Request: Update payment request's transaction state
// Returns back the entire updated document
// decision = true if user accepts request
// decision = false if user rejects request
// @dev get back to this function how how to verify update result
router.patch('/update-transaction-state/:paymentRequestId', async (req,res) => {
    try {
        // Destructure request params and body
        const payment_request_id = req.params.paymentRequestId
        const { decision } = req.body

        // query the target payment request documnet
        const targetDocument = PaymentRequestRef.doc(payment_request_id)

        // update the payment request document
        if (decision) {
            const updatedData = {
                transaction_state : "Processed",
                transaction_completion_time : firebase.firestore.FieldValue.serverTimestamp()
            }
            await targetDocument.update(updatedData) // returning void
        } else{
            const updatedData = {
                transaction_state : "Rejected",
                transaction_completion_time : firebase.firestore.FieldValue.serverTimestamp()
            }
            await targetDocument.update(updatedData) // returning void
        }
        // return the updated payment document data
        const updatedTargetDocument = await PaymentRequestRef.doc(payment_request_id).get()
        const updatedTargetDocumentData = await updatedTargetDocument.data()
        console.log(`Here is the updated document: `,updatedTargetDocumentData)
        res.status(200).json(updatedTargetDocumentData)
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