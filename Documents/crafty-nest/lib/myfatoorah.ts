const BASE_URL = process.env.MYFATOORAH_BASE_URL ?? 'https://apitest.myfatoorah.com'
const API_KEY  = process.env.MYFATOORAH_API_KEY ?? ''

// PaymentMethodId: 1 = KNET (Kuwait), 2 = Visa/Mastercard
const METHOD_ID: Record<string, number> = {
  knet:       1,
  visa:       2,
  mastercard: 2,
}

interface ExecutePaymentParams {
  orderId:       string
  orderNumber:   string
  totalKwd:      number
  method:        'knet' | 'visa' | 'mastercard'
  customerName:  string
  customerPhone: string
  callbackUrl:   string
  errorUrl:      string
}

interface ExecutePaymentResult {
  paymentUrl: string
  invoiceId:  string
}

export async function executePayment(params: ExecutePaymentParams): Promise<ExecutePaymentResult> {
  const res = await fetch(`${BASE_URL}/v2/ExecutePayment`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      Authorization:   `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      PaymentMethodId:  METHOD_ID[params.method],
      CustomerName:     params.customerName,
      DisplayCurrencyIso: 'KWD',
      MobileCountryCode: '+965',
      CustomerMobile:   params.customerPhone.replace(/^\+965/, ''),
      CustomerEmail:    'noreply@thecraftynest.kw',
      InvoiceValue:     params.totalKwd,
      CallBackUrl:      params.callbackUrl,
      ErrorUrl:         params.errorUrl,
      Language:         'AR',
      CustomerReference: params.orderNumber,
      UserDefinedField: params.orderId,
      ExpiryDate:       '',
      SourceInfo:       'The Crafty Nest',
    }),
  })

  const json = await res.json()
  if (!json.IsSuccess) throw new Error(json.Message ?? 'MyFatoorah error')

  return {
    paymentUrl: json.Data.PaymentURL,
    invoiceId:  String(json.Data.InvoiceId),
  }
}

interface PaymentStatusResult {
  isPaid:      boolean
  invoiceId:   string
  referenceId: string  // our orderId from UserDefinedField
}

export async function getPaymentStatus(paymentId: string): Promise<PaymentStatusResult> {
  const res = await fetch(`${BASE_URL}/v2/GetPaymentStatus`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ Key: paymentId, KeyType: 'paymentId' }),
  })

  const json = await res.json()
  if (!json.IsSuccess) throw new Error(json.Message ?? 'MyFatoorah status error')

  const inv = json.Data
  return {
    isPaid:      inv.InvoiceStatus === 'Paid',
    invoiceId:   String(inv.InvoiceId),
    referenceId: inv.UserDefinedField ?? '',
  }
}
