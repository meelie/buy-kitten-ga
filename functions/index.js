'use strict';

const functions = require('firebase-functions');
const { dialogflow } = require('actions-on-google');

const {
    SimpleResponse,
    Image,
    DeliveryAddress,
    OrderUpdate,
    TransactionDecision,
    TransactionRequirements,
    Carousel,
} = require('actions-on-google');

const app = dialogflow({debug: true});

app.intent('quit_app', (conv) => {
    conv.close('Have a good day! come back again. Bye!');
});

app.intent('like_kittens', (conv) => {
    return conv.ask(
        new SimpleResponse({
            text: 'Ho, I love kittens too !',
            speech: `<speak> Ho, I love kittens too ! <break time="1s"/> 
                <audio src="https://actions.google.com/sounds/v1/animals/cat_purr_close.ogg">
                <desc>a cat purring</desc>
                PURR (sound didn't load)
                </audio>
                </speak>`
        }),
        getKittensCarousel(conv)
    )
});
 
app.intent('pick_kitten', (conv, params, option) => {
    const SELECTED_ITEM_RESPONSES = {
        ['KITTEN_1']: 'You selected the first kitten',
        ['KITTEN_2']: 'You selected the second kitten!',
        ['KITTEN_3']: 'You selected the third!',
    };
    if (option && SELECTED_ITEM_RESPONSES.hasOwnProperty(option)) {
        conv.data.kittenKey = option
        return conv.ask(new SimpleResponse(SELECTED_ITEM_RESPONSES[option]), getTransactionCheck(conv));
    }
    return conv.ask(
        new SimpleResponse({
            text: 'You did not select any kitten, please pick one!',
            speech: `<speak> Select a cute kitten <break time="1s"/> 
                <audio src="https://actions.google.com/sounds/v1/animals/cat_purr_close.ogg">
                <desc>a cat purring</desc>
                PURR (sound didn't load)
                </audio>
                </speak>`
        }),
        getKittensCarousel(conv)
    )
});

app.intent('transaction_check_action', (conv) => {
    return conv.ask(getTransactionCheck(conv));
});


function getTransactionCheck (conv) {
    return new TransactionRequirements({
        orderOptions: {
            requestDeliveryAddress: false,
        },
        paymentOptions: getPaymentOptions(),
    });
}

function getPaymentOptions () {
    return {
        actionProvidedOptions: {
            displayName: 'VISA-1234',
            paymentType: 'PAYMENT_CARD',
        },
    }
}

app.intent('transaction_check_google', (conv) => {
    conv.ask(`Not for today. Try saying "check transaction with action payment".`);
});

app.intent('transaction_check_complete', (conv) => {
    const arg = conv.arguments.get('TRANSACTION_REQUIREMENTS_CHECK_RESULT');
    if (arg && arg.resultType ==='OK') {
      // Normally take the user through cart building flow
      conv.ask('Great, now say "confirm transaction".');
    } else {
        conv.close('Transaction failed.');
    }
});

app.intent('transaction_decision_action', (conv) => {
    const orderId = getOrderId()
    conv.data.orderId = orderId
    const order = {
      id: orderId,
      cart: {
        merchant: {
          id: 'kitten',
          name: 'Kitten Store',
        },
        lineItems: [{
            name: conv.data.kittenKey || 'My Fav Kitten',
            id: conv.data.kittenKey || 'kitten',
            price: {
              amount: {
                currencyCode: 'EUR',
                nanos: 990000000,
                units: 3,
              },
              type: 'ACTUAL',
            },
            quantity: 1,
            subLines: [
              {
                note: 'Note about the kitten',
              },
            ],
            type: 'REGULAR',
        }],
        notes: 'I love kittens',
        otherItems: [],
      },
      otherItems: [
        {
          name: 'Subtotal',
          id: 'subtotal',
          price: {
            amount: {
              currencyCode: 'EUR',
              nanos: 990000000,
              units: 3,
            },
            type: 'ESTIMATE',
          },
          type: 'SUBTOTAL',
        },
        {
          name: 'Tax',
          id: 'tax',
          price: {
            amount: {
              currencyCode: 'EUR',
              nanos: 0,
              units: 0,
            },
            type: 'ESTIMATE',
          },
          type: 'TAX',
        },
      ],
      totalPrice: {
        amount: {
          currencyCode: 'EUR',
          nanos: 990000000,
          units: 3,
        },
        type: 'ESTIMATE',
      },
    };

    // To test payment w/ sample,
    // uncheck the 'Testing in Sandbox Mode' box in the
    // Actions console simulator
    conv.ask(new TransactionDecision({
      orderOptions: {
        requestDeliveryAddress: false,
      },
      paymentOptions: getPaymentOptions(),
      proposedOrder: order,
    }));
  });

  app.intent('transaction_decision_complete', (conv) => {
    console.log('Transaction decision complete');
    const arg = conv.arguments.get('TRANSACTION_DECISION_VALUE');
    if (arg && arg.userDecision ==='ORDER_ACCEPTED') {
      const finalOrderId = arg.order.finalOrder.id;

      // Confirm order and make any charges in order processing backend
      conv.ask(new OrderUpdate({
        actionOrderId: finalOrderId,
        orderState: {
          label: 'Order created',
          state: 'CREATED',
        },
        lineItemUpdates: {},
        updateTime: new Date().toISOString(),
        receipt: {
          confirmedActionOrderId: conv.data.orderId,
        },
        // Replace the URL with your own customer service page
        orderManagementActions: [
          {
            button: {
              openUrlAction: {
                url: 'http://example.com/customer-service',
              },
              title: 'Customer Service',
            },
            type: 'CUSTOMER_SERVICE',
          },
        ],
        userNotification: {
          text: 'Notification text.',
          title: 'Notification Title',
        },
      }));
      conv.ask(`Transaction completed! You'll make a kitten happy!`);
    } else if (arg && arg.userDecision === 'DELIVERY_ADDRESS_UPDATED') {
      conv.ask(new DeliveryAddress({
        addressOptions: {
          reason: 'To know where to send the order',
        },
      }));
    } else {
      conv.close('Transaction failed.');
    }
  });

function getKittensCarousel (conv){
    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
        return new SimpleResponse("Sorry, I can't show you kitten without a screen ..." +
            'try this on a screen device or select the phone surface in the simulator.');
      }
      return new Carousel({
        items: {
          ['KITTEN_1']: {
            title: 'Kitten 1',
            description: 'What a cute kitten',
            image: new Image({
              url: 'https://media.giphy.com/media/RQgzLsPYlzrBC/giphy.gif',
              alt: 'A cute kitten',
            }),
          },
          ['KITTEN_2']: {
            title: 'Kitten 2',
            description: 'I love kittens so much',
            image: new Image({
              url: 'https://media.giphy.com/media/142Y941q45XPdm/giphy.gif',
              alt: 'A lovely kitten',
            }),
          },
          ['KITTEN_3']: {
            title: 'Kitten 3',
            description: 'Funny kitten',
            image: new Image({
              url: 'https://media.giphy.com/media/3GRwYzxwdceaI/giphy.gif',
              alt: 'Funny kitten',
            }),
          },
        },
    });
}

function getOrderId() {
    return Math.round(Math.random()*10000000000).toString()
}

exports.InspireMe = functions.https.onRequest(app);
