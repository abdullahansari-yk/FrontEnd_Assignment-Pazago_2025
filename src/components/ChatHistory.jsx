// src/components/ChatHistory.jsx
import React, { useState } from "react";

const ChatHistory = ({
  chats,
  selectedChatId,
  onSelect,
  onRename,
  onDelete,
}) => {
  const [hovered, setHovered] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold mb-3">Chats</h2>
      </div>

      <ul className="space-y-2">
        {chats.map((chat) => {
          const lastMsg = chat.messages.length
            ? chat.messages[chat.messages.length - 1].text
            : "No messages yet";
          const isSelected = chat.id === selectedChatId;

          return (
            <li
              key={chat.id}
              onMouseEnter={() => setHovered(chat.id)}
              onMouseLeave={() => {
                setHovered((h) => (h === chat.id ? null : h));
                setMenuOpen((m) => (m === chat.id ? null : m));
              }}
              className={`relative p-2 rounded-md  cursor-pointer ${
                isSelected ? "bg-gray-400" : "hover:bg-gray-300"
              }`}
            >
              <div
                className="flex items-center justify-between"
                onClick={() => onSelect(chat.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {chat.title}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {lastMsg}
                  </div>
                </div>

                {/* three-dots button appears on hover */}
                {hovered === chat.id && (
                  <div className="ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen((prev) =>
                          prev === chat.id ? null : chat.id
                        );
                      }}
                      className="p-1 rounded hover:bg-gray-500"
                      aria-label="Chat options"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>

                    {menuOpen === chat.id && (
                      <div className="absolute right-2 top-10 w-40 bg-gray-500 border rounded shadow-lg z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newTitle = prompt("Rename chat", chat.title);
                            if (newTitle !== null && newTitle.trim() !== "")
                              onRename(chat.id, newTitle.trim());
                            setMenuOpen(null);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100"
                        >
                          Rename
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Delete this chat?")) onDelete(chat.id);
                            setMenuOpen(null);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ChatHistory;
