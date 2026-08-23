import type { Metadata } from "next";
import Link from "next/link";
import { applications, profile } from "@/data/records";
import "./cv.css";

export const metadata: Metadata = {
  title: "Ibrahim Uthman — CV",
  description: "ServiceNow Developer. CSA and CAD certified.",
};

const contact = applications.find((a) => a.id === "contact")!;
const experience = applications.find((a) => a.id === "experience")!;
const certifications = applications.find((a) => a.id === "certifications")!;
const education = applications.find((a) => a.id === "education")!;
const projects = applications.find((a) => a.id === "projects")!;

export default function CV() {
  return (
    <main className="cv">
      <Link className="cvback" href="/">
        ← back to the site
      </Link>

      <header className="cvhead">
        <h1>{profile.name}</h1>
        <p className="cvrole">ServiceNow Developer · CSA, CAD</p>
        <p className="cvcontact">
          {contact.records
            .filter((r) => r.id !== "cv")
            .map((r) => r.fields.handle)
            .join("  ·  ")}
        </p>
      </header>

      <section>
        <h2>Experience</h2>
        {experience.records.map((r) => (
          <article className="cventry" key={r.id}>
            <div className="cvrow">
              <span className="cvtitle">{r.name}</span>
              <span className="cvmeta">{r.fields.period}</span>
            </div>
            <div className="cvrow cvsub">
              <span>{r.fields.company}</span>
              <span className="cvmeta">{r.fields.type}</span>
            </div>
            {(r.problem || r.built) && (
              <ul>
                {r.problem && <li>{r.problem}</li>}
                {r.built && <li>{r.built}</li>}
              </ul>
            )}
          </article>
        ))}
      </section>

      <section>
        <h2>Projects</h2>
        {projects.records.slice(0, 4).map((r) => (
          <article className="cventry" key={r.id}>
            <div className="cvrow">
              <span className="cvtitle">{r.name}</span>
              <span className="cvmeta">{r.fields.stack}</span>
            </div>
            {r.built && <ul><li>{r.built}</li></ul>}
          </article>
        ))}
      </section>

      <div className="cvcols">
        <section>
          <h2>Certifications</h2>
          {certifications.records.map((r) => (
            <div className="cvrow" key={r.id}>
              <span>{r.name}</span>
              <span className="cvmeta">{r.fields.year}</span>
            </div>
          ))}
        </section>

        <section>
          <h2>Education</h2>
          {education.records.map((r) => (
            <div key={r.id}>
              <div className="cvrow">
                <span className="cvtitle">{r.name}</span>
                <span className="cvmeta">{r.fields.period}</span>
              </div>
              <div className="cvrow cvsub">
                <span>{r.fields.institution}</span>
                <span className="cvmeta">{r.fields.result}</span>
              </div>
            </div>
          ))}
        </section>
      </div>

      <p className="cvprint">
        This page prints clean. Use your browser's print dialogue and save as PDF.
      </p>
    </main>
  );
}
