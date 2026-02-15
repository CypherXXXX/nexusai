import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-01-28.clover",
});

export async function POST(req: NextRequest) {
    try {
        const { plan } = await req.json();

        const priceMap: Record<string, { amount: number; name: string }> = {
            pro: { amount: 99900, name: "NexusAI Pro" },
            enterprise: { amount: 499900, name: "NexusAI Enterprise" },
        };

        const selected = priceMap[plan];
        if (!selected) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: { name: selected.name },
                        unit_amount: selected.amount,
                        recurring: { interval: "month" },
                    },
                    quantity: 1,
                },
            ],
            success_url: `${req.headers.get("origin")}/dashboard?upgraded=true`,
            cancel_url: `${req.headers.get("origin")}/pricing`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
