# Actions on Google: Transactions workshop using Node.js

This project has been developed as a support of NodeConfEu 2018 workshop http://bit.ly/ga-nodeconfeu2018 

## Setup Instructions

Copied from https://github.com/actions-on-google/dialogflow-transactions-nodejs/

### Steps
1. Use the [Actions on Google Console](https://console.actions.google.com) to add a new project with a name of your choosing and click *Create Project*.
1. Click *Skip*, located on the top right to skip over category selection menu.
1. On the left navigation menu under *BUILD*, click on *Actions*. Click on *Add Your First Action* and choose your app's language(s).
1. Select *Custom intent*, click *BUILD*. This will open a Dialogflow console. Click *CREATE*.
1. Click on the gear icon to see the project settings.
1. Select *Export and Import*.
1. Select *Restore from zip*. Follow the directions to restore from the Transactions.zip file in this repo.
1. Deploy the fulfillment webhook provided in the functions folder using [Google Cloud Functions for Firebase](https://firebase.google.com/docs/functions/):
   1. Follow the instructions to [set up and initialize Firebase SDK for Cloud Functions](https://firebase.google.com/docs/functions/get-started#set_up_and_initialize_functions_sdk). Make sure to select the project that you have previously generated in the Actions on Google Console and to reply `N` when asked to overwrite existing files by the Firebase CLI.
   1. Run `firebase deploy --only functions` and take note of the endpoint where the fulfillment webhook has been published. It should look like `Function URL (transactions): https://${REGION}-${PROJECT}.cloudfunctions.net/transactions`
1. Go back to the Dialogflow console and select *Fulfillment* from the left navigation menu.
1. Enable *Webhook*, set the value of *URL* to the `Function URL` from the previous step, then click *Save*.
1. Select *Integrations* from the left navigation menu and open the *Integration Settings* menu for Actions on Google. Click *Manage Assistant App*, which will take you to the [Actions on Google Console](https://console.actions.google.com).
1. On the left navigation menu under *DEPLOY*, click on *Directory Infomration*.
1. Add your App info, including images, a contact email and privacy policy. This information can all be edited before
submitting for review.
1. Check the box at the bottom to indicate this app uses Transactions under *Additional Information*. Click *Save*.
1. Set up a payment method for your account in the Google Assistant settings on your phone if you haven't set one up already.
1. Return [Actions on Google Console](https://console.actions.google.com), on the left navigation menu under *Test*, click on *Simulator*.
1. Click *Start Testing* and select the latest version (VERSION - Draft).
1. Type `Talk to my test app` in the simulator, or say `OK Google, talk to my test app` to any Actions on Google enabled device signed into your
developer account.
1. Follow the instructions below to test a transaction.
1. To test payment when confirming transaction, uncheck the box in the Actions
console simulator indicating testing in Sandbox mode.

For more detailed information on deployment, see the [documentation](https://developers.google.com/actions/dialogflow/deploy-fulfillment).

#### To test a transaction

1. Determine a unique Order ID for the transaction you want to test, and
replace the `<UNIQUE_ORDER_ID>` in the `transaction_decision_action` and
`transaction_decision_complete` intent handlers. You may
need to change this and redeploy your webhook each time you want to test a transaction
confirmation.
1. Determine the [payment method](https://developers.google.com/actions/transactions/dev-guide#choose_a_payment_method)
you wish to accept in the app. The app uses action provided payment by default.
If you want to use a Google-provided payment instrument, uncomment the annotated
code in the `transaction_decision_action` and `transaction_decision_complete` intent handlers in `index.js`.
1. It must be confirmed that the [user can transact](https://developers.google.com/actions/transactions/dev-guide#check_for_transaction_requirements).
To check this, say/type either
      * `check transaction with Google payment` - to check requirements for a transaction where
      the user pays with an Google-provided payment instrument stored under their account.
      * `check transaction with action payment` - to check requirements for a transaction where
      the user will pay with a payment instrument that you are providing.
1. (Optional) The user's delivery address can then be acquired by saying/typing
`get delivery address`. This will present the user with a flow to select from
an available delivery address.
5. To confirm the transaction, simply say/type `confirm transaction`. Here, the
`transaction_decision_action` intent will be handled in `index.js`.
6. You should see a transaction receipt, and a final confirmation of the order.

#### Troubleshooting

If the app isn't working, try the following:
* Make sure your Actions console project has filled App Information section,
including name, images, email address, etc. This is required for testing transactions.
After changing this, you may need to re-enable testing in the Actions console.
* Make sure your Actions console project indicates that it is using Transactions
using the checkbox at the bottom of App Information
* Make sure you've replaced the `<UNIQUE_ORDER_ID>` in `index.js`,  and replace it
each time you test the app.
* The full transactions flow may only be testable on a phone.
