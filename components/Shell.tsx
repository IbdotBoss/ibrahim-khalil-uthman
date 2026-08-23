"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { applications, about, profile, type Rec } from "@/data/records";
import Clock from "./Clock";
import Stickers from "./Stickers";
import Bismillah from "./Bismillah";
import Disclaimer from "./Disclaimer";

const FAVE_KEY = "uthman-site:favourites";

function matches(query: string, r: Rec, appName: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  const haystack = [r.name, appName, ...Object.values(r.fields)].join(" ").toLowerCase();
  return haystack.includes(q);
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

export default function Shell({ stickers }: { stickers: { file: string; cutout: boolean }[] }) {
  const [query, setQuery] = useState("");
  const [faves, setFaves] = useState<string[]>([]);
  const [activeRecord, setActiveRecord] = useState<string>("about");
  const [activeApp, setActiveApp] = useState<string>("About");
  const [activeAppId, setActiveAppId] = useState<string>("about");
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
        setActiveAppId(el.dataset.appid ?? "about");
      },
      { rootMargin: "-64px 0px -60% 0px", threshold: 0 }
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
          onClick={() => jump(activeAppId === "about" ? "about" : `app-${activeAppId}`)}
        >
          {activeApp || "About"}
        </button>
        <div className="headmeta">
          <Clock />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="avatar" src="/stickers/avatar.jpg" alt="Ibrahim Uthman" />
        </div>
      </header>

      <nav
        className="rail"
        ref={railRef}
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
          {aboutVisible && (
          <section className="about" id="about" data-spy="about" data-app="About" data-appid="about">
            <div className="aboutinner">
            <Bismillah />
            <h1 className="hello">Hey, I&apos;m Ibrahim</h1>
            {about.lines.map((line, i) => (
              <p className="abouttext" key={i}>
                {line}
              </p>
            ))}
            <div className="stickerstage">
              <Stickers files={stickers} />
              <Disclaimer text={about.caution} />
            </div>
            <p className="scrollhint">scroll, or pick a module</p>
            </div>
          </section>
        )}

        <div className="inner">
          {filtered.map((app) => (
            <section key={app.id} className="appsection">
              <div className="listtoolbar" id={`app-${app.id}`}>
                <span className="listtitle">{app.name}</span>
                <span className="listcount">
                  1 to {app.records.length} of {app.records.length}
                </span>
              </div>
              <div className="breadcrumb">All</div>
              {app.view === "form" ? (
                app.records.map((r) => (
                  <div className="formview" key={r.id} id={`rec-${r.id}`} data-spy={r.id} data-app={app.name} data-appid={app.id}>
                    <dl className="formgrid">
                      {app.columns.map((c) => (
                        <Fragment key={c.key}>
                          <dt>{c.label}</dt>
                          <dd>{c.key === "name" ? r.name : r.fields[c.key] || "—"}</dd>
                        </Fragment>
                      ))}
                      {r.problem && (
                        <>
                          <dt>Notes</dt>
                          <dd>{r.problem}</dd>
                        </>
                      )}
                    </dl>
                  </div>
                ))
              ) : app.view === "links" ? (
                <ul className="linkspanel">
                  {app.records.map((r) => (
                    <li key={r.id} id={`rec-${r.id}`} data-spy={r.id} data-app={app.name} data-appid={app.id}>
                      <a
                        className="recname"
                        href={r.href}
                        target={r.href && r.href.startsWith("http") ? "_blank" : undefined}
                        rel="noreferrer"
                      >
                        {r.name}
                      </a>
                      <span className="linkhandle">{r.fields.handle}</span>
                      {r.fields.note && <span className="linknote">{r.fields.note}</span>}
                    </li>
                  ))}
                </ul>
              ) : (
              <table className="recordtable">
                <thead>
                  <tr>
                    {app.columns.map((c) => (
                      <th
                        key={c.key}
                        style={c.width ? { width: c.width } : undefined}
                        className={c.hideOnMobile ? "hidemobile" : undefined}
                      >
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {app.records.map((r, i) => (
                    <Fragment key={r.id}>
                      <tr
                        data-zebra={i % 2 === 1}
                        id={`rec-${r.id}`}
                        data-spy={r.id}
                        data-app={app.name}
                        data-appid={app.id}
                      >
                        {app.columns.map((c) => {
                          const value = c.key === "name" ? r.name : r.fields[c.key] ?? "—";
                          return (
                            <td key={c.key} className={c.hideOnMobile ? "hidemobile" : undefined}>
                              {c.key === "name" && r.href ? (
                                <a
                                  className="recname"
                                  href={r.href}
                                  target={r.href.startsWith("http") ? "_blank" : undefined}
                                  rel="noreferrer"
                                >
                                  {value}
                                </a>
                              ) : c.key === "name" ? (
                                <span className="recname">{value}</span>
                              ) : (
                                value || "—"
                              )}
                            </td>
                          );
                        })}
                      </tr>
                      {r.siteDetail !== false && (r.problem || r.built) && (
                        <tr data-zebra={i % 2 === 1}>
                          <td colSpan={app.columns.length}>
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
              )}
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
