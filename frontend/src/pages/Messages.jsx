import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import api from '../api';
import io from 'socket.io-client';
import './Messages.css';

const Messages = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  // Parse contact from URL state if navigating from an item
  useEffect(() => {
    if (location.state && location.state.contactUser) {
      setActiveContact(location.state.contactUser);
    }
  }, [location]);

  // Connect to socket.io
  useEffect(() => {
    if (user) {
      socketRef.current = io('http://localhost:5000');
      socketRef.current.emit('join', user._id);

      socketRef.current.on('receiveMessage', (msg) => {
        setMessages((prev) => [...prev, msg]);
        fetchContacts(); // Update contacts list with latest message
      });

      socketRef.current.on('messageSent', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    }
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user]);

  // Fetch contacts list
  const fetchContacts = async () => {
    try {
      const res = await api.get('/messages/contacts/list');
      setContacts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) fetchContacts();
  }, [user]);

  // Fetch messages for active contact
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeContact) return;
      try {
        const res = await api.get(`/messages/${activeContact._id}`);
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [activeContact]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    const msgData = {
      sender: user._id,
      receiver: activeContact._id,
      content: newMessage
    };

    socketRef.current.emit('sendMessage', msgData);
    setNewMessage('');
    
    // Add contact if they aren't in the list yet (optimistic UI)
    if (!contacts.find(c => c._id === activeContact._id)) {
      setContacts([{ _id: activeContact._id, username: activeContact.username, lastMessage: newMessage }, ...contacts]);
    }
  };

  if (!user) return <div className="container" style={{marginTop: '4rem'}}>Please login to view messages.</div>;

  return (
    <div className="container messages-container">
      <div className="contacts-sidebar glass">
        <h3 style={{ padding: '20px', borderBottom: '1px solid #e0e0e0', margin: 0 }}>Conversations</h3>
        <ul className="contacts-list">
          {activeContact && !contacts.find(c => c._id === activeContact._id) && (
            <li className="contact-item active">
              <div className="contact-name">{activeContact.username} (New)</div>
            </li>
          )}
          {contacts.map(contact => (
            <li 
              key={contact._id} 
              className={`contact-item ${activeContact && activeContact._id === contact._id ? 'active' : ''}`}
              onClick={() => setActiveContact(contact)}
            >
              <div className="contact-name">{contact.username}</div>
              <div className="contact-last-msg">{contact.lastMessage}</div>
            </li>
          ))}
          {contacts.length === 0 && !activeContact && <p style={{padding: '20px', color: 'var(--muted)'}}>No conversations yet.</p>}
        </ul>
      </div>

      <div className="chat-window glass">
        {activeContact ? (
          <>
            <div className="chat-header">
              <h3>Chat with {activeContact.username}</h3>
            </div>
            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`message-bubble ${msg.sender === user._id ? 'sent' : 'received'}`}>
                  {msg.content}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form className="chat-input" onSubmit={sendMessage}>
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Send</button>
            </form>
          </>
        ) : (
          <div className="empty-chat">
            <p>Select a conversation to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
