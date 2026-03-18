import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

// --- SW Update Banner ---
function useSwUpdate() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then((reg) => {
      // Уже есть ожидающий воркер при загрузке
      if (reg.waiting) setWaitingWorker(reg.waiting);

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
          }
        });
      });
    });

    // Перезагружаем страницу когда новый SW стал активным
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  const applyUpdate = useCallback(() => {
    if (!waitingWorker) return;
    waitingWorker.postMessage('SKIP_WAITING');
    setWaitingWorker(null);
  }, [waitingWorker]);

  return { hasUpdate: !!waitingWorker, applyUpdate };
}

function UpdateBanner({ onUpdate }: { onUpdate: () => void }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="fixed bottom-4 left-1/2 z-[9999] animate-fade-up"
      style={{ transform: "translateX(-50%)", minWidth: 280, maxWidth: "90vw" }}>
      <div className="flex items-center gap-3 px-4 py-3 rounded-sm"
        style={{
          background: "rgba(6,8,16,0.97)",
          border: "1px solid rgba(0,255,255,0.5)",
          boxShadow: "0 0 30px rgba(0,255,255,0.2), 0 8px 32px rgba(0,0,0,0.6)",
        }}>
        <div className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center"
          style={{ background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.3)" }}>
          <Icon name="RefreshCw" size={14} style={{ color: "#00ffff" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold" style={{ fontFamily: "'Orbitron', sans-serif", color: "#00ffff", fontSize: "10px" }}>
            ДОСТУПНО ОБНОВЛЕНИЕ
          </div>
          <div className="text-xs mt-0.5" style={{ fontFamily: "'Share Tech Mono', monospace", color: "#446", fontSize: "9px" }}>
            Новая версия TAXE готова к установке
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={onUpdate}
            className="px-3 py-1.5 rounded-sm text-xs tracking-widest transition-all hover:opacity-80"
            style={{
              background: "rgba(0,255,255,0.15)",
              border: "1px solid #00ffff",
              color: "#00ffff",
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "9px",
              boxShadow: "0 0 10px rgba(0,255,255,0.3)",
            }}>
            ОБНОВИТЬ
          </button>
          <button onClick={() => setVisible(false)} style={{ color: "#334" }}>
            <Icon name="X" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

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

function ChatView({ chat, onBack, myName, myColor }: { chat: typeof CHATS_DATA[0]; onBack: () => void; myName: string; myColor: string }) {
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
          <div key={msg.id} className={`flex flex-col gap-1 ${msg.sent ? "items-end" : "items-start"}`}>
            <div className="text-xs px-1" style={{ color: "#335", fontFamily: "'Share Tech Mono', monospace", fontSize: "9px" }}>
              {msg.sent ? myName : chat.contact.name}
            </div>
            <div className="max-w-xs lg:max-w-md px-4 py-2.5 rounded-sm"
              style={msg.sent
                ? { background: `linear-gradient(135deg,${myColor}18,${myColor}08)`, border: `1px solid ${myColor}50`, boxShadow: `0 0 10px ${myColor}15` }
                : { background: "linear-gradient(135deg,rgba(191,0,255,0.1),rgba(191,0,255,0.05))", border: "1px solid rgba(191,0,255,0.3)", boxShadow: "0 0 10px rgba(191,0,255,0.1)" }}>
              <div className="text-sm" style={{ fontFamily: "'IBM Plex Mono', monospace", color: msg.sent ? myColor : "#bf00ff" }}>{msg.text}</div>
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

function ChatsSection({ myName, myColor }: { myName: string; myColor: string }) {
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
          ? <ChatView chat={active} onBack={() => setActive(null)} myName={myName} myColor={myColor} />
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

const NEON_COLORS = [
  { hex: "#00ffff", label: "CYAN" },
  { hex: "#bf00ff", label: "PURPLE" },
  { hex: "#ff0080", label: "PINK" },
  { hex: "#00ff41", label: "GREEN" },
  { hex: "#ff6600", label: "ORANGE" },
  { hex: "#ffff00", label: "YELLOW" },
  { hex: "#ffffff", label: "WHITE" },
];

const STATUS_OPTIONS = [
  { value: "online", label: "В СЕТИ", color: "#00ff41" },
  { value: "away", label: "НЕ АКТИВЕН", color: "#ffaa00" },
  { value: "offline", label: "ОФФЛАЙН", color: "#444" },
];

function ProfileSection() {
  const [glitch, setGlitch] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(() => localStorage.getItem("taxe_name") || "TX_U53R");
  const [bio, setBio] = useState(() => localStorage.getItem("taxe_bio") || "");
  const [color, setColor] = useState(() => localStorage.getItem("taxe_color") || "#00ffff");
  const [status, setStatus] = useState(() => localStorage.getItem("taxe_status") || "online");
  const [photo, setPhoto] = useState<string | null>(() => localStorage.getItem("taxe_photo"));

  const [draftName, setDraftName] = useState(name);
  const [draftBio, setDraftBio] = useState(bio);
  const [draftColor, setDraftColor] = useState(color);
  const [draftStatus, setDraftStatus] = useState(status);
  const [draftPhoto, setDraftPhoto] = useState<string | null>(photo);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const avatarText = (draftName || name).slice(0, 2).toUpperCase();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setDraftPhoto(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setDraftPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    const t = setInterval(() => { setGlitch(true); setTimeout(() => setGlitch(false), 300); }, 6000);
    return () => clearInterval(t);
  }, []);

  const handleEdit = () => {
    setDraftName(name);
    setDraftBio(bio);
    setDraftColor(color);
    setDraftStatus(status);
    setDraftPhoto(photo);
    setEditing(true);
  };

  const handleSave = () => {
    const trimmed = draftName.trim() || "TX_U53R";
    setName(trimmed);
    setBio(draftBio.trim());
    setColor(draftColor);
    setStatus(draftStatus);
    setPhoto(draftPhoto);
    localStorage.setItem("taxe_name", trimmed);
    localStorage.setItem("taxe_bio", draftBio.trim());
    localStorage.setItem("taxe_color", draftColor);
    localStorage.setItem("taxe_status", draftStatus);
    if (draftPhoto) localStorage.setItem("taxe_photo", draftPhoto);
    else localStorage.removeItem("taxe_photo");
    window.dispatchEvent(new Event("taxe_profile_updated"));
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const currentStatus = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(0,255,255,0.1)" }}>
        <div>
          <div className="text-xs tracking-widest mb-1" style={{ color: "#446", fontFamily: "'Share Tech Mono', monospace" }}>ИДЕНТИФИКАЦИЯ</div>
          <div className="text-lg" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: "#00ffff", textShadow: "0 0 15px #00ffff" }}>ПРОФИЛЬ</div>
        </div>
        {!editing ? (
          <button onClick={handleEdit} className="flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs tracking-widest transition-all"
            style={{ border: "1px solid rgba(0,255,255,0.3)", color: "#00ffff", fontFamily: "'Share Tech Mono', monospace" }}>
            <Icon name="Pencil" size={12} /> ИЗМЕНИТЬ
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-sm text-xs tracking-widest"
              style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#446", fontFamily: "'Share Tech Mono', monospace" }}>
              ОТМЕНА
            </button>
            <button onClick={handleSave} className="px-3 py-1.5 rounded-sm text-xs tracking-widest"
              style={{ border: "1px solid #00ffff", color: "#00ffff", background: "rgba(0,255,255,0.1)", fontFamily: "'Share Tech Mono', monospace", boxShadow: "0 0 10px rgba(0,255,255,0.2)" }}>
              СОХРАНИТЬ
            </button>
          </div>
        )}
      </div>

      {saved && (
        <div className="mx-4 mt-3 px-4 py-2 rounded-sm text-xs tracking-widest text-center"
          style={{ border: "1px solid #00ff41", color: "#00ff41", background: "rgba(0,255,65,0.08)", fontFamily: "'Share Tech Mono', monospace" }}>
          ✓ ПРОФИЛЬ ОБНОВЛЁН
        </div>
      )}

      <div className="flex flex-col items-center pt-8 pb-6 px-6">
        {/* Avatar */}
        <div className="relative mb-6">
          <div className={`w-24 h-24 rounded-sm overflow-hidden flex items-center justify-center text-3xl font-bold transition-all duration-300 ${glitch && !editing ? "glitch-text" : ""}`}
            data-text={avatarText}
            style={{
              fontFamily: "'Orbitron', sans-serif",
              background: `linear-gradient(135deg, ${editing ? draftColor : color}18, ${editing ? draftColor : color}08)`,
              border: `2px solid ${editing ? draftColor : color}80`,
              color: editing ? draftColor : color,
              boxShadow: `0 0 30px ${editing ? draftColor : color}30, inset 0 0 20px ${editing ? draftColor : color}08`,
            }}>
            {(editing ? draftPhoto : photo) ? (
              <img src={(editing ? draftPhoto : photo)!} alt="avatar"
                className="w-full h-full object-cover" style={{ filter: "saturate(1.2) contrast(1.05)" }} />
            ) : avatarText}
          </div>

          {/* Upload button in edit mode */}
          {editing && (
            <div className="absolute inset-0 w-24 h-24 rounded-sm flex flex-col items-center justify-center gap-1.5 opacity-0 hover:opacity-100 transition-all"
              style={{ background: "rgba(0,0,0,0.82)", border: `2px solid ${draftColor}80` }}>
              <button onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-1.5 px-2 py-1 rounded-sm transition-all hover:opacity-80"
                style={{ background: `${draftColor}20`, border: `1px solid ${draftColor}60` }}>
                <Icon name="Camera" size={12} style={{ color: draftColor }} />
                <span style={{ color: draftColor, fontFamily: "'Share Tech Mono', monospace", fontSize: "8px" }}>КАМЕРА</span>
              </button>
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-2 py-1 rounded-sm transition-all hover:opacity-80"
                style={{ background: `${draftColor}20`, border: `1px solid ${draftColor}60` }}>
                <Icon name="Image" size={12} style={{ color: draftColor }} />
                <span style={{ color: draftColor, fontFamily: "'Share Tech Mono', monospace", fontSize: "8px" }}>ГАЛЕРЕЯ</span>
              </button>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhotoUpload} />

          {/* Remove photo btn */}
          {editing && draftPhoto && (
            <button onClick={handleRemovePhoto}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "#ff0080", boxShadow: "0 0 6px #ff0080" }}>
              <Icon name="X" size={10} style={{ color: "#fff" }} />
            </button>
          )}

          <div className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: currentStatus.color, boxShadow: `0 0 8px ${currentStatus.color}` }}>
            <div className="w-2 h-2 rounded-full bg-black" />
          </div>
        </div>

        {/* Name */}
        {editing ? (
          <div className="w-full mb-3">
            <div className="text-xs tracking-widest mb-1.5" style={{ color: "#446", fontFamily: "'Share Tech Mono', monospace" }}>ИМЯ АГЕНТА</div>
            <input
              className="w-full px-3 py-2.5 rounded-sm bg-transparent outline-none text-center text-lg font-bold"
              style={{
                border: `1px solid ${draftColor}60`,
                color: draftColor,
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: "0.15em",
                caretColor: draftColor,
                background: `${draftColor}05`,
              }}
              value={draftName}
              onChange={e => setDraftName(e.target.value)}
              maxLength={20}
              placeholder="TX_U53R"
            />
          </div>
        ) : (
          <div className="text-2xl font-bold mb-1" style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.2em", color, textShadow: `0 0 15px ${color}` }}>
            {name}
          </div>
        )}

        {/* Bio */}
        {editing ? (
          <div className="w-full mb-4">
            <div className="text-xs tracking-widest mb-1.5" style={{ color: "#446", fontFamily: "'Share Tech Mono', monospace" }}>СТАТУС / БИО</div>
            <input
              className="w-full px-3 py-2 rounded-sm bg-transparent outline-none text-sm"
              style={{
                border: "1px solid rgba(0,255,255,0.2)",
                color: "#00ffff",
                fontFamily: "'IBM Plex Mono', monospace",
                caretColor: "#00ffff",
                background: "rgba(0,255,255,0.03)",
              }}
              value={draftBio}
              onChange={e => setDraftBio(e.target.value)}
              maxLength={40}
              placeholder="Твой статус или девиз..."
            />
          </div>
        ) : (
          <div className="mb-2 text-xs text-center" style={{ color: "#446", fontFamily: "'IBM Plex Mono', monospace", minHeight: "16px" }}>
            {bio || ""}
          </div>
        )}

        <div className="flex items-center gap-1 mb-8" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: currentStatus.color, textShadow: `0 0 5px ${currentStatus.color}`, letterSpacing: "0.1em" }}>
          ● {currentStatus.label}
        </div>

        {/* Color picker */}
        {editing && (
          <div className="w-full mb-6">
            <div className="text-xs tracking-widest mb-3" style={{ color: "#446", fontFamily: "'Share Tech Mono', monospace" }}>ЦВЕТ АВАТАРА</div>
            <div className="flex gap-2 flex-wrap">
              {NEON_COLORS.map(c => (
                <button key={c.hex} onClick={() => setDraftColor(c.hex)}
                  className="w-9 h-9 rounded-sm transition-all duration-200 flex items-center justify-center"
                  style={{
                    background: `${c.hex}20`,
                    border: `2px solid ${draftColor === c.hex ? c.hex : "transparent"}`,
                    boxShadow: draftColor === c.hex ? `0 0 12px ${c.hex}` : "none",
                  }}>
                  <div className="w-4 h-4 rounded-sm" style={{ background: c.hex }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Status picker */}
        {editing && (
          <div className="w-full mb-6">
            <div className="text-xs tracking-widest mb-3" style={{ color: "#446", fontFamily: "'Share Tech Mono', monospace" }}>СТАТУС</div>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map(s => (
                <button key={s.value} onClick={() => setDraftStatus(s.value)}
                  className="flex-1 py-2 rounded-sm text-xs tracking-widest transition-all"
                  style={{
                    border: `1px solid ${draftStatus === s.value ? s.color : "rgba(255,255,255,0.08)"}`,
                    color: draftStatus === s.value ? s.color : "#446",
                    background: draftStatus === s.value ? `${s.color}10` : "transparent",
                    fontFamily: "'Share Tech Mono', monospace",
                    boxShadow: draftStatus === s.value ? `0 0 8px ${s.color}40` : "none",
                  }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 w-full mb-8">
          {[{ label: "ЧАТОВ", value: "3" }, { label: "КОНТАКТОВ", value: "6" }, { label: "СООБЩЕНИЙ", value: "48" }].map(s => (
            <div key={s.label} className="flex flex-col items-center p-3 rounded-sm" style={{ border: "1px solid rgba(0,255,255,0.15)", background: "rgba(0,255,255,0.03)" }}>
              <div className="text-xl font-bold" style={{ fontFamily: "'Orbitron', sans-serif", color: "#00ffff", textShadow: "0 0 10px #00ffff" }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: "#334", fontFamily: "'Share Tech Mono', monospace" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="w-full space-y-3">
          {[
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

const AUTH_URL = "https://functions.poehali.dev/08d5aa04-b127-4f1e-b7ba-8c28245b787e";

// --- Auth Screen ---
function AuthScreen({ onAuth }: { onAuth: (token: string, user: Record<string, unknown>) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = async () => {
    setError("");
    if (!email || !password || (mode === "register" && !username)) {
      setError("Заполни все поля"); return;
    }
    setLoading(true);
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, email, password, username }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Ошибка сервера"); return; }
      onAuth(data.token, data.user);
    } catch {
      setError("Нет связи с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#060810" }}>
      <MatrixBg />
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.012) 2px, rgba(0,255,255,0.012) 4px)"
      }} />

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-sm mb-4"
            style={{ background: "rgba(0,255,255,0.08)", border: "2px solid rgba(0,255,255,0.4)", boxShadow: "0 0 40px rgba(0,255,255,0.2)" }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 22, color: "#00ffff", textShadow: "0 0 15px #00ffff" }}>TX</span>
          </div>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, letterSpacing: "0.4em", fontSize: 28, color: "#00ffff", textShadow: "0 0 20px #00ffff" }}>TAXE</div>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "#00ff41", letterSpacing: "0.2em", marginTop: 4 }}>● ЗАШИФРОВАННЫЙ МЕССЕНДЖЕР</div>
        </div>

        {/* Card */}
        <div className="rounded-sm p-6" style={{ background: "rgba(6,10,24,0.95)", border: "1px solid rgba(0,255,255,0.2)", boxShadow: "0 0 60px rgba(0,255,255,0.08)" }}>
          {/* Tabs */}
          <div className="flex mb-6 rounded-sm overflow-hidden" style={{ border: "1px solid rgba(0,255,255,0.15)" }}>
            {(["login", "register"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className="flex-1 py-2.5 text-xs tracking-widest transition-all"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 10,
                  background: mode === m ? "rgba(0,255,255,0.12)" : "transparent",
                  color: mode === m ? "#00ffff" : "#334",
                  borderRight: m === "login" ? "1px solid rgba(0,255,255,0.15)" : "none",
                  boxShadow: mode === m ? "inset 0 0 20px rgba(0,255,255,0.05)" : "none",
                }}>
                {m === "login" ? "ВОЙТИ" : "СОЗДАТЬ АК"}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {/* Email */}
            <div>
              <div className="text-xs mb-1.5 tracking-widest" style={{ color: "#334", fontFamily: "'Share Tech Mono', monospace" }}>EMAIL</div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-sm" style={{ border: "1px solid rgba(0,255,255,0.2)", background: "rgba(0,255,255,0.03)" }}>
                <Icon name="Mail" size={14} style={{ color: "#334" }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submit()}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: "#00ffff", fontFamily: "'IBM Plex Mono', monospace", caretColor: "#00ffff" }}
                  placeholder="agent@taxe.app" />
              </div>
            </div>

            {/* Username (only register) */}
            {mode === "register" && (
              <div>
                <div className="text-xs mb-1.5 tracking-widest" style={{ color: "#334", fontFamily: "'Share Tech Mono', monospace" }}>ИМЯ АГЕНТА</div>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-sm" style={{ border: "1px solid rgba(0,255,255,0.2)", background: "rgba(0,255,255,0.03)" }}>
                  <Icon name="User" size={14} style={{ color: "#334" }} />
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && submit()}
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: "#00ffff", fontFamily: "'IBM Plex Mono', monospace", caretColor: "#00ffff" }}
                    placeholder="TX_AGENT" maxLength={20} />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <div className="text-xs mb-1.5 tracking-widest" style={{ color: "#334", fontFamily: "'Share Tech Mono', monospace" }}>ПАРОЛЬ</div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-sm" style={{ border: "1px solid rgba(0,255,255,0.2)", background: "rgba(0,255,255,0.03)" }}>
                <Icon name="Lock" size={14} style={{ color: "#334" }} />
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submit()}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: "#00ffff", fontFamily: "'IBM Plex Mono', monospace", caretColor: "#00ffff" }}
                  placeholder="••••••••" />
                <button onClick={() => setShowPass(v => !v)} style={{ color: "#334" }}>
                  <Icon name={showPass ? "EyeOff" : "Eye"} size={14} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="px-3 py-2 rounded-sm text-xs" style={{ border: "1px solid rgba(255,0,128,0.3)", background: "rgba(255,0,128,0.06)", color: "#ff0080", fontFamily: "'Share Tech Mono', monospace" }}>
                ⚠ {error}
              </div>
            )}

            {/* Submit */}
            <button onClick={submit} disabled={loading}
              className="w-full py-3 rounded-sm text-xs tracking-widest transition-all mt-2"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 11,
                background: loading ? "rgba(0,255,255,0.05)" : "rgba(0,255,255,0.12)",
                border: "1px solid rgba(0,255,255,0.5)",
                color: loading ? "#334" : "#00ffff",
                boxShadow: loading ? "none" : "0 0 20px rgba(0,255,255,0.15)",
              }}>
              {loading ? "ШИФРОВАНИЕ..." : mode === "login" ? "ВОЙТИ В СИСТЕМУ" : "СОЗДАТЬ АККАУНТ"}
            </button>
          </div>
        </div>

        <div className="text-center mt-4 text-xs" style={{ color: "#223", fontFamily: "'Share Tech Mono', monospace" }}>
          AES-256 · END-TO-END · ZERO KNOWLEDGE
        </div>
      </div>
    </div>
  );
}

