import React, { useMemo, useState } from "react";

const palette = {
  cream: "#F6F1E8",
  sand: "#E8DCC8",
  forest: "#2F5D50",
  forestDark: "#23473D",
  sage: "#DCE8E1",
  mint: "#EDF6F0",
  charcoal: "#1F2937",
  muted: "#6B7280",
  white: "#FFFFFF",
  danger: "#B45309",
  dangerBg: "#FEF3C7",
};

const users = {
  "psycholoog@forta.nl": { role: "zorgmedewerker", name: "Dr. Sophie van Dijk", route: "staff" },
  "beheer@forta.nl": { role: "beheerder", name: "Liam Mulder", route: "admin" },
  "klinisch@forta.nl": { role: "klinisch beheer", name: "Eva de Boer", route: "clinical" },
  "client@example.nl": { role: "client", name: "Amina Hassan", route: "client" },
  "meekijker@wijkteam.nl": { role: "meekijker", name: "Robin Meijer", route: "viewer" },
};

const prescriptions = [
  { id: "V-1042", client: "Amina Hassan", protocol: "Forta Intake", status: "Actief", risk: "Middel", updated: "Vandaag, 09:40" },
  { id: "V-1038", client: "Milan de Vries", protocol: "Verkennend Gesprek", status: "Afgerond", risk: "Laag", updated: "Gisteren" },
  { id: "V-1034", client: "Sara El Amrani", protocol: "Intake Herhaaltraject", status: "Wacht op consent", risk: "Hoog", updated: "2 dagen geleden" },
];

const surveys = [
  { id: "SV-201", name: "PHQ-9", status: "Actief", locale: "NL / EN", source: "PDF naar digitaal formulier" },
  { id: "SV-202", name: "GAD-7", status: "Draft", locale: "NL", source: "Handmatig opgebouwd" },
  { id: "SV-203", name: "SQ-48", status: "Deprecated", locale: "NL / EN", source: "Bestaand sjabloon" },
];

const roles = [
  { name: "Cliënt", rights: "Eigen gegevens, consent, voorschriften" },
  { name: "Zorgmedewerker", rights: "Cliënten, voorschriften, resultaten" },
  { name: "Klinisch beheer", rights: "Surveys, protocollen, risicoprofielen" },
  { name: "Beheerder", rights: "Rollen, logs, configuratie" },
];

