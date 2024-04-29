var express = require("express");
var router = express.Router();
const Subscription = require('../models/subscription');

// POST route to subscribe user to a club
router.post("/subscribe", async (req, res) => {
  const { clubId } = req.body;
  const userId = req.session.user;

  try {
    if (!clubId || !userId) {
      return res.status(400).json({ message: 'clubId and userId are required' });
    }

    // Find the subscription document for the given clubId
    let subscription = await Subscription.findOne({ clubId });

    // If the subscription document doesn't exist, create a new one
    if (!subscription) {
      subscription = new Subscription({ clubId, subc: [] });
    }

    // Check if the user is already subscribed
    if (subscription.subc.includes(userId)) {
      return res.status(400).json({ message: 'User is already subscribed' });
    }

    // Add the userId to the subscription array
    subscription.subc.push(userId);

    // Save the updated subscription document
    await subscription.save();

    // Send a success response
    res.status(200).json({ message: 'Subscription successful' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET route to check if the session user is subscribed to the club
router.get("/subscriptions/:clubId", async (req, res) => {
    const { clubId } = req.params;
    const userId = req.session.user;
  
    try {
      const subscription = await Subscription.findOne({ clubId });
  
        if (!subscription) {
          return res.status(200).json({ isSubscribed: false });
        }
  
        // Check if the user is subscribed
        const isSubscribed = subscription.subscribers?.includes(userId);

        if (!isSubscribed) {
          return res.status(200).json({ isSubscribed: true });
        }
  
        // Send the boolean value as a JSON response
        res.status(200).json({ isSubscribed });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET route to get the number of subscribers for a club
router.get("/subscriptions/length/:clubId", async (req, res) => {
  const { clubId } = req.params;

  try {
    // Find the subscription document for the given clubId
    const subscription = await Subscription.findOne({ clubId });

    if (!subscription) {
      return res.status(200).json({ length: 0 });
    }

    // Get the length of the subscription array
    const numberOfSubscribers = subscription.subc.length;

    // Send the number of subscribers as a JSON response
    res.status(200).json({ length: numberOfSubscribers });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
  
// DELETE route to unsubscribe user from a club
router.delete("/unsubscribe", async (req, res) => {
  const { clubId } = req.body;
  const userId = req.session.user;

  try {
    if (!clubId || !userId) {
      return res.status(400).json({ message: 'clubId and userId are required' });
    }

    const subscription = await Subscription.findOne({ clubId });

    if (!subscription || !subscription.subc.includes(userId)) {
      return res.status(400).json({ message: 'User is not subscribed to this club' });
    }

   subscription.subc = subscription.subc.filter(subscriberId => subscriberId !== userId);

    await subscription.save();

    res.status(200).json({ message: 'Unsubscription successful' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


module.exports = router;
