// import * as firebase from 'firebase'
import * as firebase from  'firebase/app'

if (process.env.NODE_ENV === 'production') {
  firebase.initializeApp({
    apiKey: "AIzaSyBJGBsMBEo59p-dMphRUtYgst8NZyZuy5Q",
    authDomain: "clippingkk-mobile.firebaseapp.com",
    databaseURL: "https://clippingkk-mobile.firebaseio.com",
    projectId: "clippingkk-mobile",
    storageBucket: "clippingkk-mobile.appspot.com",
    messagingSenderId: "882301341703",
    appId: "1:882301341703:web:b0f8f40b8b538d75"
  })
}
