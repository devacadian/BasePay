import axios from 'axios'

// first fetch all Request Type Activity from Firestore
async function fetchActivities(userAddress) {
    const expressApiUrl = `https://basepay-api.onrender.com/activties/${userAddress}`
    const response = await axios.get(expressApiUrl)
    return activities.data
}

// fetch all Payment Type Activity from Etherscan


// Sort result from the above fetches by timestamp