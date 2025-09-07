import React, { useEffect, useRef, useState } from "react";
import ChatHistory from "./components/ChatHistory";
import PromptBox from "./components/PromptBox";
import { callWeatherAgent } from "./services/callWeatherAgent";
import ReactMarkdown from "react-markdown";

const WEATHER_AGENT_URL =
  "https://millions-screeching-vultur.mastra.cloud/api/agents/weatherAgent/stream";

function App() {
  // === Theme toggle state ===
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  // === Chat state ===
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("chats");
    if (saved) return JSON.parse(saved);
    const id = Date.now().toString();
    return [{ id, title: "New chat", messages: [] }];
  });

  const [selectedChatId, setSelectedChatId] = useState(() => {
    return localStorage.getItem("selectedChatId") || (chats[0]?.id ?? null);
  });

  const messagesEndRef = useRef(null);

  useEffect(
    () => localStorage.setItem("chats", JSON.stringify(chats)),
    [chats]
  );
  useEffect(
    () =>
      selectedChatId && localStorage.setItem("selectedChatId", selectedChatId),
    [selectedChatId]
  );

  const truncate = (s, n = 30) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

  const createNewChat = () => {
    const id = Date.now().toString();
    const newChat = { id, title: "New chat", messages: [] };
    setChats((prev) => [newChat, ...prev]);
    setSelectedChatId(id);
  };

  const handleSelectChat = (id) => setSelectedChatId(id);
  const handleRenameChat = (id, newTitle) =>
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  const handleDeleteChat = (id) => {
    setChats((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (selectedChatId === id) {
        if (next.length) {
          setSelectedChatId(next[0].id);
          return next;
        }
        const newId = Date.now().toString();
        setSelectedChatId(newId);
        return [{ id: newId, title: "New chat", messages: [] }];
      }
      return next;
    });
  };

  // === Send message ===
  const handleSend = async (text) => {
    if (!text.trim()) return;
    const chatId = selectedChatId;

    const userMsg = {
      id: Date.now().toString() + Math.random(),
      sender: "user",
      text,
      createdAt: Date.now(),
    };

    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const updatedMessages = [...c.messages, userMsg];
        const newTitle =
          c.title === "New chat" || !c.title ? truncate(text, 30) : c.title;
        return { ...c, messages: updatedMessages, title: newTitle };
      })
    );

    const tempId = Date.now().toString() + Math.random();
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: [
                ...c.messages,
                { id: tempId, sender: "agent", text: "…" },
              ],
            }
          : c
      )
    );

    try {
      const reply = await callWeatherAgent(text, {
        endpoint: WEATHER_AGENT_URL,
        threadId: chatId,
        onMessage: (partial) => {
          setChats((prev) =>
            prev.map((c) =>
              c.id === chatId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === tempId ? { ...m, text: partial } : m
                    ),
                  }
                : c
            )
          );
        },
      });

      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === tempId ? { ...m, text: reply } : m
                ),
              }
            : c
        )
      );
    } catch (err) {
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === tempId
                    ? { ...m, text: "⚠️ Failed to fetch weather. Try again." }
                    : m
                ),
              }
            : c
        )
      );
    }
  };

  useEffect(
    () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
    [chats, selectedChatId]
  );

  const selectedChat = chats.find((c) => c.id === selectedChatId) || {
    messages: [],
  };

  return (
    <div className="flex h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      {/* LEFT: Chat history */}
      <div className="w-1/4 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto flex flex-col">
        <div className="mb-4 flex flex-col md:flex-row gap-3 md:gap-0 items-center justify-between">
          <button
            onClick={createNewChat}
            className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-md dark:bg-white dark:text-black"
          >
            ➕ New chat
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-md bg-gray-200 dark:bg-gray-700"
          >
            {theme === "dark" ? "🌞" : "🌙"}
          </button>
        </div>

        <ChatHistory
          chats={chats}
          selectedChatId={selectedChatId}
          onSelect={handleSelectChat}
          onRename={handleRenameChat}
          onDelete={handleDeleteChat}
        />
      </div>

      {/* RIGHT: Chat messages + input */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-white dark:bg-gray-900">
          {selectedChat.messages.length === 0 && (
            <div className="text-center text-gray-400 dark:text-gray-500">
              No messages yet — say hi!
            </div>
          )}

          {selectedChat.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[65%] px-4 py-2 rounded-2xl shadow ${
                  msg.sender === "user"
                    ? "bg-gray-500 text-white rounded-br-none"
                    : "bg-gray-200 dark:bg-gray-700 dark:text-gray-100 rounded-bl-none"
                }`}
              >
                {/* <ReactMarkdown>{msg.text}</ReactMarkdown> */}
                <ReactMarkdown>{msg.text.replace(/\\n/g, "\n")}</ReactMarkdown>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        <PromptBox onSend={handleSend} />
      </div>
    </div>
  );
}

export default App;
