import { supabase } from '../../lib/supabase';

const PaymentService = {
    async createCheckoutLink(bookingId) {
        const {
            data: { session },
            error
        } = await supabase.auth.getSession();

        if (error) {
            throw error;
        }

        const token =
            session?.access_token;

        if (!token) {
            throw new Error(
                'Authentication required.'
            );
        }

        const response = await fetch(
            '/api/payments/create-checkout-session',
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json',

                    Authorization:
                        `Bearer ${token}`
                },

                body: JSON.stringify({
                    bookingId
                })
            }
        );

        const result =
            await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.error ||
                'Unable to create payment link.'
            );
        }

        return result;
    }
};

export default PaymentService;
