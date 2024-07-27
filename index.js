const admin = require('firebase-admin');
const express = require('express');
const app = express();
const port = 3000;

// Initialize Firebase Admin SDK
const serviceAccount = require('./Key.json'); // Replace with your service account key file
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  ignoreUndefinedProperties: true // Enable this option
});

const db = admin.firestore();

app.get('/data/:groups/:month/:week', async (req, res) => {
  const groups = req.params.groups || '';
  const month = req.params.month || '';
  const week = req.params.week ? parseInt(req.params.week, 10) : 0; // Convert week to a number

  if (!groups || !month || isNaN(week)) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  console.log('Received parameters:', { groups, month, week });

  try {
    // Query the collection for the document matching the criteria
    const querySnapshot = await db.collection('worksheets')
      .where('groups', '==', groups)
      .where('month', '==', month)
      .where('week', '==', week) // Now comparing as a number
      .get();

    if (querySnapshot.empty) {
      console.error('No matching documents found');
      return res.status(404).json({ error: 'Document not found' });
    }

    // Retrieve the 'worksheet' field from the first matching document
    const worksheetData = querySnapshot.docs[0].data().worksheet;

    res.json({ data: worksheetData });
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
