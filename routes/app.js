// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyB_b9jxHD2Q7DR71EE796z30YuU0hvFRBg",
    authDomain: "site-f5f0a.firebaseapp.com",
    projectId: "site-f5f0a",
    storageBucket: "site-f5f0a.appspot.com",
    messagingSenderId: "102881590389",
    appId: "1:102881590389:web:75ea87fd925c47f9d4cc3c",
    measurementId: "G-QL005LZ9J2"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// <!-- adopted -->
// Refernece contactInfo collections
let contactInfo = firebase.database().ref("infos");

// Listen for a submit
document.querySelector(".contact-form").addEventListener("submit", submitForm);

function submitForm(e) {
  e.preventDefault();

  //   Get input Values
  let name = document.querySelector(".name").value;
  let email = document.querySelector(".email").value;
  let message = document.querySelector(".message").value;
  console.log(name, email, message);

  saveContactInfo(name, email, message);

  document.querySelector(".contact-form").reset();
}

// Save infos to Firebase
function saveContactInfo(name, email, message) {
  let newContactInfo = contactInfo.push();

  newContactInfo.set({
    name: name,
    email: email,
    message: message,
  });
}
