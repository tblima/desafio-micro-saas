import stripe from "@/app/lib/stripe";
import { handleStripeCancelSubscription } from "@/app/server/stripe/handle-cancel";
import { handleStripePayment } from "@/app/server/stripe/handle-payment";
import { handleStripeSubscription } from "@/app/server/stripe/handle-subscription";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.STRIPE_WEBHOOK_SECRET

if(!secret) {
	throw new Error("STRIPE_WEBHOOK_SECRET is not set")
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.text()
		const headersList = await headers()
		const signature = headersList.get("stripe-signature")

		if(!signature || !secret) {
			return NextResponse.json({ error: "No signature or secret" }, { status: 400 })
		}

		const event = stripe.webhooks.constructEvent(body, signature, secret)

		switch(event.type) {
			case "checkout.session.completed": // Pagamento realizado se status = paid - Pode ser tanto pagamnto único quanto assinatura
				const metadata = event.data.object.metadata

				if(metadata?.price === process.env.STRIPE_PRODUCT_PRICE_ID) {
					await handleStripePayment(event)
				}
				if(metadata?.price === process.env.STRIPE_SUBSCRIPTION_PRICE_ID) {
					await handleStripeSubscription(event)
				}

				break
			case "checkout.session.expired": // Expirou o tempo de pagamento
				console.log("Enviar um email para o cliente informando que o pagamento expirou")
				break
			case "checkout.session.async_payment_succeeded": // Boleto pago
				console.log("Enviar um email para o cliente informando que o pagamento foi confirmado")
				break
			case "checkout.session.async_payment_failed": // Boleto falhou
			console.log("Enviar um email para o cliente informando que o pagamento falhou")
				break
			case "customer.subscription.created": // Criou a assinatura
				console.log("Mensagem de boas-vindas para o cliente")
				break
			case "customer.subscription.updated": // Atualizou a assinatura
				console.log("Atualizou a assinatura")
				break
			case "customer.subscription.deleted": // Cancelou a assiantura
				await handleStripeCancelSubscription(event)
				break
			default:
				console.log(`Unhandled event type ${event.type}`)
		}

		return NextResponse.json({ message: "Webhook received" }, { status: 200 })
	} catch(error) {
		console.error(error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}