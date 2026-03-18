import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

// --- Data ---
const CONTACTS = [
  { id: 1, name: "Ghost_7749", status: "online", lastSeen: "сейчас", avatar: "G", color: "#00ffff" },
  { id: 2, name: "N3ON_RYUK", status: "offline", lastSeen: "3 мин назад", avatar: "N", color: "#bf00ff" },
  { id: 3, name: "Cipher.X", status: "online", lastSeen: "сейчас", avatar: "C", color: "#ff0080" },
  { id: 4, name: "VORTEX_01", status: "away", lastSeen: "15 мин назад", avatar: "V", color: "#00ff41" },
  { id: 5, name: "d4rkm4tt3r", status: "offline", lastSeen: "2 ч назад", avatar: "D", color: "#ff6600" },
  { id: 6, name: "Zer0_K00l", status: "online", lastSeen: "сейчас", avatar: "Z", color: "#ffff00" },
];

const CHATS_DATA = [
  { id: 1, contact: CONTACTS[0], messages: [
    { id: 1, text: "Связь установлена. Канал зашифрован.", sent: false, time: "22:01", encrypted: true },
    { id: 2, text: "Принято. Протокол активен.", sent: true, time: "22:02", encrypted: true },
    { id: 3, text: "Передаю пакет данных. Ожидай.", sent: false, time: "22:03", encrypted: true },
    { id: 4, text: "Готов к приёму.", sent: true, time: "22:03", encrypted: true },
  ]},
  { id: 2, contact: CONTACTS[2], messages: [
    { id: 1, text: "Ключи сгенерированы. 256-bit AES.", sent: false, time: "21:45", encrypted: true },
    { id: 2, text: "Верификация пройдена.", sent: true, time: "21:47", encrypted: true },
  ]},
  { id: 3, contact: CONTACTS[5], messages: [
    { id: 1, text: "Сеть безопасна. Проверено.", sent: true, time: "20:30", encrypted: true },
  ]},
];

const NOTIFICATIONS_DATA = [
  { id: 1, type: "message", text: "Ghost_7749 отправил зашифрованное сообщение", time: "2 мин", read: false },
  { id: 2, type: "security", text: "Новый сеанс авторизован с устройства Android", time: "15 мин", read: false },
  { id: 3, type: "contact", text: "Cipher.X принял твой запрос на контакт", time: "1 ч", read: true },
  { id: 4, type: "message", text: "N3ON_RYUK: [зашифровано]", time: "3 ч", read: true },
  { id: 5, type: "security", text: "Ключи шифрования обновлены автоматически", time: "6 ч", read: true },
];

type Section = "chats" | "contacts" | "profile" | "settings" | "search" | "notifications";

function ScanlineOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.012) 2px, rgba(0,255,255,0.012) 4px)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.6) 100%)" }} />
    </div>
  );
}

function MatrixBg() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="absolute top-0 text-xs font-mono opacity-10"
          style={{
            left: `${(i * 5.2) % 100}%`,
            color: "#00ffff",
            animation: `matrix-rain ${3 + (i % 5)}s linear ${i * 0.3}s infinite`,
            writingMode: "vertical-rl",
            letterSpacing: "0.5em",
            fontSize: "10px",
          }}>
          {["01101", "10010", "11001", "00110", "10101", "TAXE∞", "CRYPT", "∅BYTE", "NULL∅"][i % 9]}
        </div>
      ))}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = { online: "#00ff41", offline: "#333", away: "#ffaa00" };
  return (
    <span className="inline-block w-2 h-2 rounded-full flex-shrink-0"
      style={{ background: colors[status] || "#333", boxShadow: status === "online" ? `0 0 6px ${colors.online}` : "none" }} />
  );
}

function Avatar({ contact, size = 36 }: { contact: typeof CONTACTS[0]; size?: number }) {
  return (
    <div className="flex-shrink-0 flex items-center justify-center font-bold rounded-sm"
      style={{
        width: size, height: size,
        background: `${contact.color}18`,
        border: `1px solid ${contact.color}60`,
        color: contact.color,
        fontFamily: "'Orbitron', sans-serif",
        fontSize: size * 0.35,
        boxShadow: `0 0 10px ${contact.color}30`,
      }}>
      {contact.avatar}
    </div>
  );
}

