/**
 * Multi-gateway regional payment matrix.
 *
 *  1. Paystack — PRIMARY for Nigeria & West Africa: cards, bank transfer, USSD,
 *     mobile money in NGN (and USD on enabled accounts). LIVE integration below —
 *     it activates the moment PAYSTACK_SECRET_KEY is set in the environment.
 *     Start with a sandbox key (sk_test_…) and Paystack's test cards/USSD flows
 *     before going live.
 *  2. PayPal — international retail checkout. Slot implemented behind the same
 *     interface; wire PAYPAL_CLIENT_ID / PAYPAL_SECRET and complete the two
 *     marked calls (create order + capture) to activate.
 *  3. Payoneer — B2B procurement & corporate contracts. Payoneer has no public
 *     hosted-checkout API; the flow here records the order and instructs our
 *     accounts desk to issue a Payoneer invoice for high-value wires.
 *
 * Every gateway records its originating reference on the Order row
 * (gateway + gatewayRef) so reconciliation is a query, not archaeology.
 */

export type GatewayId = "paystack" | "paypal" | "payoneer" | "transfer" | "pod";

export interface InitResult {
  /** Hosted-checkout URL to redirect the buyer to, or null for offline flows. */
  redirectUrl: string | null;
  /** Gateway-side reference to store on the order. */
  gatewayRef: string;
  /** Human instructions to show on the confirmation screen. */
  instructions: string;
}

export interface PaymentGateway {
  id: GatewayId;
  initialize(params: { ref: string; email: string; amountNGN: number; callbackUrl: string }): Promise<InitResult>;
  verify(gatewayRef: string): Promise<"success" | "pending" | "failed">;
}

const PAYSTACK_API = "https://api.paystack.co";

class PaystackGateway implements PaymentGateway {
  id = "paystack" as const;

  private key(): string | undefined {
    return process.env.PAYSTACK_SECRET_KEY;
  }

  async initialize({ ref, email, amountNGN, callbackUrl }: { ref: string; email: string; amountNGN: number; callbackUrl: string }): Promise<InitResult> {
    const key = this.key();
    if (!key) {
      // No key configured yet — degrade to a recorded order awaiting payment link.
      return {
        redirectUrl: null,
        gatewayRef: ref,
        instructions:
          "A secure Paystack payment link will be sent to your email shortly. (Site owner: set PAYSTACK_SECRET_KEY — sandbox sk_test_… first — to enable instant hosted checkout with cards, transfer, USSD and mobile money.)",
      };
    }
    const res = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        reference: ref,
        email,
        amount: Math.round(amountNGN * 100), // kobo
        currency: "NGN",
        callback_url: callbackUrl,
        channels: ["card", "bank", "ussd", "bank_transfer", "mobile_money"],
      }),
      cache: "no-store",
    });
    const data = (await res.json()) as { status: boolean; data?: { authorization_url: string; reference: string }; message?: string };
    if (!res.ok || !data.status || !data.data) {
      throw new Error(data.message ?? "Paystack initialization failed");
    }
    return {
      redirectUrl: data.data.authorization_url,
      gatewayRef: data.data.reference,
      instructions: "Redirecting you to Paystack secure checkout — card, bank transfer, USSD or mobile money.",
    };
  }

  async verify(gatewayRef: string): Promise<"success" | "pending" | "failed"> {
    const key = this.key();
    if (!key) return "pending";
    const res = await fetch(`${PAYSTACK_API}/transaction/verify/${encodeURIComponent(gatewayRef)}`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!res.ok) return "pending";
    const data = (await res.json()) as { data?: { status?: string } };
    const s = data.data?.status;
    return s === "success" ? "success" : s === "failed" || s === "abandoned" ? "failed" : "pending";
  }
}

class PayPalGateway implements PaymentGateway {
  id = "paypal" as const;

  async initialize({ ref }: { ref: string; email: string; amountNGN: number; callbackUrl: string }): Promise<InitResult> {
    // ACTIVATION: exchange PAYPAL_CLIENT_ID/PAYPAL_SECRET for an access token at
    // /v1/oauth2/token, then POST /v2/checkout/orders (intent: CAPTURE, USD amount
    // converted via your fx_rates config) and return data.links[rel=approve].href.
    return {
      redirectUrl: null,
      gatewayRef: `PP-${ref}`,
      instructions:
        "Our sales desk will email you a PayPal payment request in USD within the hour. (Site owner: set PAYPAL_CLIENT_ID and PAYPAL_SECRET, then complete the create-order call in src/lib/payments.ts to enable instant PayPal checkout.)",
    };
  }

  async verify(): Promise<"success" | "pending" | "failed"> {
    // ACTIVATION: GET /v2/checkout/orders/{id} and map COMPLETED → success.
    return "pending";
  }
}

class PayoneerGateway implements PaymentGateway {
  id = "payoneer" as const;

  async initialize({ ref }: { ref: string; email: string; amountNGN: number; callbackUrl: string }): Promise<InitResult> {
    return {
      redirectUrl: null,
      gatewayRef: `PN-${ref}`,
      instructions:
        "For corporate and B2B settlement, our accounts desk will issue a Payoneer invoice (USD/EUR wire) to your email within one working day, quoting your order number. Terms available for approved procurement accounts.",
    };
  }

  async verify(): Promise<"success" | "pending" | "failed"> {
    return "pending"; // settled manually by the accounts desk against the invoice
  }
}

class OfflineGateway implements PaymentGateway {
  constructor(public id: GatewayId, private note: string) {}
  async initialize({ ref }: { ref: string; email: string; amountNGN: number; callbackUrl: string }): Promise<InitResult> {
    return { redirectUrl: null, gatewayRef: ref, instructions: this.note };
  }
  async verify(): Promise<"success" | "pending" | "failed"> {
    return "pending";
  }
}

export const GATEWAYS: Record<GatewayId, PaymentGateway> = {
  paystack: new PaystackGateway(),
  paypal: new PayPalGateway(),
  payoneer: new PayoneerGateway(),
  transfer: new OfflineGateway(
    "transfer",
    "Transfer to Greyfusion Limited · Zenith Bank · 1014 872 331, using your order number as reference. Orders ship once payment reflects — usually under 30 minutes."
  ),
  pod: new OfflineGateway(
    "pod",
    "Pay our dispatch rider by card or transfer on delivery (Abuja, Lagos & Port Harcourt). Keep your phone reachable — the rider calls 30 minutes out."
  ),
};

export function getGateway(id: string): PaymentGateway {
  return GATEWAYS[(id as GatewayId) in GATEWAYS ? (id as GatewayId) : "transfer"];
}
