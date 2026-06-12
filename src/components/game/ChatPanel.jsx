import React, { useEffect, useRef, useState } from 'react';

// Chat shell (bottom left). Text is rendered as plain React text — no HTML
// injection possible. Open with "/", close with Escape, send with Enter.
export default function ChatPanel({ messages, open, onOpen, onClose, onSend }) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  const submit = (e) => {
    e.preventDefault();
    if (draft.trim()) onSend(draft);
    setDraft('');
    onClose();
  };

  return (
    <div className="absolute bottom-6 left-4 w-80">
      <div
        ref={listRef}
        className="max-h-48 overflow-y-auto space-y-1 mb-2 pointer-events-none"
      >
        {messages.slice(-30).map((m, i) => (
          <div key={i} className="text-sm text-white drop-shadow px-2 py-0.5 rounded bg-black/30 w-fit max-w-full break-words">
            <span className="font-semibold text-sky-300">{m.username}: </span>
            <span className="text-white/90">{m.text}</span>
          </div>
        ))}
      </div>
      {open ? (
        <form onSubmit={submit}>
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setDraft('');
                onClose();
              }
              e.stopPropagation();
            }}
            maxLength={200}
            placeholder="Say something… (Enter to send, Esc to close)"
            className="w-full px-3 py-2 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-sky-400"
          />
        </form>
      ) : (
        <button
          onClick={onOpen}
          className="px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white/50 text-xs hover:text-white/80 transition-colors"
        >
          Press / to chat
        </button>
      )}
    </div>
  );
}