function ChatView({ chat, onBack }: { chat: typeof CHATS_DATA[0]; onBack: () => void }) {
  const [messages, setMessages] = useState(chat.messages);
  const [input, setInput] = useState("");
  const [encrypting, setEncrypting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    setEncrypting(true);
    const text = input;
    setInput("");
    setTimeout(() => {
      setMessages(m => [...m, {
        id: Date.now(), text,
        sent: true,
        time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
        encrypted: true,
      }]);
      setEncrypting(false);
    }, 400);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: "rgba(0,255,255,0.15)", background: "rgba(0,255,255,0.03)" }}>
        <button onClick={onBack} className="md:hidden p-1" style={{ color: "#00ffff" }}>
          <Icon name="ChevronLeft" size={20} />
        </button>
        <Avatar contact={chat.contact} size={38} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate" style={{ fontFamily: "'Orbitron', sans-serif", color: chat.contact.color }}>{chat.contact.name}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <StatusDot status={chat.contact.status} />
            <span className="text-xs" style={{ color: "#446", fontFamily: "'Share Tech Mono', monospace" }}>
              {chat.contact.status === "online" ? "В СЕТИ" : chat.contact.lastSeen.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#00ff41", textShadow: "0 0 5px #00ff41", letterSpacing: "0.1em" }}>
          <Icon name="Lock" size={10} />
          E2E-ШИФРОВАНИЕ
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundImage: "linear-gradient(rgba(0,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-sm`}
              style={msg.sent
                ? { background: "linear-gradient(135deg,rgba(0,255,255,0.1),rgba(0,255,255,0.05))", border: "1px solid rgba(0,255,255,0.3)", boxShadow: "0 0 10px rgba(0,255,255,0.1)" }
                : { background: "linear-gradient(135deg,rgba(191,0,255,0.1),rgba(191,0,255,0.05))", border: "1px solid rgba(191,0,255,0.3)", boxShadow: "0 0 10px rgba(191,0,255,0.1)" }}>
              <div className="text-sm" style={{ fontFamily: "'IBM Plex Mono', monospace", color: msg.sent ? "#00ffff" : "#bf00ff" }}>{msg.text}</div>
              <div className="flex items-center gap-1.5 mt-1.5">
                {msg.encrypted && (
                  <span className="flex items-center gap-1" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#00ff41", textShadow: "0 0 5px #00ff41", letterSpacing: "0.1em" }}>
                    <Icon name="ShieldCheck" size={8} /> AES-256
                  </span>
                )}
                <span className="text-xs ml-auto" style={{ color: "#334" }}>{msg.time}</span>
              </div>
            </div>
          </div>
        ))}
        {encrypting && (
          <div className="flex justify-end">
            <div className="px-4 py-2 rounded-sm" style={{ border: "1px solid rgba(0,255,255,0.3)", background: "rgba(0,255,255,0.05)" }}>
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#00ff41" }} className="cursor-blink">ШИФРОВАНИЕ</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t" style={{ borderColor: "rgba(0,255,255,0.15)", background: "rgba(0,0,0,0.5)" }}>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-sm" style={{ border: "1px solid rgba(0,255,255,0.25)", background: "rgba(0,255,255,0.04)" }}>
            <Icon name="Lock" size={14} style={{ color: "#00ff41" }} />
            <input
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "#00ffff", fontFamily: "'IBM Plex Mono', monospace", caretColor: "#00ffff" }}
              placeholder="Введи сообщение... (шифруется автоматически)"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
            />
          </div>
          <button onClick={send} className="px-4 py-2.5 rounded-sm transition-all duration-200"
            style={{ background: "rgba(0,255,255,0.15)", border: "1px solid rgba(0,255,255,0.5)", color: "#00ffff", boxShadow: "0 0 10px rgba(0,255,255,0.2)" }}>
            <Icon name="Send" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatsSection() {
  const [active, setActive] = useState<typeof CHATS_DATA[0] | null>(null);
  return (
    <div className="flex h-full">
      <div className={`${active ? "hidden md:flex" : "flex"} flex-col w-full md:w-72 border-r flex-shrink-0`} style={{ borderColor: "rgba(0,255,255,0.1)" }}>
        <div className="p-4 border-b" style={{ borderColor: "rgba(0,255,255,0.1)" }}>
          <div className="text-xs font-medium tracking-widest mb-1" style={{ color: "#446", fontFamily: "'Share Tech Mono', monospace" }}>АКТИВНЫЕ КАНАЛЫ</div>
          <div className="text-lg" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: "#00ffff", textShadow: "0 0 15px #00ffff" }}>ЧАТЫ</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {CHATS_DATA.map(chat => (
            <button key={chat.id} onClick={() => setActive(chat)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b"
              style={{
                borderColor: "rgba(0,255,255,0.06)",
                borderLeft: active?.id === chat.id ? "2px solid #00ffff" : "2px solid transparent",
                background: active?.id === chat.id ? "rgba(0,255,255,0.08)" : "transparent",
              }}>
              <div className="relative">
                <Avatar contact={chat.contact} size={40} />
                <span className="absolute -bottom-0.5 -right-0.5"><StatusDot status={chat.contact.status} /></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "11px", color: chat.contact.color }}>{chat.contact.name}</div>
                <div className="text-xs truncate mt-0.5" style={{ color: "#446", fontFamily: "'Share Tech Mono', monospace" }}>
                  {chat.messages[chat.messages.length - 1].text.substring(0, 28)}...
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs" style={{ color: "#334" }}>{chat.messages[chat.messages.length - 1].time}</span>
                <Icon name="Lock" size={10} style={{ color: "#00ff41" }} />
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className={`${active ? "flex" : "hidden md:flex"} flex-1 flex-col`}>
        {active
          ? <ChatView chat={active} onBack={() => setActive(null)} />
          : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ opacity: 0.25 }}>
              <Icon name="Lock" size={48} style={{ color: "#00ffff" }} />
              <div className="text-sm tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace", color: "#00ffff" }}>ВЫБЕРИ КАНАЛ</div>
            </div>
          )}
      </div>
    </div>
  );
}