function appStyles() {
  return `
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: ${palette.cream}; color: ${palette.charcoal}; }
    button, input, textarea { font: inherit; }
    .page { min-height: 100vh; background: linear-gradient(180deg, ${palette.cream} 0%, #fbf8f2 40%, ${palette.white} 100%); }
    .container { width: min(1200px, calc(100% - 32px)); margin: 0 auto; }
    .hero { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 24px; padding: 24px 0; }
    .card { background: ${palette.white}; border: 1px solid rgba(47,93,80,.10); border-radius: 28px; box-shadow: 0 16px 50px rgba(35,71,61,.08); }
    .card-soft { background: linear-gradient(180deg, ${palette.white} 0%, #fcf9f4 100%); }
    .heroPanel { padding: 40px; }
    .eyebrow { display: inline-block; background: ${palette.forest}; color: white; padding: 8px 14px; border-radius: 999px; font-size: 13px; font-weight: 700; letter-spacing: .02em; }
    .headline { margin: 18px 0 12px; font-size: 48px; line-height: 1.05; letter-spacing: -0.03em; }
    .subtle { color: ${palette.muted}; line-height: 1.6; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 28px; }
    .stat { padding: 18px; border-radius: 22px; background: ${palette.mint}; border: 1px solid rgba(47,93,80,.08); }
    .stat strong { display: block; font-size: 26px; margin-top: 6px; }
    .loginPanel { padding: 28px; }
    .input { width: 100%; border: 1px solid rgba(47,93,80,.16); background: ${palette.white}; border-radius: 16px; padding: 14px 16px; outline: none; }
    .input:focus { border-color: ${palette.forest}; box-shadow: 0 0 0 4px rgba(47,93,80,.10); }
    .button { border: 0; background: ${palette.forest}; color: white; padding: 13px 18px; border-radius: 16px; cursor: pointer; font-weight: 700; }
    .button:hover { background: ${palette.forestDark}; }
    .buttonSecondary { border: 1px solid rgba(47,93,80,.16); background: white; color: ${palette.forest}; }
    .buttonSecondary:hover { background: ${palette.mint}; }
    .demoList { display: grid; gap: 10px; margin-top: 14px; }
    .demoRow { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 14px 16px; border-radius: 18px; border: 1px solid rgba(47,93,80,.12); cursor: pointer; background: #fff; }
    .demoRow:hover { background: #faf8f3; }
    .pill { display: inline-flex; align-items: center; padding: 7px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; background: ${palette.sage}; color: ${palette.forest}; }
    .pillOutline { background: white; border: 1px solid rgba(47,93,80,.16); }
    .topbar { display: flex; justify-content: space-between; align-items: center; gap: 18px; padding: 18px 22px; margin: 18px 0 22px; }
    .shell { display: grid; grid-template-columns: 250px minmax(0, 1fr); gap: 22px; padding-bottom: 28px; }
    .sidebar { padding: 16px; }
    .navItem { width: 100%; text-align: left; border: 0; background: transparent; padding: 12px 14px; border-radius: 16px; cursor: pointer; color: ${palette.charcoal}; margin-bottom: 6px; font-weight: 600; }
    .navItem.active { background: ${palette.forest}; color: white; }
    .navItem:hover:not(.active) { background: ${palette.mint}; }
    .content { display: grid; gap: 22px; }
    .grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
    .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .grid2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 22px; }
    .panel { padding: 22px; }
    .sectionHeader { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; }
    .sectionHeader h2 { margin: 0; font-size: 24px; letter-spacing: -0.02em; }
    .sectionHeader p { margin: 4px 0 0; color: ${palette.muted}; }
    .list { display: grid; gap: 12px; }
    .listItem { border: 1px solid rgba(47,93,80,.10); border-radius: 22px; padding: 18px; background: #fff; }
    .listItem.selected { background: #fbfaf7; border-color: rgba(47,93,80,.28); box-shadow: inset 0 0 0 1px rgba(47,93,80,.05); }
    .row { display: flex; justify-content: space-between; gap: 12px; align-items: start; }
    .kicker { color: ${palette.muted}; font-size: 14px; }
    .alert { padding: 16px; border-radius: 18px; background: ${palette.dangerBg}; color: ${palette.danger}; border: 1px solid rgba(180,83,9,.15); }
    .metric { padding: 18px; border-radius: 22px; background: white; border: 1px solid rgba(47,93,80,.10); }
    .metric div:first-child { color: ${palette.muted}; font-size: 14px; }
    .metric strong { display: block; font-size: 30px; margin: 8px 0 6px; }
    .small { font-size: 13px; color: ${palette.muted}; }
    .progressWrap { width: 100%; height: 10px; background: ${palette.sand}; border-radius: 999px; overflow: hidden; margin-top: 12px; }
    .progressBar { height: 100%; background: ${palette.forest}; }
    .footerNote { font-size: 13px; color: ${palette.muted}; margin-top: 10px; }
    .tagRow { display: flex; flex-wrap: wrap; gap: 8px; }
    .textarea { width: 100%; min-height: 260px; border: 1px solid rgba(47,93,80,.14); border-radius: 18px; padding: 16px; background: #fbfaf7; }
    .table { width: 100%; border-collapse: collapse; overflow: hidden; border-radius: 18px; }
    .table th, .table td { text-align: left; padding: 12px 14px; border-bottom: 1px solid rgba(47,93,80,.08); }
    .table th { background: ${palette.mint}; color: ${palette.forest}; font-size: 13px; }
    .badgeWarn { background: ${palette.dangerBg}; color: ${palette.danger}; }
    @media (max-width: 980px) {
      .hero, .shell, .grid4, .grid3, .grid2, .stats { grid-template-columns: 1fr; }
      .headline { font-size: 36px; }
      .topbar, .row, .sectionHeader { flex-direction: column; align-items: stretch; }
    }
  `;
}