// --- Global profile hook ---
function useProfile() {
  const [name, setNameState] = useState(() => localStorage.getItem("taxe_name") || "TX_U53R");
  const [color, setColorState] = useState(() => localStorage.getItem("taxe_color") || "#00ffff");
  const [status, setStatusState] = useState(() => localStorage.getItem("taxe_status") || "online");
  const [photo, setPhotoState] = useState<string | null>(() => localStorage.getItem("taxe_photo"));

  const setName = (v: string) => { setNameState(v); localStorage.setItem("taxe_name", v); };
  const setColor = (v: string) => { setColorState(v); localStorage.setItem("taxe_color", v); };
  const setStatus = (v: string) => { setStatusState(v); localStorage.setItem("taxe_status", v); };

  const refresh = () => {
    setNameState(localStorage.getItem("taxe_name") || "TX_U53R");
    setColorState(localStorage.getItem("taxe_color") || "#00ffff");
    setStatusState(localStorage.getItem("taxe_status") || "online");
    setPhotoState(localStorage.getItem("taxe_photo"));
  };

  useEffect(() => {
    window.addEventListener("storage", refresh);
    window.addEventListener("taxe_profile_updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("taxe_profile_updated", refresh);
    };
  }, []);

  return { name, color, status, photo, setName, setColor, setStatus };
}

