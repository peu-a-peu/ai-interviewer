import Stripe from "stripe"

// unit_amount is required in cents
export const STRIPE_LINE_ITEMS: Record<string,Stripe.Checkout.SessionCreateParams.LineItem> = {
   'price_1': {
        quantity: 1,
        price_data: {
            currency: 'USD',
            unit_amount: 300,
            product_data: {
                name: "1 Ticket",
                description: "1 Mock Interview",
                metadata: {
                    tickets: 1
                }
            }
        }
    },

    'price_3': {
        quantity: 1,
        price_data: {
            currency: 'USD',
            unit_amount: 800,
            product_data: {
                name: "3 Tickets",
                description: "3 Mock Interviews",
                metadata: {
                    tickets: 3
                }
            }
        }
    },

    'price_6': {
        quantity: 1,
        price_data: {
            currency: 'USD',
            unit_amount: 1500,
            product_data: {
                name: "6 Tickets",
                description: "6 Mock Interviews",
                metadata: {
                    tickets: 6
                }
            }
        }
    },

    'price_10': {
        quantity: 1,
        price_data: {
            currency: 'USD',
            unit_amount: 2300,
            product_data: {
                name: "10 Tickets",
                description: "10 Mock Interviews",
                metadata: {
                    tickets: 10
                }
            }
        }
    },

}

export const STRIPE_PRICE_IDS = Object.keys(STRIPE_LINE_ITEMS)