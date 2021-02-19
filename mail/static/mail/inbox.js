document.addEventListener('DOMContentLoaded', function() {
  // load_message(Event.currentTarget)

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
  
  // create table for email list
  let mail = document.createElement('table');
  mail.setAttribute('class', 'table');
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

// Helper function to load_mailbox: translate API email info into UI
function listEmails(emails) {

  // Loop through json response to list message info
  for (let i = 0; i < emails.length; i++) {
    let info = [emails[i].sender, emails[i].subject, emails[i].timestamp]; 
    let message = document.createElement('tr');
    message.setAttribute('id', `${emails[i].id}`)
    message.setAttribute('class', `read-${emails[i].read}`);
    
    for (let j = 0; j < info.length; j++) {
      let infoItem = document.createElement('td');
      infoItem.setAttribute('class', `title${j}`);
      infoItem.innerHTML = info[j];
      message.append(infoItem);
    }
    document.querySelector('tbody').append(message);
  }
  // Add heading to the email table
  let heading = document.createElement('thead');
  heading.innerHTML = '<tr><th scope="col">Sender</th><th scope="col">Subject</th><th class="title2" scope="col">Timestamp</th></tr>';
  document.querySelector('#mailbox').prepend(heading);

  // Add event listener to each email
  rows = document.querySelectorAll('tr');
  for (let i = 0; i < rows.length; i++) {
    let row_id = rows[i].getAttribute('id');
    rows[i].addEventListener('click', () => load_message(row_id));
    console.log(row_id);
  }
}


//Open and display individual email contents
function load_message(message){
  const  messageView = document.querySelector('#message-view');
  messageView.style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';

  // Pass in table row id to call API to get corresponding messsage details and render in UI
  fetch(`/emails/${message}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);
    messageView.innerHTML = `<p><strong>From: </strong>${email.sender}<br><strong>
    To: </strong>${email.recipients}<br><strong>
    Subject: </strong>${email.subject}<br><strong>
    Time: </strong>${email.timestamp}</p>
    <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
    <button class="btn btn-sm btn-outline-secondary" id="archive"></button>
    <hr>
    <p>${email.body}</p>`;

    // if email is archived, show unarchive button, else archive button
    if (email.archived === true){
      document.querySelector('#archive').innerHTML = 'Unarchive';
    }
    else {
      document.querySelector('#archive').innerHTML = 'Archive';
    }

    // Add event listeners for programatically generated buttons
    document.querySelector('#reply').addEventListener('click', () => reply(email))
    document.querySelector('#archive').addEventListener('click', () => archive(email))

    
    // if email marked as unread, mark as read
    if (email.read === false){
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      })
    }
  });
}
 
// reply to email     
function reply(email){ 

  // show compose view
  document.querySelector('#message-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // fill fields with reply info
  document.querySelector('#compose-recipients').value = email.sender;
  document.querySelector('#compose-body').value = `
  ---
  On ${email.timestamp} ${email.sender} wrote:
  
  ${email.body}`;

  // Add RE: if not already in subject
  const isReply = email.subject.split(' ');
  console.log(isReply[0]);
  if (isReply[0] != 'RE:'){
    document.querySelector('#compose-subject').value = `RE: ${email.subject}`;
    }
  else {
    document.querySelector('#compose-subject').value = email.subject;
  }
}

// Archive or unarchive email
function archive(email) {
  console.log('archive start')
  if (email.archived === true) {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    })
  }
  else {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    })
  }
  load_mailbox('inbox');
}

