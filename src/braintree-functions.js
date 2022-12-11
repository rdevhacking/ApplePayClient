async function createBraintreeClient(clientToken) {
    return await braintree.client.create({
        authorization: clientToken
    });
}

async function collectDeviceData(braintreeClientInstance) {
    return (await braintree.dataCollector.create({
        client: braintreeClientInstance
    })).deviceData
}

async function startApplePaySession(braintreeClientInstance) {
    const ApplePaySession = window.ApplePaySession;
    if (!ApplePaySession) {
        console.error('This device does not support Apple Pay');
    }

    if (!ApplePaySession.canMakePayments()) {
        console.error('This device is not capable of making Apple Pay payments');
    }

    const applePayInstance = await braintree.applePay.create({
        client: braintreeClientInstance
    });

    const paymentRequest = applePayInstance.createPaymentRequest({
        total: {
            label: 'My Store',
            amount: '999.99'
        },
        requiredBillingContactFields: ["postalAddress"]
    });
    console.log(paymentRequest.countryCode);
    console.log(paymentRequest.currencyCode);
    console.log(paymentRequest.merchantCapabilities);
    console.log(paymentRequest.supportedNetworks);

    var session = new ApplePaySession(3, paymentRequest);

    session.onvalidatemerchant = async function (event) {

        try {
            const merchantSession = await applePayInstance.performValidation({
                validationURL: event.validationURL,
                displayName: 'RobbersStore'
            });

            session.completeMerchantValidation(merchantSession);

        } catch (validationErr) {
            console.error('Error validating merchant:', validationErr);
            session.abort();
        }
    };

    session.onpaymentauthorized = async function (event) {
        console.log("Congratulations you was robbed :D! NOW FUCK OFF!!! BITCH XDDD");

        const payload = await applePayInstance.tokenize({
            token: event.payment.token
        });

        // Send payload.nonce to your server.
        console.log('nonce:', payload.nonce);

        // If requested, address information is accessible in event.payment
        // and may also be sent to your server.
        console.log('billingPostalCode:', event.payment.billingContact.postalCode);

        // After you have transacted with the payload.nonce,
        // call `completePayment` to dismiss the Apple Pay sheet.
        session.completePayment(ApplePaySession.STATUS_SUCCESS);
    }
    session.begin();
}


export { createBraintreeClient, collectDeviceData, startApplePaySession }