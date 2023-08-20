const express = require('express')
const cors = require('cors')
const app = express()
const router = express.Router()
const PORT = process.env.port || 4000
// import firestore instance
const {db} = require("./firebase");
// Returns back a CollectionReference of PaymentRequests & PrivateChatRooms
const { collection, addDoc, serverTimestamp, where, getDocs, query, doc, getDoc, updateDoc } = require("firebase/firestore");
const PaymentRequestRef = collection(db,"PaymentRequests")
const PrivateChatRoomsRef = collection(db,"PrivateChatRooms")

// Middlewares
const currentDateAndTime = new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' });
app.use(cors())
app.use(express.json())

/* ----- Define Routes ----- */

// Landing Route
router.get("/", (req,res) => {
    res.send("<h1>Server On!!!</h1>")
})

/* ------------------------- Payment Request Related Endpoints ------------------------- */

// POST Request: Create a "payment request document" to the "payment request collection" 
// returns back the newly created document id 
router.post('/create-payment-request', async (req,res) => {
    try {
        const {payment_requester, request_recipient, ether_amount, transaction_message} = req.body

        if (ether_amount <= 0){
            console.log(`${currentDateAndTime}: Invalid transaction amount`)
            return res.status(400).send("Invalid transaction amount")
        }

        if (payment_requester == request_recipient) {
            console.log(`${currentDateAndTime}: Invalid receipient: You are no allowed to send funds to your own address`)
            return res.status(400).send("Invalid receipient: You are no allowed to send funds to your own address")
        }

        const data = {
            payment_requester : payment_requester,
            request_recipient : request_recipient,
            ether_amount : ether_amount,
            transaction_message : transaction_message,
            transaction_state : "Pending",
            request_time: serverTimestamp(),
            transaction_completion_time: false,
            transaction_hash: false 
        }
        
        // Add a new payment request document with an auto-generated ID.
        const newDocumentRef = await addDoc(PaymentRequestRef, data)
        console.log(`${currentDateAndTime}: Added new payment request document with id: ${newDocumentRef.id}`)
        return res.status(200).json(newDocumentRef.id)

    } 
    catch(error) {
        console.log(`${currentDateAndTime}: ${error.message}`)
        return res.status(500).send(error.message)
    }
})

// GET Request: Query payment request by request recipient
// Returns back an array of payment request document
router.get('/get-payment-request/:requestRecipient', async (req,res) => {
    try {
        const queryResult = []
        const queryResultId = []
        const request_recipient = req.params.requestRecipient
        const q = query(PaymentRequestRef,where('request_recipient', '==', request_recipient))
        const querySnapshot = await getDocs(q)
        querySnapshot.forEach(documentSnapshot => {
            const documentData = documentSnapshot.data()
            queryResultId.push(documentSnapshot.id)
            queryResult.push(documentData)
        })
        console.log(`${currentDateAndTime}: There are ${queryResultId.length} documents matchs the query: ${queryResultId}`)
        return res.status(200).json(queryResult)
    } 
    catch(error) {
        console.log(`${currentDateAndTime}: ${error.message}`)
        return res.status(500).send(error.message)
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
        const targetDocumentRef = doc(db, 'PaymentRequests', payment_request_id)
        const targetDocumentSnap = await getDoc(targetDocumentRef)

        // edge case handling: If the provided paymentRequestId do no exist in db
        if (!targetDocumentSnap.exists()) {
            console.log(`${currentDateAndTime}: Bad request: No such payment request document`)
            return res.status(400).send("No such payment request document") 
        }

        // update the payment request document
        if (decision) {
            const updatedData = {
                transaction_state : "Processed",
                transaction_completion_time : serverTimestamp()
            }
            // update the transaction state
            await updateDoc(targetDocumentRef,updatedData) // returning void
            
        } else{
            const updatedData = {
                transaction_state : "Rejected",
                transaction_completion_time : serverTimestamp()
            }
            // update the transaction state
            await updateDoc(targetDocumentRef,updatedData) // returning void
        }
        
        // return the updated payment document data
        const updatedTargetDocumentRef = doc(db, 'PaymentRequests', payment_request_id)
        const updatedTargetDocumentSnap = await getDoc(updatedTargetDocumentRef)
        const updatedTargetDocumentData = updatedTargetDocumentSnap.data()
    
        console.log(`${currentDateAndTime}: Here is the updated document: `,updatedTargetDocumentData)
        return res.status(200).json(updatedTargetDocumentData)
    } 
    catch(error) {
        return res.status(500).send(error.message)
    }
})

//PATCH Request: Update payment request's transaction Hash
// Returns back the entire updated document
router.patch('/update-transaction-hash/:paymentRequestId/:transactionHash', async (req,res) => {
    try {
        // Destructure request params
        const payment_request_id = req.params.paymentRequestId
        const transaction_hash = req.params.transactionHash

        // get target payment request document
        const targetDocumentRef = doc(db, 'PaymentRequests', payment_request_id)
        const targetDocumentSnap = await getDoc(targetDocumentRef)

        // edge case handling: If the provided paymentRequestId do no exist in db
        if (!targetDocumentSnap.exists()) {
            console.log(`${currentDateAndTime}: Bad request: No such payment request document`)
            return res.status(400).send("No such payment request document") 
        }

        // upate target payment request document
        await updateDoc(targetDocumentRef,{transaction_hash : transaction_hash}) // returning void

        // return the updated payment document data
        const updatedTargetDocumentRef = doc(db, 'PaymentRequests', payment_request_id)
        const updatedTargetDocumentSnap = await getDoc(updatedTargetDocumentRef)
        const updatedTargetDocumentData = updatedTargetDocumentSnap.data()
    
        console.log(`${currentDateAndTime}: Here is the updated document: `,updatedTargetDocumentData)
        return res.status(200).json(updatedTargetDocumentData)
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