function Button({ children, secondary, onClick, style }) {
  return <button className={`button ${secondary ? "buttonSecondary" : ""}`} onClick={onClick} style={style}>{children}</button>;
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="sectionHeader">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("psycholoog@forta.nl");
  const [error, setError] = useState("");

  function handleLogin() {
    const user = users[email.trim().toLowerCase()];
    if (!user) {
      setError("Dit demo-account bestaat niet. Kies een account uit de lijst hieronder.");
      return;
    }
    setError("");
    onLogin({ email, ...user });
  }

  return (
    <div className="page">
      <style>{appStyles()}</style>
      <div className="container hero">
        <div className="card card-soft heroPanel">
          <span className="eyebrow">Forta Kompas prototype</span>
          <h1 className="headline">Een warme, rustige digitale intake-ervaring voor cliënten en medewerkers.</h1>
          <p className="subtle">
            Deze stijl is geïnspireerd op de rustige, zorggerichte uitstraling van de Forta Volwassenen website: veel witruimte, zachte aardetinten, specialistische zorgprogramma's en een duidelijke nadruk op cliënteninformatie en online behandeling.
          </p>
          <div className="stats">
            <div className="stat"><span className="small">Doel</span><strong>Demo-ready</strong><span className="small">Geschikt voor stakeholdergesprekken</span></div>
            <div className="stat"><span className="small">Gebruikers</span><strong>5 rollen</strong><span className="small">Cliënt, zorg, meekijker, klinisch, beheer</span></div>
            <div className="stat"><span className="small">Ervaring</span><strong>Rustig & helder</strong><span className="small">Passend bij digitale zorg</span></div>
          </div>
        </div>

        <div className="card loginPanel">
          <SectionHeader title="Inloggen" subtitle="Kies een demo-account om de juiste flow te openen." />
          <div style={{ display: "grid", gap: 12 }}>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="naam@organisatie.nl" />
            <Button onClick={handleLogin}>Verder</Button>
            {error ? <div className="alert">{error}</div> : null}
          </div>

          <div style={{ marginTop: 22 }}>
            <div className="small" style={{ marginBottom: 10 }}>Demo-accounts</div>
            <div className="demoList">
              {Object.entries(users).map(([mail, user]) => (
                <div className="demoRow" key={mail} onClick={() => setEmail(mail)}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{user.name}</div>
                    <div className="small">{mail}</div>
                  </div>
                  <span className="pill">{user.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopBar({ user, onLogout }) {
  return (
    <div className="card topbar">
      <div>
        <div className="small">Forta Kompas</div>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em" }}>Digitale zorgomgeving</div>
      </div>
      <div className="row" style={{ alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 700 }}>{user.name}</div>
          <div className="small">{user.email} · {user.role}</div>
        </div>
        <Button secondary onClick={onLogout}>Uitloggen</Button>
      </div>
    </div>
  );
}

function MetricGrid({ items }) {
  return <div className="grid4">{items.map((item) => <div key={item.label} className="metric"><div>{item.label}</div><strong>{item.value}</strong><div className="small">{item.hint}</div></div>)}</div>;
}

function StaffDashboard() {
  const [selected, setSelected] = useState(prescriptions[0]);
  return (
    <div className="content">
      <MetricGrid items={[
        { label: "Open voorschriften", value: "14", hint: "3 met prioriteit vandaag" },
        { label: "Wacht op consent", value: "2", hint: "Cliënt moet bevestigen" },
        { label: "Nieuwe risico-signalen", value: "1", hint: "Sinds 08:52" },
        { label: "Afgerond vandaag", value: "5", hint: "Inclusief AI-samenvattingen" },
      ]} />
      <div className="grid2">
        <div className="card panel">
          <SectionHeader title="Werkvoorraad" subtitle="Voorschriften en intakeflows" action={<Button>Nieuw voorschrift</Button>} />
          <div className="list">
            {prescriptions.map((item) => (
              <div key={item.id} className={`listItem ${selected.id === item.id ? "selected" : ""}`} onClick={() => setSelected(item)} style={{ cursor: "pointer" }}>
                <div className="row">
                  <div>
                    <div style={{ fontWeight: 700 }}>{item.client}</div>
                    <div className="kicker">{item.protocol} · {item.id}</div>
                  </div>
                  <div className="tagRow">
                    <span className="pill pillOutline">{item.status}</span>
                    <span className="pill pillOutline">Risico {item.risk}</span>
                  </div>
                </div>
                <div className="footerNote">Laatst bijgewerkt: {item.updated}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card panel">
          <SectionHeader title="Voorschrift detail" subtitle="Geselecteerde cliëntflow" />
          <div className="listItem selected">
            <div style={{ fontSize: 22, fontWeight: 800 }}>{selected.client}</div>
            <div className="kicker">{selected.protocol} · {selected.id}</div>
          </div>
          <div className="grid2" style={{ marginTop: 14, gap: 14 }}>
            <div className="listItem">
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Volgende stappen</div>
              <div className="small">PHQ-9 afronden</div>
              <div className="small">AI intakegesprek valideren</div>
              <div className="small">Resultaat terugkoppelen</div>
            </div>
            <div className="listItem">
              <div style={{ fontWeight: 700, marginBottom: 8 }}>AI-output</div>
              <div className="small">Samenvatting klaar</div>
              <div className="small">Leesniveau cliënt: B1</div>
              <div className="small">Geen blokkades gevonden</div>
            </div>
          </div>
          <div className="alert" style={{ marginTop: 14 }}>AI-output is ondersteunend. De behandelaar blijft verantwoordelijk voor interpretatie en opvolging.</div>
          <div className="tagRow" style={{ marginTop: 14 }}>
            <Button>Resultaten bekijken</Button>
            <Button secondary>Cliënt herinneren</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientPortal() {
  return (
    <div className="content">
      <MetricGrid items={[
        { label: "Open acties", value: "2", hint: "1 vragenlijst, 1 gesprek" },
        { label: "Mijn behandeling", value: "Actief", hint: "Digitale poli" },
        { label: "Leesniveau", value: "B1", hint: "Aangepaste uitleg" },
        { label: "Herinneringen", value: "Aan", hint: "Per e-mail" },
      ]} />
      <div className="grid2">
        <div className="card panel">
          <SectionHeader title="Mijn voorschriften" subtitle="Overzicht van open en afgeronde onderdelen" />
          {prescriptions.slice(0, 2).map((item, index) => (
            <div className="listItem" key={item.id} style={{ marginBottom: 12 }}>
              <div className="row">
                <div>
                  <div style={{ fontWeight: 700 }}>{item.protocol}</div>
                  <div className="kicker">{item.client}</div>
                </div>
                <span className="pill">{item.status}</span>
              </div>
              <div className="progressWrap"><div className="progressBar" style={{ width: index === 0 ? "58%" : "100%" }} /></div>
              <div className="tagRow" style={{ marginTop: 12 }}>
                <Button>Openen</Button>
                <Button secondary>Meer info</Button>
              </div>
            </div>
          ))}
        </div>
        <div className="card panel">
          <SectionHeader title="Mijn profiel & consent" subtitle="Helder, rustig en cliëntvriendelijk" />
          <div className="list" style={{ gap: 14 }}>
            <div>
              <div className="small" style={{ marginBottom: 6 }}>Voornaam</div>
              <input className="input" defaultValue="Amina" />
            </div>
            <div>
              <div className="small" style={{ marginBottom: 6 }}>Mobiel nummer</div>
              <input className="input" defaultValue="06 12345678" />
            </div>
            <div className="listItem selected">
              <div style={{ fontWeight: 700 }}>Consent voor verwerking</div>
              <div className="small" style={{ marginTop: 6 }}>Bij intrekken worden open voorschriften niet verder verwerkt.</div>
            </div>
            <Button>Wijzigingen opslaan</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClinicalWorkspace() {
  return (
    <div className="content">
      <MetricGrid items={[
        { label: "Actieve surveys", value: "12", hint: "3 in review" },
        { label: "Protocollen", value: "8", hint: "2 concepten" },
        { label: "Risicoprofielen", value: "5", hint: "1 update nodig" },
        { label: "Nieuwe versies", value: "3", hint: "Sinds deze week" },
      ]} />
      <div className="grid2">
        <div className="card panel">
          <SectionHeader title="Survey builder" subtitle="Van bronmateriaal naar digitaal formulier" action={<Button>Nieuwe survey</Button>} />
          <div className="grid3">
            <div className="stat"><span className="small">Stap 1</span><strong style={{ fontSize: 20 }}>Upload</strong><span className="small">PDF of bestaand document</span></div>
            <div className="stat"><span className="small">Stap 2</span><strong style={{ fontSize: 20 }}>Concept</strong><span className="small">AI zet om naar structuur</span></div>
            <div className="stat"><span className="small">Stap 3</span><strong style={{ fontSize: 20 }}>Review</strong><span className="small">Beheerder verfijnt output</span></div>
          </div>
          <div className="listItem" style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 700 }}>Upload intakeformulier.pdf</div>
            <div className="small" style={{ marginTop: 6 }}>Dit prototype laat zien hoe bronmateriaal doorloopt naar een digitale vragenlijst.</div>
          </div>
        </div>
        <div className="card panel">
          <SectionHeader title="Survey concept" subtitle="Voorbeeld van gegenereerde inhoud" />
          <textarea className="textarea" defaultValue={`{
  "title": "PHQ-9",
  "locale": ["nl", "en"],
  "questions": [{
    "id": "somber",
    "type": "scale",
    "label": "Ik voelde me somber"
  }],
  "score": "calculated value"
}`} />
        </div>
      </div>
      <div className="card panel">
        <SectionHeader title="Survey overzicht" subtitle="Status, taal en bron per survey" />
        <div className="grid3">
          {surveys.map((survey) => (
            <div className="listItem" key={survey.id}>
              <div className="row">
                <div>
                  <div style={{ fontWeight: 700 }}>{survey.name}</div>
                  <div className="kicker">{survey.id}</div>
                </div>
                <span className="pill">{survey.status}</span>
              </div>
              <div className="footerNote">Taal: {survey.locale}</div>
              <div className="footerNote">Bron: {survey.source}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminWorkspace() {
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const all = [
      ["09:41", "Dr. Sophie van Dijk", "READ", "Voorschrift V-1042"],
      ["09:36", "Amina Hassan", "UPDATE", "Consent"],
      ["09:12", "Eva de Boer", "CREATE", "Survey SV-202"],
      ["08:52", "Systeem", "ALERT", "RisicoVlag RF-77"],
    ];
    return all.filter((row) => row.join(" ").toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  return (
    <div className="content">
      <MetricGrid items={[
        { label: "Rollen", value: "8", hint: "Met datarechten en functierechten" },
        { label: "Configuraties", value: "22", hint: "Herinneringen en bewaartermijnen" },
        { label: "Audit entries", value: "12.4k", hint: "READ-acties gehasht" },
        { label: "Passieve users", value: "3", hint: "Geen login toegestaan" },
      ]} />
      <div className="grid2">
        <div className="card panel">
          <SectionHeader title="Rollen & rechten" subtitle="Wie mag wat zien en beheren" />
          <div className="list">
            {roles.map((role) => (
              <div className="listItem" key={role.name}>
                <div style={{ fontWeight: 700 }}>{role.name}</div>
                <div className="footerNote">{role.rights}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card panel">
          <SectionHeader title="Systeeminstellingen" subtitle="Calm, clear and admin-friendly" />
          <div className="list">
            <div className="listItem"><div style={{ fontWeight: 700 }}>Sessie timeout</div><div className="footerNote">Automatisch na 15 minuten inactiviteit</div></div>
            <div className="listItem"><div style={{ fontWeight: 700 }}>Bewaartermijn</div><div className="footerNote">180 dagen na afronding</div></div>
            <div className="listItem"><div style={{ fontWeight: 700 }}>Labels</div><div className="tagRow" style={{ marginTop: 10 }}><span className="pill pillOutline">Jeugd</span><span className="pill pillOutline">Trauma</span><span className="pill pillOutline">GGZ</span></div></div>
          </div>
        </div>
      </div>
      <div className="card panel">
        <SectionHeader title="Auditlog" subtitle="Zoekbaar overzicht van acties" action={<input className="input" style={{ width: 260 }} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Zoek actor of entiteit" />} />
        <table className="table">
          <thead><tr><th>Tijd</th><th>Actor</th><th>Actie</th><th>Entiteit</th></tr></thead>
          <tbody>
            {rows.map((row, i) => <tr key={i}><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ViewerPortal() {
  return (
    <div className="content">
      <MetricGrid items={[
        { label: "Toegewezen cliënten", value: "4", hint: "Alleen meekijker-toegang" },
        { label: "Nieuwe resultaten", value: "1", hint: "Sinds gisteren" },
        { label: "2FA", value: "Actief", hint: "Authenticator of sms" },
        { label: "Open meldingen", value: "2", hint: "Nog te bekijken" },
      ]} />
      <div className="card panel">
        <SectionHeader title="Meekijkerportaal" subtitle="Alleen relevante voorschriften en resultaten" />
        <div className="grid3">
          {prescriptions.map((item) => (
            <div className="listItem" key={item.id}>
              <div style={{ fontWeight: 700 }}>{item.client}</div>
              <div className="kicker">{item.protocol}</div>
              <div className="tagRow" style={{ marginTop: 10 }}>
                <span className="pill">{item.status}</span>
                <span className={`pill ${item.risk === "Hoog" ? "badgeWarn" : "pillOutline"}`}>Risico {item.risk}</span>
              </div>
              <div style={{ marginTop: 12 }}><Button>Resultaten bekijken</Button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppShell({ user, onLogout }) {
  const initial = user.route;
  const [section, setSection] = useState(initial);
  const items = [
    ...(user.route === "staff" ? [{ key: "staff", label: "Werkvoorraad" }] : []),
    ...(user.route === "client" ? [{ key: "client", label: "Mijn portaal" }] : []),
    ...(user.route === "clinical" ? [{ key: "clinical", label: "Klinisch beheer" }] : []),
    ...(user.route === "admin" ? [{ key: "admin", label: "Administratie" }] : []),
    ...(user.route === "viewer" ? [{ key: "viewer", label: "Meekijker" }] : []),
  ];

  let content = null;
  if (section === "staff") content = <StaffDashboard />;
  if (section === "client") content = <ClientPortal />;
  if (section === "clinical") content = <ClinicalWorkspace />;
  if (section === "admin") content = <AdminWorkspace />;
  if (section === "viewer") content = <ViewerPortal />;

  return (
    <div className="page">
      <style>{appStyles()}</style>
      <div className="container">
        <TopBar user={user} onLogout={onLogout} />
        <div className="shell">
          <div className="card sidebar">
            {items.map((item) => (
              <button key={item.key} className={`navItem ${section === item.key ? "active" : ""}`} onClick={() => setSection(item.key)}>
                {item.label}
              </button>
            ))}
          </div>
          <div>{content}</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  return user ? <AppShell user={user} onLogout={() => setUser(null)} /> : <Login onLogin={setUser} />;
}
