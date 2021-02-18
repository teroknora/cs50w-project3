document.addEventListener('DOMContentLoaded', function() {
  // load_message(Event.currentTarget)

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // Add event listeners to each message

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
  document.querySelector('#message-view').style.display = 'none';
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
  document.querySelector('#message-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  // create table
  let mail = document.createElement('table');
  mail.setAttribute('class', 'table table-hover');
  mail.setAttribute('id', 'mailbox');
  let tbody = document.createElement('tbody');
  document.querySelector('#emails-view').append(mail);
  mail.append(tbody);

  // Get and display emails
  fetch(`emails/${mailbox}`)
  .then (response => response.json())
  .then( emails => listEmails(emails))
  console.log('emails loaded')
}

// Helper function to load_mailbox: Render emails from API
function listEmails(emails) {
  
  console.log(emails)

  for (let i = 0; i < emails.length; i++) {
    let info = [emails[i].sender, emails[i].subject, emails[i].timestamp]; 
    let message = document.createElement('tr');
    message.setAttribute('id', `${emails[i].id}`);
    
    for (let j = 0; j < info.length; j++) {
      let infoItem = document.createElement('td');
      infoItem.setAttribute('class', `title${j}`);
      infoItem.innerHTML = info[j];
      message.append(infoItem);
    }
    document.querySelector('tbody').append(message);
  }

  // Add heading
  let heading = document.createElement('thead');
  heading.innerHTML = '<tr><th scope="col">Sender</th><th scope="col">Subject</th><th class="title2" scope="col">Timestamp</th></tr>';
  document.querySelector('#mailbox').prepend(heading);

  // Add event listener to each email
  test = document.querySelector('tr');
  console.log(test);
  rows = document.querySelectorAll('tr');
  console.log(rows);
  for (let i = 0; i < rows.length; i++) {
    let row_id = rows[i].getAttribute('id');
    rows[i].addEventListener('click', () => load_message(row_id));
    console.log(row_id);
  }
  
}

//Open and display individual email contents
function load_message(message){
  console.log(message);
  const  messageView = document.querySelector('#message-view');
  document.querySelector('#message-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  // Pass in table row id to call API
  fetch(`/emails/${message}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);
    messageView.innerHTML = `<p><strong>From: </strong>${email.sender}<br><strong>
    To: </strong>${email.recipients}<br><strong>
    Subject: </strong>${email.subject}<br><strong>
    Time: </strong>${email.timestamp}</p>
    <button class="btn btn-sm btn-outline-primary">Reply</button>
    <hr>
    <p>${email.body}</p>`
    ;
  });



}
 
     


