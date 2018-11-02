'use strict';

const functions = require('firebase-functions');
const { dialogflow } = require('actions-on-google');

const { 
    SimpleResponse,
    Image,
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
        return conv.ask(SELECTED_ITEM_RESPONSES[option]);
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
    
exports.InspireMe = functions.https.onRequest(app);
