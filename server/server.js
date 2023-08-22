const express = require('express')
const cors = require('cors')
const app = express()
const router = express.Router()
const PORT = process.env.port || 4001
// import firestore instance
const {db} = require("./firebase");
const { collection, addDoc, serverTimestamp, where, getDocs, query, doc, getDoc, updateDoc, orderBy, limit } = require("firebase/firestore");
const { queryPaymentSent,queryPaymentReceived } = require('./modules/etherScan')


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
const PaymentRequestRef = collection(db,"PaymentRequests")

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

/* ------------------------- BASE & DB Query Endpoints ------------------------- */

// GET Request: Query Activities (Payment Sent, Payment Reveived, Request Sent, Request Received)
// returns back an array of Activity (Sorted By timestamp)
/*
Activity Object Structure 
{
    "activityId" : "01hlEmQYIz6Dpr8ACpOa" <-- doc ID for DB query, txn hash for ethereum query
    "activityType" : "Payment Sent", <--- enum type (Payment Sent, Payment Reveived, Request Sent, Request Received)
    "activityState" : "Processed", <--- enmu type (Processed , Rejected, Pending, Failed)
    "counterParty" : "0x9dD82EE27cc23B343f186756771904E0386973f1" <--- For "Payment Sent" and "Request Sent" it will be the Payment / Request Recipient. For "Payment Received" and "Request Received", its will be the Payment / Request Sender
    "amount" : "0.001",
    "timestamp" : "8/20/2023, 11:01:00 PM" <--- will be request time instead of completion time for "request type". will be txn completion time for "payment type"
}

*/

router.post('/activties/:userAddress', async (req,res) => {
    try {
        const userAddress = req.params.userAddress
        const { etherscanDomain } = req.body
        const activities = []

        // query activties
        const requestSendActivities = await queryPaymentRequestSent(userAddress)
        const requestReceivedActivities = await queryPaymentRequestReceived(userAddress)
        //const paymentSendActivities = await queryPaymentSent(etherscanDomain,userAddress)
        //const paymentReceivedActivities = await queryPaymentReceived(etherscanDomain,userAddress)

        //console.log(paymentSendActivities)

        //activities.push(...requestSendActivities, ...requestReceivedActivities, ...paymentSendActivities, ...paymentReceivedActivities);
        activities.push(...requestSendActivities, ...requestReceivedActivities);

        // sort the activities array by timestamp in descending order (latest appears as first)
        activities.sort((a, b) => {
            const timestampA = a.timestamp.seconds * 1000 + a.timestamp.nanoseconds / 1000000;
            const timestampB = b.timestamp.seconds * 1000 + b.timestamp.nanoseconds / 1000000;
            return timestampB - timestampA;
          });

        console.log(`${currentDateAndTime}: User ${userAddress} have ${activities.length} activities in our application`)
        return res.status(200).json(activities)
    } 
    catch(error) {
        console.log(`${currentDateAndTime}: ${error.message}`)
        return res.status(500).send(error.message)
    }
})

/* ------------------------- Helper Functions ------------------------- */
// query all PaymentRequest that payment_requester matches userId
// returns a array of Activity Object: "Request Sent"
const queryPaymentRequestSent = async(userAddress) => {
    try {
        const result = []
        const request_requester = userAddress
        const q = query(PaymentRequestRef,where('payment_requester', '==', request_requester))
        const querySnapshot = await getDocs(q)
        querySnapshot.forEach(documentSnapshot => {
            const documentData = documentSnapshot.data()

            const { transaction_state, request_recipient, ether_amount, request_time } = documentData
            
            result.push({
                activityId : documentSnapshot.id,
                activityType : "Request Sent",
                activityState : transaction_state,
                counterParty : request_recipient,
                amount : ether_amount,
                timestamp : request_time
            })

            
        })
        return result
    } 
    catch(error) {
        return error.message
    }
}


