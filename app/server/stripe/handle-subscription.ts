import { db } from "@/app/lib/firebase";
import resend from "@/app/lib/resend";
import "server-only"

import Stripe from "stripe";

export async function handleStripeSubscription(event: Stripe.CheckoutSessionCompletedEvent) {
	if(event.data.object.payment_status === "paid") {
		console.log("Pagamento realizado com sucesso. Enviar um email e liberar o acesso.")

		const metadata = event.data.object.metadata

		const userEmail = event.data.object.customer_email

		const userId = metadata?.userId

		if(!userId || !userEmail) {
			console.log("User ID not found")
			return
		}

		await db.collection("users").doc(userId).update({
			stripeSubscriptionId: event.data.object.subscription,
			subscriptionStatus: "active"
		})

		const { data, error } = await resend.emails.send({
			from: 'Thiago Bittencourt Lima <thiago.b.lima@icloud.com>',
			to: [userEmail],
			subject: 'Assinatura ativada com sucesso',
			text: 'Assinatura ativada com sucesso',
		});

		if(error) {
			console.log("Error sending email:", error)
			return
		}
		console.log("Email sent successfully:", data)
	}
}