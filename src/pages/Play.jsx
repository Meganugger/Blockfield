import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Engine } from '@/game/Engine';
import { DEFAULT_WORLD, MAX_HEALTH } from '@/game/config';
import Hud from '@/components/game/Hud';
import Leaderboard from '@/components/game/Leaderboard';
import ChatPanel from '@/components/game/ChatPanel';
import DeathScreen from '@/components/game/DeathScreen';

export default function Play() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const chatOpenRef = useRef(false);

  const [health, setHealth] = useState(MAX_HEALTH);
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [dead, setDead] = useState(false);
  const [status, setStatus] = useState('connecting');
  const [chatOpen, setChatOpen] = useState(false);

  const username = sessionStorage.getItem('bf_username');
  const color = sessionStorage.getItem('bf_color') || '#2a6dd0';

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }

    let cancelled = false;
    (async () => {
      const configs = await base44.entities.WorldConfig.list();
      if (cancelled) return;
      const world = { ...DEFAULT_WORLD, ...(configs[0] || {}) };

      const engine = new Engine(containerRef.current, world, { username, color }, {
        onHealth: (h) => setHealth(h),
        onDeath: () => setDead(true),
        onRespawn: () => setDead(false),
        onPlayers: setPlayers,
        onChat: (m) => setMessages((prev) => [...prev.slice(-49), m]),
        onStatus: setStatus,
      });
      engineRef.current = engine;
      await engine.start();
    })();

    const onUnload = () => engineRef.current?.dispose();
    window.addEventListener('beforeunload', onUnload);
    return () => {
      cancelled = true;
      window.removeEventListener('beforeunload', onUnload);
      engineRef.current?.dispose();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "/" opens chat
  useEffect(() => {
    const onKey = (e) => {
      if (!chatOpenRef.current && e.key === '/') {
        e.preventDefault();
        openChat();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openChat = () => {
    chatOpenRef.current = true;
    setChatOpen(true);
    engineRef.current?.setChatOpen(true);
  };
  const closeChat = () => {
    chatOpenRef.current = false;
    setChatOpen(false);
    engineRef.current?.setChatOpen(false);
  };

  if (!username) return null;

  return (
    <div className="fixed inset-0 bg-black select-none">
      <div ref={containerRef} className="absolute inset-0" />

      <Hud username={username} health={health} status={status} />
      <Leaderboard players={players} />
      <ChatPanel
        messages={messages}
        open={chatOpen}
        onOpen={openChat}
        onClose={closeChat}
        onSend={(text) => engineRef.current?.sendChat(text)}
      />
      <DeathScreen visible={dead} />

      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white/50 text-xs hover:text-white transition-colors"
      >
        Leave World
      </button>
    </div>
  );
}