// query all PaymentRequest that request_recipient matchs userId
// returns a array of Activity Object: "Request Received"
const queryPaymentRequestReceived = async(userAddress) => {
    try {
        const result = []
        const request_recipient = userAddress
        const q = query(PaymentRequestRef,where('request_recipient', '==', request_recipient))
        const querySnapshot = await getDocs(q)
        querySnapshot.forEach(documentSnapshot => {
            const documentData = documentSnapshot.data()

            const { transaction_state, payment_requester, ether_amount, request_time } = documentData
            
            result.push({
                activityId : documentSnapshot.id,
                activityType : "Request Received",
                activityState : transaction_state,
                counterParty : payment_requester,
                amount : ether_amount,
                timestamp : request_time
            })
        })
        return result
    } 
    catch(error) {
        return error.message
    }
}



/* ------------------------- Private Chatroom Related Endpoints ------------------------- */
const PrivateChatRoomsRef = collection(db,"PrivateChatRooms")

// GET Request: Query PrivateChatRooms by user UID
// Returns back an array custom chatroom object for front-end display
router.get('/get-private-chatroom/:userId', async (req, res) => {
    try {
        // destructure request params
        const userId = req.params.userId;

        // empty array for returning response
        const response = [];
        const queryResultId = [];
        // create an array of promises for subcollection queries
        const subCollectionPromises = [];

        // start to query PrivateChatRooms document that's a user participated in
        const q = query(PrivateChatRoomsRef, where("participants", "array-contains", userId));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(documentSnapshot => {
            
            // push chatroom id to the queryResultId 
            queryResultId.push(documentSnapshot.id);
            
            const { participants } = documentSnapshot.data();

            // start to query the sub-collection "Messages" within a PrivateChatRoom
            const subCollectionQuery = query(collection(db, "PrivateChatRooms", documentSnapshot.id, "Messages"), orderBy("timestamp", "desc"), limit(1));
            subCollectionPromises.push(getDocs(subCollectionQuery).then(subCollectionQuerySnapshot => {
                const latestMessage = subCollectionQuerySnapshot.docs[0];

                if (latestMessage) {
                    const { from, message, timestamp } = latestMessage.data();
                    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
                    const formattedDate = date.toLocaleString('en-US', { timeZone: 'America/Toronto' });

                    const chatWithResponse = {
                        chatWith: findChatWith(participants, userId),
                        lastestMessageFrom: from,
                        lastestMessage: message,
                        lastestMessageTimeStamp: formattedDate
                    };

                    response.push(chatWithResponse);
                }
            }));
        });

        // Wait for all subcollection queries to complete
        await Promise.all(subCollectionPromises);

        console.log(`${currentDateAndTime}: There are ${queryResultId.length} ongoing chats for user ${userId}: ${queryResultId}`);
        console.log(`User ${userId} is participated in below chats: ${JSON.stringify(response)}`);
        return res.status(200).json(response);
    } catch (error) {
        console.log(`${currentDateAndTime}: ${error.message}`);
        return res.status(500).send(error.message);
    }
});

// POST Request: Create a PrivateChatRoom document
// returns back the newly created document id 
// @dev add validation logic to make sure same pair of participants only exist once in the DB
router.post('/create-private-chatroom', async (req,res) => {
    try {
        const {currentUserId, secondUserId} = req.body
        const data = { participants : [currentUserId, secondUserId] }

        const newDocRef = await addDoc(PrivateChatRoomsRef, data)
        console.log(`${currentDateAndTime}: Created new PrivateChatRoom with ID: ${newDocRef.id}`)
        return res.status(200).json(newDocRef.id)    

    } catch(error){
        console.log(`${currentDateAndTime}: ${error.message}`);
        return res.status(500).send(error.message);
    }
})

/* ------------------------- Helper Functions ------------------------- */
const findChatWith = (userList, userId) => {
    for (const user of userList) {
        if (user !== userId) {
            return user
        }
    }
}
/* ----- Start Server ----- */
app.use('/', router)

app.listen(PORT, ()=> {
    console.log(`Server listening on ${PORT}`)
})