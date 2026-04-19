import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle,
  Send,
  ArrowLeft,
  AlertTriangle,
  Lock,
  Crown,
  ArrowRight,
  Check,
  CheckCheck,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../BaseUrl";
import io from "socket.io-client";

const getToken = () => {
  try {
    return JSON.parse(sessionStorage.getItem("accessToken") || '""');
  } catch {
    return "";
  }
};

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

const SOCKET_URL = import.meta.env.VITE_BASE_URL?.replace("/api/v1", "") || "https://api.ratchetup.ai";

export default function Messaging({ subscription }) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [warning, setWarning] = useState("");
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const isPlatinum =
    (subscription?.plan?.name?.toLowerCase() || "").startsWith("platinum") &&
    subscription?.status === "ACTIVE";

  const getCurrentUserId = () => {
    try {
      const token = getToken();
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId || payload.id;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  // Socket.io connection
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("new_message", ({ conversationId, message }) => {
      if (activeConversation?.id === conversationId) {
        setMessages((prev) => [...prev, message]);
        fetch(`${BASE_URL}/messaging/conversations/${conversationId}/read`, {
          method: "POST",
          headers: authHeaders(),
        });
      }
      fetchConversations();
    });

    socket.on("new_conversation", () => {
      fetchConversations();
    });

    socketRef.current = socket;
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (socketRef.current && activeConversation) {
      socketRef.current.emit("join_conversation", {
        conversationId: activeConversation.id,
      });
    }
    return () => {
      if (socketRef.current && activeConversation) {
        socketRef.current.emit("leave_conversation", {
          conversationId: activeConversation.id,
        });
      }
    };
  }, [activeConversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/messaging/conversations`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.result || []);
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 15000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const fetchMessages = async (conversationId) => {
    try {
      const res = await fetch(
        `${BASE_URL}/messaging/conversations/${conversationId}/messages`,
        { headers: authHeaders() }
      );
      if (res.ok) {
        const data = await res.json();
        setMessages(data.result || []);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  const openConversation = (conv) => {
    setActiveConversation(conv);
    setMobileShowChat(true);
    fetchMessages(conv.id);
    setWarning("");
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation || sendingMessage) return;

    // Check Platinum before sending
    if (!isPlatinum) {
      setUpgradeModal(true);
      return;
    }

    setSendingMessage(true);
    setWarning("");

    try {
      const res = await fetch(
        `${BASE_URL}/messaging/conversations/${activeConversation.id}/messages`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ body: messageText }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [...prev, data.result]);
        setMessageText("");
        if (data.contactInfoStripped) {
          setWarning(data.warning);
        }
        fetchConversations();
      } else if (data.requiresUpgrade) {
        setUpgradeModal(true);
      } else {
        setWarning(data.message || "Failed to send message");
      }
    } catch (err) {
      setWarning("Network error. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (diff < 604800000) {
      return d.toLocaleDateString([], { weekday: "short" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "RECRUITER": return "Recruiter";
      case "ADMIN": return "Admin";
      default: return role;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "RECRUITER": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "ADMIN": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
      {/* Conversation List */}
      <div
        className={`${
          mobileShowChat ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-96 border-r border-gray-200 dark:border-gray-800`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-orange-500" />
            Messages
          </h2>
          {!isPlatinum && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-xs text-amber-700 dark:text-amber-400">
              <Lock className="w-3 h-3" />
              Platinum subscription required to reply to messages
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 px-6 text-center">
              <MessageCircle className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs mt-1">
                When a recruiter or admin contacts you, conversations will appear here
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => openConversation(conv)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left border-b border-gray-100 dark:border-gray-800 ${
                  activeConversation?.id === conv.id
                    ? "bg-orange-50 dark:bg-orange-900/10 border-l-4 border-l-orange-500"
                    : ""
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                    {conv.otherUser?.firstName?.[0]}{conv.otherUser?.lastName?.[0]}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {conv.otherUser?.firstName} {conv.otherUser?.lastName}
                    </p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {conv.lastMessageText || "No messages yet"}
                    </p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0 ${getRoleBadgeColor(conv.otherUser?.role)}`}>
                      {getRoleLabel(conv.otherUser?.role)}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`${
          mobileShowChat ? "flex" : "hidden md:flex"
        } flex-col flex-1`}
      >
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <button
                onClick={() => {
                  setMobileShowChat(false);
                  setActiveConversation(null);
                }}
                className="md:hidden p-1 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                {activeConversation.otherUser?.firstName?.[0]}
                {activeConversation.otherUser?.lastName?.[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {activeConversation.otherUser?.firstName}{" "}
                  {activeConversation.otherUser?.lastName}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(activeConversation.otherUser?.role)}`}>
                  {getRoleLabel(activeConversation.otherUser?.role)}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950">
              {messages.map((msg) => {
                const isMine = msg.senderId === currentUserId || msg.sender?.id === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                        isMine
                          ? "bg-orange-500 text-white rounded-br-md"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md shadow-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                      <div
                        className={`flex items-center gap-1 mt-1 text-[10px] ${
                          isMine ? "text-white/70 justify-end" : "text-gray-400"
                        }`}
                      >
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isMine && (
                          msg.isRead ? (
                            <CheckCheck className="w-3 h-3" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )
                        )}
                      </div>
                      {msg.contactInfoStripped && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          Contact info removed
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Warning */}
            {warning && (
              <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">{warning}</p>
                <button onClick={() => setWarning("")} className="text-amber-500 hover:text-amber-700 ml-auto text-xs">
                  Dismiss
                </button>
              </div>
            )}

            {/* Message Input */}
            {isPlatinum ? (
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white placeholder-gray-400"
                    disabled={sendingMessage}
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim() || sendingMessage}
                    className="p-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Contact info is filtered unless both parties have Platinum.
                </p>
              </form>
            ) : (
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <button
                  onClick={() => setUpgradeModal(true)}
                  className="w-full py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade to Platinum to Reply
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 px-6">
            <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm mt-1">
              When recruiters contact you, their messages appear here
            </p>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {upgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-orange-600 p-6 text-white text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <Crown className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold">Platinum Required</h2>
              <p className="text-sm opacity-90 mt-1">
                Messaging requires an active Platinum subscription
              </p>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-6">
                Upgrade to Platinum to respond to recruiter messages and unlock direct communication with employers.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setUpgradeModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => {
                    setUpgradeModal(false);
                    navigate("/dashboard/subscriptions");
                  }}
                  className="flex-1 py-3 px-4 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  Upgrade <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              onClick={() => setUpgradeModal(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
