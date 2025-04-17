import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";

export async function handleMercadoPagoPayment(paymentData: PaymentResponse) {
	console.log("PAGAMENTO COM SUCESSO", paymentData)
}