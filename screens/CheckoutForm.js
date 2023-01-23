import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardElement,
    ElementsConsumer,
    useElements,
    useStripe
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe('STRIPE_PUBLISHABLE_API_KEY');

export default function CheckoutForm(props) {

    const stripe = useStripe();
    const elements = useElements();

   

    const submitPayment = async (event) => {
      
        // Block native form submission.
        event.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not loaded yet. Make sure to disable
            // form submission until Stripe.js has loaded.
            return;
        }

        // Get a reference to a mounted CardElement. Elements knows how
        // to find your CardElement because there can only ever be one of
        // each type of element.
        const cardElement = elements.getElement(CardElement);

        // Use your card Element with other Stripe.js APIs
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

    };

    return (
        
            <CardElement
                options={{
                    style: {
                        base: {
                            fontSize: '15px',
                            color: '#424770',
                            '::placeholder': {
                                color: '#aab7c4',
                            },
                        },
                        invalid: {
                            color: '#9e2146',
                        },
                    },
                }}
            />      
        
    );
};

