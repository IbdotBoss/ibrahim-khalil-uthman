"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { applications, about, profile, type Record } from "@/data/records";
import Clock from "./Clock";
import Stickers from "./Stickers";

const FAVE_KEY = "uthman-site:favourites";

function matches(query: string, r: Record, appName: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    r.name.toLowerCase().includes(q) ||
    r.meta.toLowerCase().includes(q) ||
    r.state.toLowerCase().includes(q) ||
    r.year.includes(q) ||
    appName.toLowerCase().includes(q)
  );
}

function Star({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <span
      className="star"
      data-on={on}
      role="button"
      tabIndex={0}
      aria-label={on ? `Unstar ${label}` : `Star ${label}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }
      }}
    >
      {on ? "★" : "☆"}
    </span>
  );
}

export default function Shell() {
  const [query, setQuery] = useState("");
  const [faves, setFaves] = useState<string[]>([]);
  const [activeRecord, setActiveRecord] = useState<string>("about");
  const [activeApp, setActiveApp] = useState<string>("About");
  const [dim, setDim] = useState(true);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const railRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FAVE_KEY);
      if (raw) setFaves(JSON.parse(raw));
    } catch {}
  }, []);

  const toggleFave = useCallback((id: string) => {
    setFaves((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        window.localStorage.setItem(FAVE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setDim(window.scrollY < 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = useMemo(
    () =>
      applications
        .map((app) => ({ ...app, records: app.records.filter((r) => matches(query, r, app.name)) }))
        .filter((app) => app.records.length > 0),
    [query]
  );

  const aboutVisible = !query || "about".includes(query.toLowerCase());

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-spy]");
    if (!nodes.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!top) return;
        const el = top.target as HTMLElement;
        setActiveRecord(el.dataset.spy ?? "");
        setActiveApp(el.dataset.app ?? "");
      },
      { rootMargin: "-46px 0px -65% 0px", threshold: 0 }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [filtered, aboutVisible]);

  const jump = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const favedRecords = applications
    .flatMap((a) => a.records.map((r) => ({ r, app: a })))
    .filter(({ r }) => faves.includes(r.id));

  const favedMatches = favedRecords.filter(({ r, app }) => matches(query, r, app.name));

  const isOpen = (id: string) => Boolean(query) || !collapsed.includes(id);
  const toggleApp = (id: string) =>
    setCollapsed((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <>
      <header className="header">
        <div className="wordmark">
          {profile.name.slice(0, profile.greenIndex)}
          <span className="mark">{profile.name.slice(profile.greenIndex, profile.greenIndex + 1)}</span>
          {profile.name.slice(profile.greenIndex + 1)}
        </div>
        <button
          className="pill"
          onClick={() => jump(activeRecord === "about" ? "about" : `app-${activeApp.toLowerCase()}`)}
        >
          {activeApp || "About"}
        </button>
        <div className="headmeta">
          <Clock />
          <span className="avatar" aria-hidden="true">
            UI
          </span>
        </div>
      </header>

      <nav
        className="rail"
        ref={railRef}
        data-dim={dim && !query}
        onMouseEnter={() => setDim(false)}
        aria-label="Modules"
      >
        <div className="filterwrap">
          <input
            className="filter"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter"
            aria-label="Filter modules and records"
          />
        </div>

        <div className="railrow">
          {query && <p className="railgroup">Favorites</p>}
          {query && favedMatches.length === 0 && <p className="railempty">No Results</p>}

          {(query ? favedMatches : favedRecords).length > 0 && (
            <div className="appblock">
              {!query && <div className="appname">Favorites</div>}
              <div className="modules railmodules-mobilehide">
                {(query ? favedMatches : favedRecords).map(({ r }) => (
                  <button
                    key={`fav-${r.id}`}
                    className="module"
                    data-active={activeRecord === r.id}
                    onClick={() => jump(`rec-${r.id}`)}
                  >
                    <span>{r.name}</span>
                    <Star on onClick={() => toggleFave(r.id)} label={r.name} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && <p className="railgroup">All results</p>}

          {aboutVisible && (
            <div className="appblock">
              <button className="appname" onClick={() => jump("about")}>
                <span>{about.name}</span>
              </button>
            </div>
          )}

          {filtered.map((app) => (
            <div className="appblock" key={app.id}>
              <div className="appname">
                <button
                  className="chev"
                  aria-expanded={isOpen(app.id)}
                  aria-controls={`modules-${app.id}`}
                  aria-label={`${isOpen(app.id) ? "Collapse" : "Expand"} ${app.name}`}
                  onClick={() => toggleApp(app.id)}
                  disabled={Boolean(query)}
                >
                  {isOpen(app.id) ? "⌄" : "›"}
                </button>
                <button className="appjump" onClick={() => jump(`app-${app.id}`)}>
                  <span>{app.name}</span>
                </button>
                <Star
                  on={faves.includes(`app:${app.id}`)}
                  onClick={() => toggleFave(`app:${app.id}`)}
                  label={app.name}
                />
              </div>
              <div
                className="modules railmodules-mobilehide"
                id={`modules-${app.id}`}
                hidden={!isOpen(app.id)}
              >
                {app.records.map((r) => (
                  <button
                    key={r.id}
                    className="module"
                    data-active={activeRecord === r.id}
                    onClick={() => jump(`rec-${r.id}`)}
                  >
                    <span>{r.name}</span>
                    <Star on={faves.includes(r.id)} onClick={() => toggleFave(r.id)} label={r.name} />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && !aboutVisible && <p className="railempty">No Results</p>}
        </div>
      </nav>

      <main className="main">
        <div className="inner">
          {aboutVisible && (
            <section className="about" id="about" data-spy="about" data-app="About">
              <span className="placeholdertag">placeholder copy</span>
              <h1 className="hello">Hey, I&apos;m Uthman</h1>
              {about.lines.map((line, i) => (
                <p className="abouttext" key={i}>
                  {line}
                </p>
              ))}
              <Stickers />
              <p className="scrollhint">scroll, or pick a module</p>
            </section>
          )}

          {filtered.map((app) => (
            <section key={app.id}>
              <div className="listtoolbar" id={`app-${app.id}`}>
                <span className="listtitle">{app.name}</span>
                <span className="listcount">
                  1 to {app.records.length} of {app.records.length}
                </span>
              </div>
              <div className="breadcrumb">All</div>
              <table className="recordtable">
                <thead>
                  <tr>
                    <th style={{ width: "26%" }}>Name</th>
                    <th style={{ width: "14%" }}>State</th>
                    <th className="colmeta">Stack</th>
                    <th style={{ width: "10%" }}>Year</th>
                  </tr>
                </thead>
                <tbody>
                  {app.records.map((r, i) => (
                    <Fragment key={r.id}>
                      <tr data-zebra={i % 2 === 1} id={`rec-${r.id}`} data-spy={r.id} data-app={app.name}>
                        <td>
                          {r.href ? (
                            <a
                              className="recname"
                              href={r.href}
                              target={r.href.startsWith("http") ? "_blank" : undefined}
                              rel="noreferrer"
                            >
                              {r.name}
                            </a>
                          ) : (
                            <span className="recname">{r.name}</span>
                          )}
                        </td>
                        <td className="colstate">{r.state}</td>
                        <td className="colmeta">{r.meta || "—"}</td>
                        <td className="colyear">{r.year || "—"}</td>
                      </tr>
                      {(r.problem || r.built) && (
                        <tr data-zebra={i % 2 === 1}>
                          <td colSpan={4}>
                            <div className="detail">
                              {r.problem && <p>{r.problem}</p>}
                              {r.built && <p>{r.built}</p>}
                              {r.rich && <div className="visual">visual placeholder</div>}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </section>
          ))}

          {filtered.length === 0 && !aboutVisible && (
            <p className="noresults">Nothing matches “{query}”.</p>
          )}
        </div>
      </main>
    </>
  );
}