function ContactsSection() {
  const statuses = ["online", "away", "offline"];
  const labels: Record<string, string> = { online: "В СЕТИ", away: "НЕ АКТИВЕН", offline: "ОФФЛАЙН" };
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b" style={{ borderColor: "rgba(0,255,255,0.1)" }}>
        <div className="text-xs tracking-widest mb-1" style={{ color: "#446", fontFamily: "'Share Tech Mono', monospace" }}>БАЗА АГЕНТОВ</div>
        <div className="text-lg" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: "#00ffff", textShadow: "0 0 15px #00ffff" }}>КОНТАКТЫ</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {statuses.map(s => {
          const group = CONTACTS.filter(c => c.status === s);
          if (!group.length) return null;
          return (
            <div key={s} className="mb-6">
              <div className="text-xs tracking-widest mb-3 flex items-center gap-2" style={{ color: "#334", fontFamily: "'Share Tech Mono', monospace" }}>
                <StatusDot status={s} /> {labels[s]} — {group.length}
              </div>
              <div className="space-y-2">
                {group.map(c => (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-sm border"
                    style={{ border: "1px solid rgba(0,255,255,0.08)", background: "rgba(0,255,255,0.02)" }}>
                    <Avatar contact={c} size={42} />
                    <div className="flex-1">
                      <div className="text-sm font-semibold" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "11px", color: c.color }}>{c.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#334", fontFamily: "'Share Tech Mono', monospace" }}>{c.lastSeen.toUpperCase()}</div>
                    </div>
                    <button className="p-2 rounded-sm" style={{ border: "1px solid rgba(0,255,255,0.2)", color: "#00ffff" }}>
                      <Icon name="MessageCircle" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NotificationsSection() {
  const [notifs, setNotifs] = useState(NOTIFICATIONS_DATA);
  const icons: Record<string, string> = { message: "MessageCircle", security: "ShieldAlert", contact: "UserCheck" };
  const colors: Record<string, string> = { message: "#00ffff", security: "#ff0080", contact: "#00ff41" };
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(0,255,255,0.1)" }}>
        <div>
          <div className="text-xs tracking-widest mb-1" style={{ color: "#446", fontFamily: "'Share Tech Mono', monospace" }}>СИСТЕМНЫЕ СИГНАЛЫ</div>
          <div className="text-lg" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: "#00ffff", textShadow: "0 0 15px #00ffff" }}>УВЕДОМЛЕНИЯ</div>
        </div>
        <button onClick={() => setNotifs(n => n.map(x => ({ ...x, read: true })))}
          className="text-xs px-3 py-1.5 rounded-sm"
          style={{ border: "1px solid rgba(0,255,255,0.2)", color: "#00ffff", fontFamily: "'Share Tech Mono', monospace" }}>
          ВСЕ ПРОЧИТАНО
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {notifs.map(n => (
          <div key={n.id} className="flex items-start gap-3 p-4 rounded-sm border transition-all"
            style={{
              border: `1px solid ${n.read ? "rgba(0,255,255,0.05)" : `${colors[n.type]}40`}`,
              background: n.read ? "rgba(0,255,255,0.01)" : `${colors[n.type]}08`,
              boxShadow: n.read ? "none" : `0 0 15px ${colors[n.type]}10`,
            }}>
            <div className="p-2 rounded-sm flex-shrink-0" style={{ background: `${colors[n.type]}15`, border: `1px solid ${colors[n.type]}30` }}>
              <Icon name={icons[n.type]} size={14} fallback="Bell" style={{ color: colors[n.type] }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm" style={{ color: n.read ? "#446" : "#cde", fontFamily: "'IBM Plex Mono', monospace" }}>{n.text}</div>
              <div className="text-xs mt-1" style={{ color: "#334", fontFamily: "'Share Tech Mono', monospace" }}>{n.time.toUpperCase()} НАЗАД</div>
            </div>
            {!n.read && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: colors[n.type], boxShadow: `0 0 6px ${colors[n.type]}` }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchSection() {
  const [query, setQuery] = useState("");
  const results = query.length > 0 ? CONTACTS.filter(c => c.name.toLowerCase().includes(query.toLowerCase())) : [];
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b" style={{ borderColor: "rgba(0,255,255,0.1)" }}>
        <div className="text-xs tracking-widest mb-1" style={{ color: "#446", fontFamily: "'Share Tech Mono', monospace" }}>СКАНИРОВАНИЕ СЕТИ</div>
        <div className="text-lg" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: "#00ffff", textShadow: "0 0 15px #00ffff" }}>ПОИСК</div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 px-3 py-3 rounded-sm" style={{ border: "1px solid rgba(0,255,255,0.3)", background: "rgba(0,255,255,0.04)" }}>
          <Icon name="Search" size={16} style={{ color: "#00ffff" }} />
          <input className="flex-1 bg-transparent outline-none"
            style={{ color: "#00ffff", fontFamily: "'IBM Plex Mono', monospace", caretColor: "#00ffff" }}
            placeholder="Поиск агентов..." value={query} onChange={e => setQuery(e.target.value)} autoFocus />
          {query && <button onClick={() => setQuery("")} style={{ color: "#446" }}><Icon name="X" size={14} /></button>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 space-y-2">
        {query === "" && (
          <div className="flex flex-col items-center justify-center h-48 gap-3" style={{ opacity: 0.25 }}>
            <Icon name="Search" size={40} style={{ color: "#00ffff" }} />
            <span className="text-xs tracking-widest" style={{ color: "#00ffff", fontFamily: "'Share Tech Mono', monospace" }}>ВВЕДИ ЗАПРОС</span>
          </div>
        )}
        {results.map(c => (
          <div key={c.id} className="flex items-center gap-3 p-3 rounded-sm border"
            style={{ border: "1px solid rgba(0,255,255,0.1)", background: "rgba(0,255,255,0.02)" }}>
            <Avatar contact={c} size={40} />
            <div className="flex-1">
              <div className="text-sm" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "11px", color: c.color }}>{c.name}</div>
              <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: "#334", fontFamily: "'Share Tech Mono', monospace" }}>
                <StatusDot status={c.status} /> {c.status.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
        {query && results.length === 0 && (
          <div className="text-center py-8 text-xs tracking-widest" style={{ color: "#334", fontFamily: "'Share Tech Mono', monospace" }}>АГЕНТ НЕ НАЙДЕН В СЕТИ</div>
        )}
      </div>
    </div>
  );
}

function ProfileSection() {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const t = setInterval(() => { setGlitch(true); setTimeout(() => setGlitch(false), 300); }, 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b" style={{ borderColor: "rgba(0,255,255,0.1)" }}>
        <div className="text-xs tracking-widest mb-1" style={{ color: "#446", fontFamily: "'Share Tech Mono', monospace" }}>ИДЕНТИФИКАЦИЯ</div>
        <div className="text-lg" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: "#00ffff", textShadow: "0 0 15px #00ffff" }}>ПРОФИЛЬ</div>
      </div>
      <div className="flex flex-col items-center pt-10 pb-6 px-6">
        <div className="relative mb-6">
          <div className={`w-24 h-24 rounded-sm flex items-center justify-center text-4xl font-bold ${glitch ? "glitch-text" : ""}`}
            data-text="TX"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              background: "linear-gradient(135deg, rgba(0,255,255,0.1), rgba(191,0,255,0.1))",
              border: "2px solid rgba(0,255,255,0.5)",
              color: "#00ffff",
              boxShadow: "0 0 30px rgba(0,255,255,0.3), inset 0 0 20px rgba(0,255,255,0.05)",
            }}>TX</div>
          <div className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#00ff41", boxShadow: "0 0 8px #00ff41" }}>
            <div className="w-2 h-2 rounded-full bg-black" />
          </div>
        </div>
        <div className="text-2xl font-bold mb-1" style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.2em", color: "#00ffff", textShadow: "0 0 15px #00ffff" }}>TX_U53R</div>
        <div className="flex items-center gap-1 mb-8" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#00ff41", textShadow: "0 0 5px #00ff41", letterSpacing: "0.1em" }}>● АКТИВНЫЙ АГЕНТ</div>
        <div className="grid grid-cols-3 gap-4 w-full mb-8">
          {[{ label: "ЧАТОВ", value: "3" }, { label: "КОНТАКТОВ", value: "6" }, { label: "СООБЩЕНИЙ", value: "48" }].map(s => (
            <div key={s.label} className="flex flex-col items-center p-3 rounded-sm" style={{ border: "1px solid rgba(0,255,255,0.15)", background: "rgba(0,255,255,0.03)" }}>
              <div className="text-xl font-bold" style={{ fontFamily: "'Orbitron', sans-serif", color: "#00ffff", textShadow: "0 0 10px #00ffff" }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: "#334", fontFamily: "'Share Tech Mono', monospace" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className="w-full space-y-3">
          {[
            { label: "ID", value: "TX#00420" },
            { label: "СТАТУС", value: "В СЕТИ" },
            { label: "ШИФРОВАНИЕ", value: "AES-256-GCM" },
            { label: "КЛЮЧ", value: "••••••••••••••••" },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between px-4 py-3 rounded-sm"
              style={{ border: "1px solid rgba(0,255,255,0.08)", background: "rgba(0,255,255,0.02)" }}>
              <span className="text-xs" style={{ color: "#334", fontFamily: "'Share Tech Mono', monospace" }}>{item.label}</span>
              <span className="text-sm" style={{ color: "#00ffff", fontFamily: "'IBM Plex Mono', monospace" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsSection() {
  const [toggles, setToggles] = useState({ e2e: true, notify: true, stealth: false, autoDelete: false, twofa: true });
  const toggle = (k: keyof typeof toggles) => setToggles(t => ({ ...t, [k]: !t[k] }));
  const settings = [
    { key: "e2e" as const, label: "Сквозное шифрование", desc: "AES-256-GCM для всех сообщений", color: "#00ff41" },
    { key: "notify" as const, label: "Уведомления", desc: "Push-сигналы от контактов", color: "#00ffff" },
    { key: "stealth" as const, label: "Режим невидимки", desc: "Скрыть статус онлайн", color: "#bf00ff" },
    { key: "autoDelete" as const, label: "Авто-удаление", desc: "Стирать сообщения через 24 ч", color: "#ff0080" },
    { key: "twofa" as const, label: "Двухфакторная защита", desc: "Дополнительный слой безопасности", color: "#ffaa00" },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b" style={{ borderColor: "rgba(0,255,255,0.1)" }}>
        <div className="text-xs tracking-widest mb-1" style={{ color: "#446", fontFamily: "'Share Tech Mono', monospace" }}>УПРАВЛЕНИЕ СИСТЕМОЙ</div>
        <div className="text-lg" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: "#00ffff", textShadow: "0 0 15px #00ffff" }}>НАСТРОЙКИ</div>
      </div>
      <div className="p-4 space-y-3">
        <div className="text-xs tracking-widest mb-4 flex items-center gap-2" style={{ color: "#334", fontFamily: "'Share Tech Mono', monospace" }}>
          <Icon name="Shield" size={12} style={{ color: "#00ff41" }} /> БЕЗОПАСНОСТЬ И ПРИВАТНОСТЬ
        </div>
        {settings.map(s => (
          <div key={s.key} className="flex items-center justify-between p-4 rounded-sm border transition-all"
            style={{
              border: `1px solid ${toggles[s.key] ? `${s.color}30` : "rgba(0,255,255,0.05)"}`,
              background: toggles[s.key] ? `${s.color}05` : "rgba(0,255,255,0.01)",
            }}>
            <div>
              <div className="text-sm font-medium" style={{ color: toggles[s.key] ? s.color : "#446", fontFamily: "'IBM Plex Mono', monospace" }}>{s.label}</div>
              <div className="text-xs mt-0.5" style={{ color: "#334", fontFamily: "'Share Tech Mono', monospace" }}>{s.desc}</div>
            </div>
            <button onClick={() => toggle(s.key)} className="relative w-12 h-6 rounded-sm transition-all duration-300"
              style={{
                background: toggles[s.key] ? `${s.color}30` : "rgba(255,255,255,0.05)",
                border: `1px solid ${toggles[s.key] ? s.color : "rgba(255,255,255,0.1)"}`,
                boxShadow: toggles[s.key] ? `0 0 10px ${s.color}50` : "none",
              }}>
              <div className="absolute top-0.5 h-5 w-5 rounded-sm transition-all duration-300"
                style={{
                  left: toggles[s.key] ? "calc(100% - 22px)" : "2px",
                  background: toggles[s.key] ? s.color : "#333",
                  boxShadow: toggles[s.key] ? `0 0 8px ${s.color}` : "none",
                }} />
            </button>
          </div>
        ))}
        <div className="mt-6 p-4 rounded-sm" style={{ border: "1px solid rgba(255,0,128,0.2)", background: "rgba(255,0,128,0.03)" }}>
          <div className="text-xs tracking-widest mb-3 flex items-center gap-2" style={{ color: "#ff0080", fontFamily: "'Share Tech Mono', monospace" }}>
            <Icon name="AlertTriangle" size={12} style={{ color: "#ff0080" }} /> ОПАСНАЯ ЗОНА
          </div>
          <button className="w-full py-2.5 rounded-sm text-xs tracking-widest"
            style={{ border: "1px solid rgba(255,0,128,0.4)", color: "#ff0080", fontFamily: "'Share Tech Mono', monospace" }}>
            УДАЛИТЬ АККАУНТ
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const [section, setSection] = useState<Section>("chats");
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const unreadCount = NOTIFICATIONS_DATA.filter(n => !n.read).length;
  const navItems: { id: Section; icon: string; label: string }[] = [
    { id: "chats", icon: "MessageSquare", label: "ЧАТЫ" },
    { id: "contacts", icon: "Users", label: "КОНТАКТЫ" },
    { id: "search", icon: "Search", label: "ПОИСК" },
    { id: "notifications", icon: "Bell", label: "СИГНАЛЫ" },
    { id: "profile", icon: "User", label: "ПРОФИЛЬ" },
    { id: "settings", icon: "Settings", label: "НАСТРОЙКИ" },
  ];

  const renderSection = () => {
    switch (section) {
      case "chats": return <ChatsSection />;
      case "contacts": return <ContactsSection />;
      case "notifications": return <NotificationsSection />;
      case "search": return <SearchSection />;
      case "profile": return <ProfileSection />;
      case "settings": return <SettingsSection />;
    }
  };

  return (
    <div className="fixed inset-0 flex overflow-hidden" style={{ background: "#060810", fontFamily: "'IBM Plex Mono', monospace" }}>
      <MatrixBg />
      <ScanlineOverlay />

      {/* Sidebar */}
      <aside className="relative z-10 flex flex-col w-16 md:w-56 flex-shrink-0 border-r"
        style={{
          borderColor: "rgba(0,255,255,0.12)",
          background: "linear-gradient(180deg, rgba(0,10,20,0.98) 0%, rgba(0,5,15,0.98) 100%)",
          boxShadow: "4px 0 30px rgba(0,255,255,0.06)"
        }}>
        {/* Logo */}
        <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: "rgba(0,255,255,0.12)" }}>
          <div className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.5)", boxShadow: "0 0 15px rgba(0,255,255,0.3), 0 0 40px rgba(0,255,255,0.15)" }}>
            <span className="text-xs font-black" style={{ fontFamily: "'Orbitron', sans-serif", color: "#00ffff" }}>TX</span>
          </div>
          <div className="hidden md:block">
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, letterSpacing: "0.3em", fontSize: "14px", color: "#00ffff", textShadow: "0 0 10px #00ffff" }}>TAXE</div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#00ff41", textShadow: "0 0 5px #00ff41", letterSpacing: "0.1em" }}>● ЗАЩИЩЕНО</div>
          </div>
        </div>

        {/* Clock */}
        <div className="hidden md:block px-4 py-3 border-b" style={{ borderColor: "rgba(0,255,255,0.06)" }}>
          <div className="text-xs" style={{ color: "#334", fontFamily: "'Share Tech Mono', monospace" }}>
            {time.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div className="text-xs mt-0.5" style={{ color: "#223", fontFamily: "'Share Tech Mono', monospace" }}>
            {time.toLocaleDateString("ru", { day: "2-digit", month: "2-digit", year: "2-digit" })}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setSection(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 relative transition-all"
              style={{
                borderLeft: section === item.id ? "2px solid #00ffff" : "2px solid transparent",
                background: section === item.id ? "rgba(0,255,255,0.08)" : "transparent",
              }}>
              <div className="relative flex-shrink-0">
                <Icon name={item.icon} size={18} style={{ color: section === item.id ? "#00ffff" : "#334" }} />
                {item.id === "notifications" && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-black font-bold"
                    style={{ background: "#ff0080", fontSize: "8px", boxShadow: "0 0 6px #ff0080" }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="hidden md:block text-xs tracking-widest"
                style={{ fontFamily: "'Orbitron', sans-serif", color: section === item.id ? "#00ffff" : "#334", fontSize: "10px" }}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="hidden md:flex px-4 py-3 border-t items-center gap-2" style={{ borderColor: "rgba(0,255,255,0.08)" }}>
          <div className="w-2 h-2 rounded-full" style={{ background: "#00ff41", boxShadow: "0 0 6px #00ff41" }} />
          <span className="text-xs" style={{ color: "#334", fontFamily: "'Share Tech Mono', monospace" }}>E2E АКТИВНО</span>
        </div>
      </aside>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden" style={{ background: "rgba(4,6,14,0.96)" }}>
        {renderSection()}
      </main>
    </div>
  );
}
