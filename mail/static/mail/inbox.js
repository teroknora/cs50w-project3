document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = () => { 
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        return false;
    });
    return load_mailbox('sent');
  };

  // By default, load the inbox
  load_mailbox('inbox');


});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  let mail = document.createElement('div');
  mail.setAttribute('class', 'list-group');
  mail.setAttribute('id', 'mailbox');
  document.querySelector('#emails-view').append(mail);

  // Show emails
  fetch(`emails/${mailbox}`)
  .then (response => response.json())
  .then( emails => listEmails(emails))

}


// Display emails in mailbox
function listEmails(emails) {
  
  console.log(emails)

  for (let i = 0; i < emails.length; i++) {
    let info = [emails[i].sender, emails[i].subject, emails[i].timestamp]; 
    let message = document.createElement('a');
    message.setAttribute('href', '#');
    message.setAttribute('class', 'd-flex list-group-item message list-group-item-action');
    
    
    for (let j = 0; j < info.length; j++) {
      let infoItem = document.createElement('div');
      infoItem.setAttribute('class', `title${j}`);
      infoItem.innerHTML = info[j];
      message.append(infoItem);
    }
    document.querySelector('#mailbox').append(message);
  }
  let heading = document.createElement('div');
  heading.setAttribute('class', 'd-flex list-group-item justify-content-between message list-group-item-action list-group-item-primary');
  heading.innerHTML = "<div>Sender</div> <div>Subject</div> <div>Datetime Sent</div>";
  
  document.querySelector('#mailbox').prepend(heading);
  
}

 
     
 