export default function Index() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("taxe_token"));
  const [section, setSection] = useState<Section>("chats");
  const [time, setTime] = useState(new Date());
  const profile = useProfile();

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const handleAuth = (newToken: string, user: Record<string, unknown>) => {
    localStorage.setItem("taxe_token", newToken);
    localStorage.setItem("taxe_name", (user.username as string) || "TX_U53R");
    localStorage.setItem("taxe_color", (user.color as string) || "#00ffff");
    localStorage.setItem("taxe_status", (user.status as string) || "online");
    localStorage.setItem("taxe_bio", (user.bio as string) || "");
    if (user.photo) localStorage.setItem("taxe_photo", user.photo as string);
    window.dispatchEvent(new Event("taxe_profile_updated"));
    setToken(newToken);
  };

  const handleLogout = () => {
    fetch(AUTH_URL, { method: "POST", headers: { "Content-Type": "application/json", "X-Session-Token": token || "" }, body: JSON.stringify({ action: "logout" }) });
    localStorage.removeItem("taxe_token");
    setToken(null);
  };

  const { hasUpdate, applyUpdate } = useSwUpdate();

  if (!token) return <AuthScreen onAuth={handleAuth} />;
  const unreadCount = NOTIFICATIONS_DATA.filter(n => !n.read).length;
  const avatarText = profile.name.slice(0, 2).toUpperCase();
  const statusColor = STATUS_OPTIONS.find(s => s.value === profile.status)?.color || "#00ff41";

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
      case "chats": return <ChatsSection myName={profile.name} myColor={profile.color} />;
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
                borderLeft: section === item.id ? `2px solid ${profile.color}` : "2px solid transparent",
                background: section === item.id ? `${profile.color}10` : "transparent",
              }}>
              <div className="relative flex-shrink-0">
                <Icon name={item.icon} size={18} style={{ color: section === item.id ? profile.color : "#334" }} />
                {item.id === "notifications" && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-black font-bold"
                    style={{ background: "#ff0080", fontSize: "8px", boxShadow: "0 0 6px #ff0080" }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="hidden md:block text-xs tracking-widest"
                style={{ fontFamily: "'Orbitron', sans-serif", color: section === item.id ? profile.color : "#334", fontSize: "10px" }}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* User card */}
        <button onClick={() => setSection("profile")}
          className="hidden md:flex px-3 py-3 border-t items-center gap-3 w-full transition-all hover:bg-white/5"
          style={{ borderColor: "rgba(0,255,255,0.08)" }}>
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-sm overflow-hidden flex items-center justify-center text-xs font-bold"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                background: `${profile.color}18`,
                border: `1px solid ${profile.color}60`,
                color: profile.color,
                boxShadow: `0 0 8px ${profile.color}30`,
              }}>
              {profile.photo
                ? <img src={profile.photo} alt="avatar" className="w-full h-full object-cover" />
                : avatarText}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-black"
              style={{ background: statusColor, boxShadow: `0 0 4px ${statusColor}` }} />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-xs font-semibold truncate" style={{ fontFamily: "'Orbitron', sans-serif", color: profile.color, fontSize: "10px" }}>
              {profile.name}
            </div>
            <div className="text-xs" style={{ color: "#334", fontFamily: "'Share Tech Mono', monospace", fontSize: "9px" }}>
              E2E АКТИВНО
            </div>
          </div>
          <Icon name="ChevronRight" size={12} style={{ color: "#334" }} />
        </button>

        {/* Logout */}
        <button onClick={handleLogout}
          className="hidden md:flex px-4 py-2.5 items-center gap-2 w-full transition-all hover:bg-red-950/20"
          style={{ borderTop: "1px solid rgba(255,0,128,0.08)" }}>
          <Icon name="LogOut" size={14} style={{ color: "#334" }} />
          <span className="text-xs tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace", color: "#334", fontSize: "9px" }}>ВЫЙТИ</span>
        </button>
      </aside>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden" style={{ background: "rgba(4,6,14,0.96)" }}>
        {renderSection()}
      </main>

      {/* Update banner */}
      {hasUpdate && <UpdateBanner onUpdate={applyUpdate} />}
    </div>
  );
}