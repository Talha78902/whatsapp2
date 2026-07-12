import { useState, useEffect } from 'react';
import api from '../api/client';
import { Conversation, Message, PaginatedResponse } from '../types';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');

  const fetchConversations = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/conversations', { params });
      const data: PaginatedResponse<Conversation> = res.data.data;
      setConversations(data.data);
      setMeta(data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchConversations(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const selectConversation = async (conv: Conversation) => {
    setSelected(conv);
    try {
      const res = await api.get(`/conversations/${conv.id}`);
      const fullConv = res.data.data;
      setMessages(fullConv.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selected) return;
    try {
      await api.post('/messages', {
        conversationId: selected.id,
        content: newMessage,
        direction: 'outbound',
      });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          conversationId: selected.id,
          direction: 'outbound',
          content: newMessage,
          contentType: 'text',
          status: 'sent',
          createdAt: new Date().toISOString(),
        },
      ]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Conversations</h1>
          <p className="page-subtitle">Chat with your customers</p>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-list">
          <div className="chat-list-header">
            <div className="search-input-wrapper" style={{ marginBottom: 8 }}>
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: 12 }}
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`chat-item ${selected?.id === conv.id ? 'active' : ''}`}
              onClick={() => selectConversation(conv)}
            >
              <div className="chat-avatar">
                {conv.customer?.name?.charAt(0) || '?'}
              </div>
              <div className="chat-info">
                <div className="chat-name">{conv.customer?.name || 'Unknown'}</div>
                <div className="chat-preview">
                  {conv.messages?.[0]?.content || 'No messages'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="chat-time">
                  {conv.lastMessageAt
                    ? new Date(conv.lastMessageAt).toLocaleDateString()
                    : ''}
                </div>
                <span className={`status-dot ${conv.status === 'active' ? 'online' : 'offline'}`} />
              </div>
            </div>
          ))}
        </div>

        <div className="chat-main">
          {selected ? (
            <>
              <div className="chat-header">
                <div>
                  <div style={{ fontWeight: 600 }}>{selected.customer?.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {selected.customer?.phone}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className={`badge badge-${selected.status}`}>{selected.status}</span>
                </div>
              </div>

              <div className="chat-messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message-bubble ${
                      msg.direction === 'inbound'
                        ? 'message-inbound'
                        : 'message-outbound'
                    }`}
                  >
                    {msg.content}
                    <div
                      style={{
                        fontSize: 10,
                        marginTop: 4,
                        opacity: 0.7,
                        textAlign: 'right',
                      }}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-input-area">
                <input
                  className="chat-input"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button className="btn btn-primary" onClick={sendMessage}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="empty-state-icon">💬</div>
              <div className="empty-state-title">Select a conversation</div>
              <div className="empty-state-text">
                Choose a conversation from the left to start chatting
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
