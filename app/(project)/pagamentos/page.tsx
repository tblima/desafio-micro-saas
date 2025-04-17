"use client"

import { useStripe } from "@/app/hooks/useStripe"
import useMercadoPago from "@/app/hooks/useMercadoPago"

export default function Pagamentos() {

	const  {
		createPaymentStripeCheckout,
		createSubscriptionStripeCheckout,
		handleCreateStripePortal
	} = useStripe()

	const { createMercadoPagoCheckout } = useMercadoPago()

	return (
		<div className="flex flex-col gap-10 items-center justify-center h-screen">
		  	<h1 className="text-4xl font-bold">Protected Dashboard</h1>
			<button className="border rounded-md px-1" onClick={() => createPaymentStripeCheckout({
				testeId: "123"
			})}>Criar Pagamento Stripe</button>
			<button className="border rounded-md px-1" onClick={() => createSubscriptionStripeCheckout({
				testeId: "123"
			})}>Criar Assinatura Stripe</button>
			<button className="border rounded-md px-1" onClick={handleCreateStripePortal}>Criar Portal de Assinatura</button>
			<button className="border rounded-md px-1" onClick={() => createMercadoPagoCheckout({
				testeId: "123", userEmail: "teste@teste.com"
			})}>Criar Pagamento Mercado Pago</button>

		</div>
	)
}