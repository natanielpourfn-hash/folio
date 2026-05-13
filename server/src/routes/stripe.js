'use strict'

const express = require('express')
const router = express.Router()

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const PRICE_ID = process.env.STRIPE_PRICE_ID
const APP_URL = process.env.APP_URL || 'http://localhost:3000'

// POST /api/stripe/checkout — crée une session de paiement
router.post('/checkout', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/pricing`,
      locale: 'fr',
      allow_promotion_codes: true,
    })
    res.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err.message)
    res.status(500).json({ error: 'Impossible de créer la session de paiement.' })
  }
})

// POST /api/stripe/webhook — reçoit les événements Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event
  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
    } else {
      event = JSON.parse(req.body)
    }
  } catch (err) {
    console.error('Webhook error:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  switch (event.type) {
    case 'checkout.session.completed':
      console.log('✅ Paiement réussi:', event.data.object.customer_email)
      break
    case 'customer.subscription.deleted':
      console.log('❌ Abonnement annulé:', event.data.object.customer)
      break
    case 'invoice.payment_failed':
      console.log('⚠️ Paiement échoué:', event.data.object.customer_email)
      break
    default:
      break
  }

  res.json({ received: true })
})

// GET /api/stripe/portal — portail client pour gérer l'abonnement
router.post('/portal', async (req, res) => {
  const { customerId } = req.body
  if (!customerId) return res.status(400).json({ error: 'customerId requis.' })

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${APP_URL}/pricing`,
    })
    res.json({ url: session.url })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
