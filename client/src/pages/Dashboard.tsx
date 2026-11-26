import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import {
  getHomeworks,
  createHomework,
  updateHomeworkStatus,
  deleteHomework,
  getMessages,
  sendMessage,
  improveMessageWithAI,
  askSchoolAI,
} from '../services/schoolService';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

type ActiveTab = 'overview' | 'homework' | 'messages' | 'ai';

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [hwFilter, setHwFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const [hwTitle, setHwTitle] = useState('');
  const [hwSubject, setHwSubject] = useState('');
  const [hwGrade, setHwGrade] = useState('');
  const [hwDesc, setHwDesc] = useState('');
  const [hwDueDate, setHwDueDate] = useState('');

  const [msgGrade, setMsgGrade] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [aiUsed, setAiUsed] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [aiProvider, setAiProvider] = useState<'Gemini' | 'NVIDIA Nemotron'>('Gemini');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'USER' | 'AI ASSISTANT'; text: string }[]>([
    { sender: 'AI ASSISTANT', text: 'Hello! Ask me to summarize your homework or help draft school updates.' },
  ]);

  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const hwData = await getHomeworks();
      setHomeworks(Array.isArray(hwData) ? hwData : hwData.homeworks || []);
    } catch (err) {
      console.error(err);
    }

    try {
      const msgData = await getMessages();
      setMessages(Array.isArray(msgData) ? msgData : msgData.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('');
    try {
      await createHomework({
        title: hwTitle,
        subject: hwSubject,
        grade: hwGrade,
        description: hwDesc,
        dueDate: hwDueDate,
      });
      setHwTitle('');
      setHwSubject('');
      setHwGrade('');
      setHwDesc('');
      setHwDueDate('');
      setStatusMsg('Homework assigned successfully!');
      loadData();
    } catch (err: any) {
      setStatusMsg(err.response?.data?.message || 'Failed to assign homework');
    }
  };

  const handleToggleHomework = async (id: string, currentStatus: boolean) => {
    try {
      await updateHomeworkStatus(id, !currentStatus);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHomework = async (id: string) => {
    try {
      await deleteHomework(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImproveAI = async () => {
    if (!msgContent.trim()) return;
    setAiLoading(true);
    try {
      const res = await improveMessageWithAI(msgContent);
      setMsgContent(res.improvedMessage || res.message || res.text || msgContent);
      setAiUsed(true);
    } catch (err: any) {
      setStatusMsg(err.response?.data?.message || 'AI improvement failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('');
    try {
      await sendMessage({
        grade: msgGrade,
        body: msgContent,
        aiAssisted: aiUsed,
      });
      setMsgGrade('');
      setMsgContent('');
      setAiUsed(false);
      setStatusMsg('Message sent successfully!');
      loadData();
    } catch (err: any) {
      setStatusMsg(err.response?.data?.message || 'Failed to send message');
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const question = chatInput;
    setChatInput('');
    setChatHistory((prev) => [...prev, { sender: 'USER', text: question }]);
    setAiLoading(true);

    try {
      const pendingHw = homeworks.filter((h) => !h.done);
      if (question.toLowerCase().includes('summarize') && pendingHw.length > 0) {
        const summary = pendingHw.map((h) => `${h.subject} - ${h.title}`).join(', ');
        setChatHistory((prev) => [
          ...prev,
          { sender: 'AI ASSISTANT', text: `You have ${pendingHw.length} pending tasks: ${summary}. Check the Homework page for details.` },
        ]);
      } else {
        const reply = await askSchoolAI(question, aiProvider);
        setChatHistory((prev) => [...prev, { sender: 'AI ASSISTANT', text: reply }]);
      }
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { sender: 'AI ASSISTANT', text: 'Unable to reach AI service right now. Please try again.' },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredHomeworks = homeworks.filter((hw) => {
    if (hwFilter === 'pending') return !hw.done;
    if (hwFilter === 'completed') return hw.done;
    return true;
  });

  const openTasksCount = homeworks.filter((h) => !h.done).length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const dueTodayCount = homeworks.filter((h) => !h.done && h.dueDate?.slice(0, 10) === todayStr).length;

  return (
    <div className="app-shell">
      <header className="top-navbar">
        <div className="brand-logo">schoolconnect</div>
        <div className="top-nav-right">
          <span className="role-badge">{user.role} | {user.name}</span>
          <button onClick={onLogout} className="logout-link">Logout</button>
        </div>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); setStatusMsg(''); }}
          >
            Overview
          </button>
          <button
            className={`nav-item ${activeTab === 'homework' ? 'active' : ''}`}
            onClick={() => { setActiveTab('homework'); setStatusMsg(''); }}
          >
            {user.role === 'student' ? 'My homework' : 'Homework'}
          </button>
          <button
            className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => { setActiveTab('messages'); setStatusMsg(''); }}
          >
            Messages
          </button>
          <button
            className={`nav-item ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => { setActiveTab('ai'); setStatusMsg(''); }}
          >
            AI assistant
          </button>
        </aside>

        <main className="content-area">
          {statusMsg && <div className="status-banner">{statusMsg}</div>}

          {activeTab === 'overview' && (
            <div className="screen-section">
              <h1 className="page-title">Good morning, {user.name}</h1>
              <p className="page-subtitle">Here is your school day.</p>

              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-number">{openTasksCount}</span>
                  <span className="stat-label">Open tasks</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{dueTodayCount}</span>
                  <span className="stat-label">Due today</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{messages.length}</span>
                  <span className="stat-label">Messages</span>
                </div>
              </div>

              <div className="panel-card">
                <h3 className="panel-title">Upcoming homework</h3>
                {homeworks.length === 0 ? (
                  <p className="empty-text">No upcoming homework tasks.</p>
                ) : (
                  <div className="list-stack">
                    {homeworks.slice(0, 3).map((hw) => (
                      <div key={hw._id} className="overview-row">
                        <span>{hw.subject} - {hw.title}</span>
                        <span className="pill-badge">Due: {hw.dueDate?.slice(0, 10)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="panel-card">
                <h3 className="panel-title">Latest teacher update</h3>
                {messages.length === 0 ? (
                  <p className="empty-text">No recent updates.</p>
                ) : (
                  <div>
                    <p className="update-text">{messages[0].body || messages[0].content}</p>
                    <p className="update-meta">
                      Grade: {messages[0].grade || 'All'} | {messages[0].createdAt ? new Date(messages[0].createdAt).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'homework' && (
            <div className="screen-section">
              <h1 className="page-title">{user.role === 'student' ? 'My homework' : 'Manage Homework'}</h1>

              {user.role === 'teacher' && (
                <div className="panel-card mb-6">
                  <h3 className="panel-title">Assign new task</h3>
                  <form onSubmit={handleCreateHomework} className="form-grid">
                    <input
                      type="text"
                      placeholder="Subject (e.g., Math)"
                      value={hwSubject}
                      onChange={(e) => setHwSubject(e.target.value)}
                      required

                    />

                                        <input
                      type="text"
                      placeholder="Grade (e.g., 10th)"
                      value={hwGrade}
                      onChange={(e) => setHwGrade(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Title (e.g., Fractions)"
                      value={hwTitle}
                      onChange={(e) => setHwTitle(e.target.value)}
                      required
                    />
                    <input
                      type="date"
                      value={hwDueDate}
                      onChange={(e) => setHwDueDate(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={hwDesc}
                      onChange={(e) => setHwDesc(e.target.value)}
                      className="full-span"
                    />
                    <button type="submit" className="primary-btn full-span">Assign Homework</button>
                  </form>
                </div>
              )}

              <div className="filter-bar">
                <button
                  className={`filter-pill ${hwFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setHwFilter('all')}
                >
                  All
                </button>
                <button
                  className={`filter-pill ${hwFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setHwFilter('pending')}
                >
                  Pending
                </button>
                <button
                  className={`filter-pill ${hwFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => setHwFilter('completed')}
                >
                  Completed
                </button>
              </div>

              <div className="list-stack">
                {filteredHomeworks.length === 0 ? (
                  <p className="empty-text">No homework tasks found in this filter.</p>
                ) : (
                  filteredHomeworks.map((hw) => (
                    <div key={hw._id} className="task-card">
                      <div>
                        <h4 className="task-title">{hw.subject} - {hw.title}</h4>
                        <p className="task-meta">
                          Due: {hw.dueDate?.slice(0, 10)} | Grade {hw.grade}
                        </p>
                        {hw.description && <p className="task-desc">{hw.description}</p>}
                      </div>
                      <div className="task-actions">
                        {user.role === 'student' ? (
                          <button
                            onClick={() => handleToggleHomework(hw._id, hw.done)}
                            className={`status-pill ${hw.done ? 'done' : 'pending'}`}
                          >
                            {hw.done ? 'Done' : 'Pending'}
                          </button>
                        ) : (
                          <span className={`status-pill ${hw.done ? 'done' : 'pending'}`}>
                            {hw.done ? 'Done' : 'Active'}
                          </span>
                        )}
                        {user.role === 'teacher' && (
                          <button onClick={() => handleDeleteHomework(hw._id)} className="del-btn">
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="screen-section">
              <h1 className="page-title">
                {user.role === 'teacher' ? 'Send a parent update' : 'Teacher messages'}
              </h1>

              {user.role === 'teacher' && (
                <div className="panel-card mb-6">
                  <form onSubmit={handleSendMessage} className="space-y-4">
                    <div>
                      <label className="field-label">Recipients (Grade)</label>
                      <input
                        type="text"
                        placeholder="e.g., 10th"
                        value={msgGrade}
                        onChange={(e) => setMsgGrade(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="field-label">Message</label>
                      <textarea
                        rows={4}
                        placeholder="Please remind your child to complete the worksheet..."
                        value={msgContent}
                        onChange={(e) => setMsgContent(e.target.value)}
                        required
                      />
                    </div>
                    <div className="btn-row">
                      <button
                        type="button"
                        onClick={handleImproveAI}
                        disabled={aiLoading}
                        className="secondary-btn"
                      >
                        {aiLoading ? 'Improving...' : 'Improve with AI'}
                      </button>
                      <button type="submit" className="primary-btn">
                        Send message
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="panel-card">
                <h3 className="panel-title">Recent messages</h3>
                {messages.length === 0 ? (
                  <p className="empty-text">No messages yet.</p>
                ) : (
                  <div className="list-stack">
                    {messages.map((msg) => (
                      <div key={msg._id} className="message-item">
                        <p className="msg-body">{msg.body || msg.content}</p>
                        <p className="msg-meta">
                          Grade {msg.grade} | {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="screen-section">
              <h1 className="page-title">Ask School AI</h1>

              <div className="provider-pills">
                <button
                  className={`provider-btn ${aiProvider === 'Gemini' ? 'active-blue' : ''}`}
                  onClick={() => setAiProvider('Gemini')}
                >
                  Gemini
                </button>
                <button
                  className={`provider-btn ${aiProvider === 'NVIDIA Nemotron' ? 'active-green' : ''}`}
                  onClick={() => setAiProvider('NVIDIA Nemotron')}
                >
                  NVIDIA Nemotron
                </button>
              </div>

              <div className="chat-box">
                {chatHistory.map((item, idx) => (
                  <div key={idx} className={`chat-bubble ${item.sender === 'USER' ? 'user-msg' : 'ai-msg'}`}>
                    <span className="chat-sender">{item.sender}</span>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAskAI} className="chat-input-bar">
                <input
                  type="text"
                  placeholder="Ask a question (e.g., Summarize my homework for tomorrow)..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit" disabled={aiLoading} className="primary-btn">
                  {aiLoading ? '...' : 'Send'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

