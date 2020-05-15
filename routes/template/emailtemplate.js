function registrationEmailTemplate(email, password) {  
    var registrationEmailTemplate = "<h4>Dear User</h4> <p>Your Oncierre Account has been created. Welcome to Oncierre Platform.</p> <p>Please log into the account using the below details.</p> <p>Username : <strong>        " 
    + email + 
    "</strong></p> <p>Password : <strong>" 
    + password +
    "</strong></p> <p>You can log in to Oncierre by clicking <a href='https://oncierre-api.azurewebsites.net/'>clicking here.</a></p> <p>Regards,</p> <p>Oncierre Team</p> <p><strong>Disclaimer:</strong>The content of this email is confidential and intended for the recipient specified in the message only. It is strictly forbidden to share any part of this message with any third party, without the written consent of the sender. If you received this message by mistake, please reply to this message and follow with its deletion, so that we can ensure such a mistake does not occur in the future.</p>"
    return registrationEmailTemplate;
}

function forgotPasswordEmailTemplate(secureNumber){
    var forgotPasswordEmailTemplate = 'Your One Time Password Is ' + secureNumber
    return forgotPasswordEmailTemplate;
}
module.exports = {registrationEmailTemplate, forgotPasswordEmailTemplate}