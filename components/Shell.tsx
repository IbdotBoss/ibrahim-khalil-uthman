"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { applications, about, profile, type Rec } from "@/data/records";
import Clock from "./Clock";
import Stickers, { type StickerFile } from "./Stickers";
import Bismillah from "./Bismillah";
import Disclaimer from "./Disclaimer";
import Nameplate from "./Nameplate";
import Chevron from "./Chevron";

export type Shot = { src: string; width: number; height: number };

const FAVE_KEY = "uthman-site:favourites";

function matches(query: string, r: Rec, appName: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  const haystack = [r.name, appName, ...Object.values(r.fields)].join(" ").toLowerCase();
  return haystack.includes(q);
}

function Star({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      className="star"
      data-on={on}
      aria-pressed={on}
      aria-label={`Star ${label}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {on ? "★" : "☆"}
    </button>
  );
}

export default function Shell({
  stickers,
  shots,
}: {
  stickers: StickerFile[];
  shots: Record<string, Shot>;
}) {
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
    // The filter belongs in the URL, so a filtered view can be sent to someone.
    // Read after mount rather than during render: the server has no location.
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
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

  const changeQuery = useCallback((next: string) => {
    setQuery(next);
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("q", next);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
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
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, []);

  // Every rail entry is a real link, so it can be opened in a tab, copied, or
  // shared. Plain left clicks are intercepted only to soften the scroll and to
  // record the hash; anything with a modifier is left to the browser.
  const navigate = useCallback(
    (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      jump(id);
      window.history.replaceState(null, "", `#${id}`);
    },
    [jump]
  );

  const favedRecords = useMemo(
    () =>
      applications
        .flatMap((a) => a.records.map((r) => ({ r, app: a })))
        .filter(({ r }) => faves.includes(r.id)),
    [faves]
  );

  const favedMatches = useMemo(
    () => favedRecords.filter(({ r, app }) => matches(query, r, app.name)),
    [favedRecords, query]
  );

  const isOpen = (id: string) => Boolean(query) || !collapsed.includes(id);
  const toggleApp = (id: string) =>
    setCollapsed((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const activeHref = activeAppId === "about" ? "#about" : `#app-${activeAppId}`;

  return (
    <>
      <a className="skiplink" href="#main">
        Skip to content
      </a>

      <header className="header">
        <div className="wordmark">
          {profile.name.slice(0, profile.greenIndex)}
          <span className="mark">{profile.name.slice(profile.greenIndex, profile.greenIndex + 1)}</span>
          {profile.name.slice(profile.greenIndex + 1)}
        </div>
        <a className="pill" href={activeHref} onClick={navigate(activeHref.slice(1))}>
          {activeApp || "About"}
        </a>
        <div className="headmeta">
          <Clock />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="avatar" src="/stickers/avatar.jpg" alt="Ibrahim Uthman" width={160} height={160} />
        </div>
      </header>

      <nav className="rail" ref={railRef} aria-label="Modules">
        <div className="filterwrap">
          <input
            className="filter"
            type="search"
            value={query}
            onChange={(e) => changeQuery(e.target.value)}
            placeholder="Filter…"
            aria-label="Filter modules and records"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
          />
        </div>

        <div className="railrow">
          {query && <p className="railgroup">Favorites</p>}
          {query && favedMatches.length === 0 && <p className="railempty">No Results</p>}

          {(query ? favedMatches : favedRecords).length > 0 && (
            <div className="appblock">
              {!query && (
                <div className="appname">
                  <span className="chev" aria-hidden="true" />
                  <span className="appjump appjumpstatic">Favorites</span>
                </div>
              )}
              <div className="modules railmodules-mobilehide">
                {(query ? favedMatches : favedRecords).map(({ r }) => (
                  <div className="module" data-active={activeRecord === r.id} key={`fav-${r.id}`}>
                    <a
                      className="modulelink"
                      href={`#rec-${r.id}`}
                      aria-current={activeRecord === r.id ? "true" : undefined}
                      onClick={navigate(`rec-${r.id}`)}
                    >
                      {r.name}
                    </a>
                    <Star on onClick={() => toggleFave(r.id)} label={r.name} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {query && <p className="railgroup">All results</p>}

          {aboutVisible && (
            <div className="appblock">
              <div className="appname">
                <span className="chev" aria-hidden="true" />
                <a className="appjump" href="#about" onClick={navigate("about")}>
                  {about.name}
                </a>
              </div>
            </div>
          )}

          {filtered.map((app) => (
            <div className="appblock" key={app.id}>
              <div className="appname">
                <button
                  type="button"
                  className="chev"
                  aria-expanded={isOpen(app.id)}
                  aria-controls={`modules-${app.id}`}
                  aria-disabled={query ? true : undefined}
                  aria-label={
                    query
                      ? `${app.name} stays open while a filter is active`
                      : `${isOpen(app.id) ? "Collapse" : "Expand"} ${app.name}`
                  }
                  onClick={() => {
                    if (query) return;
                    toggleApp(app.id);
                  }}
                >
                  <Chevron open={isOpen(app.id)} />
                </button>
                <a className="appjump" href={`#app-${app.id}`} onClick={navigate(`app-${app.id}`)}>
                  {app.name}
                </a>
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
                  <div className="module" data-active={activeRecord === r.id} key={r.id}>
                    <a
                      className="modulelink"
                      href={`#rec-${r.id}`}
                      aria-current={activeRecord === r.id ? "true" : undefined}
                      onClick={navigate(`rec-${r.id}`)}
                    >
                      {r.name}
                    </a>
                    <Star on={faves.includes(r.id)} onClick={() => toggleFave(r.id)} label={r.name} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && !aboutVisible && <p className="railempty">No Results</p>}
        </div>
      </nav>

      <main className="main" id="main" tabIndex={-1}>
        {aboutVisible && (
          <section className="about" id="about" data-spy="about" data-app="About" data-appid="about">
            <div className="aboutinner">
              <Bismillah />
              <div className="helloline">
                <h1 className="hello">Hey, I&rsquo;m Ibrahim</h1>
                <Nameplate />
              </div>
              {about.lines.map((line, i) => (
                <p className="abouttext" key={i}>
                  {line}
                </p>
              ))}
              <div className="stickerstage">
                <Stickers files={stickers} />
                <Disclaimer text={about.caution} />
              </div>
              <p className="visuallyhidden" id="draghint">
                Drag it, or move it with the arrow keys.
              </p>
            </div>
          </section>
        )}

        <div className="inner">
          {filtered.map((app) => (
            <section key={app.id} className="appsection" aria-labelledby={`app-${app.id}-title`}>
              <div className="listtoolbar" id={`app-${app.id}`}>
                <h2 className="listtitle" id={`app-${app.id}-title`}>
                  {app.name}
                </h2>
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
                  <caption className="visuallyhidden">{app.name}</caption>
                  <thead>
                    <tr>
                      {app.columns.map((c) => (
                        <th
                          key={c.key}
                          scope="col"
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
                        {(r.brief || ((r.problem || r.built) && r.siteDetail !== false)) && (
                          <tr data-zebra={i % 2 === 1}>
                            <td colSpan={app.columns.length}>
                              <div className="detail">
                                {r.brief ? (
                                  <p>{r.brief}</p>
                                ) : (
                                  <>
                                    {r.problem && <p>{r.problem}</p>}
                                    {r.built && <p>{r.built}</p>}
                                  </>
                                )}
                                {(() => {
                                  const shot = r.shot ? shots[r.shot] : undefined;
                                  if (!shot && !r.href && !r.repo) return null;
                                  return (
                                    <div className="evidence">
                                      {shot &&
                                        (r.href ? (
                                          <a className="shot" href={r.href} target="_blank" rel="noreferrer">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                              src={shot.src}
                                              alt={`${r.name}, open the live site`}
                                              width={shot.width || undefined}
                                              height={shot.height || undefined}
                                              loading="lazy"
                                              decoding="async"
                                            />
                                          </a>
                                        ) : (
                                          <span className="shot">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                              src={shot.src}
                                              alt={`${r.name}, a screenshot`}
                                              width={shot.width || undefined}
                                              height={shot.height || undefined}
                                              loading="lazy"
                                              decoding="async"
                                            />
                                          </span>
                                        ))}
                                      {(r.href || r.repo) && (
                                        <p className="projlinks">
                                          {r.href && (
                                            <a href={r.href} target="_blank" rel="noreferrer">
                                              Live site
                                            </a>
                                          )}
                                          {r.repo && (
                                            <a href={r.repo} target="_blank" rel="noreferrer">
                                              Source
                                            </a>
                                          )}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })()}
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
