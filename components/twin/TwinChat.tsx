"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { OPENERS } from "@/lib/twin/openers";
import styles from "./twin.module.css";

type Tapback = "heart" | "!!" | "haha" | "like" | "?";
type Msg = { id: number; from: "visitor" | "sarah"; text: string; failed?: boolean; reaction?: Tapback };
type Reply = { reaction: Tapback | null; texts: string[] };

const AVATAR = "/sgu/sarahgu.jpg";
const BURST_WAIT_MS = 1100; // wait this long after the visitor's last text before replying

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => { clearTimeout(t); reject(new DOMException("aborted", "AbortError")); }, { once: true });
  });

function Avatar({ size }: { size: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={styles.avatar} src={AVATAR} alt="" width={size} height={size} style={{ width: size, height: size }} />;
}

const URL_SPLIT = /(https?:\/\/[^\s]+)/g;
// Links are only made tappable when they point at Sarah's own places, so the twin can never be
// talked into handing a visitor a live link to somewhere else.
const LINK_HOSTS = /^https:\/\/([a-z0-9-]+\.)*(sgu\.life|substack\.com)(\/|$)/i;

/** A text's content, with links to Sarah's own sites made tappable. */
function Linked({ text }: { text: string }) {
  return (
    <>
      {text.split(URL_SPLIT).map((part, i) =>
        LINK_HOSTS.test(part)
          ? <a key={i} className={styles.link} href={part} target="_blank" rel="noopener noreferrer">{part.replace(/^https?:\/\//, "")}</a>
          : part,
      )}
    </>
  );
}

function TapbackBadge({ kind }: { kind: Tapback }) {
  return (
    <span className={`${styles.tapback} ${kind === "heart" ? styles.heart : ""}`} aria-label={`Sarah reacted ${kind}`}>
      {kind === "heart" && (
        <svg width="15" height="14" viewBox="0 0 24 22" aria-hidden="true"><path fill="currentColor" d="M12 21.2 2.6 11.9a6 6 0 0 1 8.5-8.5l.9.9.9-.9a6 6 0 0 1 8.5 8.5z" /></svg>
      )}
      {kind === "like" && (
        <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M2 10h4v11H2zM8 21h9.2a2.5 2.5 0 0 0 2.4-1.9l1.6-6.4A2.5 2.5 0 0 0 18.8 9.6H14l.7-3.6A2.6 2.6 0 0 0 12.2 3 8 9.8z" /></svg>
      )}
      {kind === "haha" && <b className={styles.haha}>HA<br />HA</b>}
      {kind === "!!" && <b>!!</b>}
      {kind === "?" && <b>?</b>}
    </span>
  );
}

const TAPBACK_PREVIEW: Record<Tapback, string> = { heart: "Loved", "!!": "Emphasized", haha: "Laughed at", like: "Liked", "?": "Questioned" };

export default function TwinChat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [status, setStatus] = useState<"" | "Delivered" | "Not Delivered">("");
  const [started, setStarted] = useState("");
  const nextId = useRef(1);
  const visit = useRef(""); // random id for this visit, so its exchanges group together in analytics
  const run = useRef<AbortController | null>(null);
  const latest = useRef<Msg[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { latest.current = msgs; }, [msgs]);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing]);

  // Keep the screen fitted to the visible area. When the phone keyboard opens, the visible area
  // shrinks and the browser scrolls the page; tracking it keeps the header pinned at the top and
  // the input sitting on the keyboard.
  useEffect(() => {
    const vv = window.visualViewport;
    const el = stage.current;
    if (!vv || !el) return;
    const fit = () => {
      el.style.setProperty("--vv-height", `${vv.height}px`);
      el.style.setProperty("--vv-top", `${vv.offsetTop}px`);
      if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
    };
    fit();
    vv.addEventListener("resize", fit);
    vv.addEventListener("scroll", fit);
    return () => {
      vv.removeEventListener("resize", fit);
      vv.removeEventListener("scroll", fit);
    };
  }, []);

  // She texts first: dots, then one of the openers in lib/twin/openers.ts.
  useEffect(() => {
    const ctl = new AbortController();
    run.current = ctl;
    (async () => {
      try {
        setStarted(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
        const opener = ["hi", ...OPENERS[Math.floor(Math.random() * OPENERS.length)]];
        await sleep(700, ctl.signal);
        for (let i = 0; i < opener.length; i++) {
          const text = opener[i];
          setTyping(true);
          await sleep(Math.min(2200, 700 + text.length * 34), ctl.signal);
          setTyping(false);
          setMsgs((m) => [...m, { id: nextId.current++, from: "sarah", text }]);
          if (i < opener.length - 1) await sleep(280, ctl.signal);
        }
      } catch { /* the visitor texted first, or the page closed */ }
    })();
    return () => ctl.abort();
  }, []);

  // Sarah's side: wait for the visitor to stop texting, fetch the reply, then send it one text at a time.
  const reply = useCallback(async () => {
    run.current?.abort();
    const ctl = new AbortController();
    run.current = ctl;
    setTyping(false);
    try {
      await sleep(BURST_WAIT_MS, ctl.signal);
      const turns = latest.current.filter((m) => !m.failed).flatMap((m) => {
        const turn = [{ from: m.from, text: m.text }];
        // A tapback is shown to the model as her next line, e.g. "Sarah: [haha]".
        return m.reaction ? [...turn, { from: "sarah" as const, text: `[${m.reaction}]` }] : turn;
      });
      const pending = fetch("/api/twin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ turns, cid: (visit.current ||= crypto.randomUUID()) }),
        signal: ctl.signal,
      });
      await sleep(500, ctl.signal);
      setTyping(true);
      const res = await pending;
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as Reply;
      if (data.reaction) {
        setTyping(false);
        await sleep(350, ctl.signal);
        const kind = data.reaction;
        setMsgs((m) => {
          const last = m.findLastIndex((x) => x.from === "visitor");
          return m.map((x, i) => (i === last ? { ...x, reaction: kind } : x));
        });
        if (data.texts.length) await sleep(900, ctl.signal);
      }
      for (let i = 0; i < data.texts.length; i++) {
        const text = data.texts[i];
        setTyping(true);
        await sleep(Math.min(2400, 450 + text.length * 38), ctl.signal);
        setMsgs((m) => [...m, { id: nextId.current++, from: "sarah", text }]);
        setTyping(false);
        if (i < data.texts.length - 1) await sleep(260, ctl.signal);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return; // the visitor texted again; a newer run takes over
      setTyping(false);
      setStatus("Not Delivered");
      setMsgs((m) => {
        const last = m.findLastIndex((x) => x.from === "visitor");
        return m.map((x, i) => (i === last ? { ...x, failed: true } : x));
      });
    }
  }, []);

  const send = useCallback(() => {
    const text = draft.trim().slice(0, 300);
    if (!text) return;
    const mine: Msg = { id: nextId.current++, from: "visitor", text };
    setDraft("");
    setStatus("Delivered");
    setMsgs((m) => [...m, mine]);
    latest.current = [...latest.current, mine];
    if (field.current) field.current.style.height = "auto";
    void reply();
  }, [draft, reply]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const onInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const lastVisitor = msgs.findLastIndex((m) => m.from === "visitor");
  const last = msgs[msgs.length - 1];
  const preview = typing
    ? "…"
    : !last
      ? ""
      : last.from === "visitor" && last.reaction
        ? `${TAPBACK_PREVIEW[last.reaction]} “${last.text}”`
        : last.text;

  const video = (
    <svg width="26" height="17" viewBox="0 0 26 17" aria-hidden="true"><rect x="1" y="1" width="16" height="15" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m18.5 6.5 5.3-3.2a.8.8 0 0 1 1.2.7v9a.8.8 0 0 1-1.2.7l-5.3-3.2z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
  );

  return (
    <div className={styles.stage} ref={stage}>
      <div className={styles.window}>
        {/* Desktop only: the conversation list */}
        <aside className={styles.sidebar}>
          <div className={styles.lights}><a href="https://sgu.life" aria-label="Close" /><i /><i /></div>
          <div className={styles.search} aria-hidden="true">Search</div>
          <div className={styles.convo} aria-hidden="true">
            <Avatar size={44} />
            <div className={styles.convoText}>
              <div className={styles.convoTop}><b>Sarah Gu</b><span>{started}</span></div>
              <p>{preview}</p>
            </div>
          </div>
        </aside>

        <section className={styles.chat}>
          <header className={styles.header}>
            <a className={styles.back} href="https://sgu.life" aria-label="Back">
              <svg width="12" height="20" viewBox="0 0 12 20" aria-hidden="true"><path d="M10 2 2 10l8 8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <div className={styles.who}>
              <span className={styles.to}>To:</span>
              <Avatar size={46} />
              <div className={styles.name}>
                <b>Sarah Gu</b>
                <svg className={styles.chev} width="6" height="10" viewBox="0 0 6 10" aria-hidden="true"><path d="m1 1 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>
            <span className={styles.video}>{video}</span>
          </header>

          <div className={styles.scroller} ref={scroller}>
            <div className={styles.thread} role="log" aria-live="polite">
              {started && (
                <p className={styles.stamp}>
                  <b>iMessage</b>
                  <span>Today {started}</span>
                </p>
              )}
              {msgs.map((m, i) => {
                const next = msgs[i + 1];
                const tail = !next || next.from !== m.from;
                return (
                  <div key={m.id} className={`${styles.row} ${m.from === "visitor" ? styles.mine : styles.theirs} ${tail ? styles.tail : ""} ${m.reaction ? styles.reacted : ""}`}>
                    <div className={`${styles.bubble} ${m.failed ? styles.failed : ""}`}>
                      <Linked text={m.text} />
                      {m.reaction && <TapbackBadge kind={m.reaction} />}
                    </div>
                    {i === lastVisitor && status && (
                      <div className={`${styles.status} ${status === "Not Delivered" ? styles.bad : ""}`}>{status}</div>
                    )}
                  </div>
                );
              })}
              {typing && (
                <div className={`${styles.row} ${styles.theirs} ${styles.tail}`}>
                  <div className={`${styles.bubble} ${styles.dots}`} aria-label="Sarah is typing"><i /><i /><i /></div>
                </div>
              )}
            </div>
          </div>

          <form className={styles.composer} onSubmit={(e) => { e.preventDefault(); send(); }}>
            <div className={styles.field}>
              <textarea
                ref={field}
                rows={1}
                value={draft}
                onChange={onInput}
                onKeyDown={onKeyDown}
                placeholder="iMessage"
                aria-label="Message"
                maxLength={300}
                autoComplete="off"
                enterKeyHint="send"
              />
              <button type="submit" disabled={!draft.trim()} aria-label="Send">
                <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true"><path d="M7 15V2M1.5 7 7 1.5 12.5 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
