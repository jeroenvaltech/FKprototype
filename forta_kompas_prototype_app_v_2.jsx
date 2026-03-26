import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Bot,
  CheckCircle2,
  ClipboardList,
  FileCog,
  FileText,
  HeartPulse,
  Home,
  LayoutGrid,
  ListChecks,
  Lock,
  Moon,
  Search,
  Settings,
  Shield,
  Sun,
  User,
  Users,
  Wand2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

const users = {
  "psycholoog@forta.nl": { role: "zorgmedewerker", name: "Dr. Sophie van Dijk", org: "Forta", route: "staff" },
  "beheer@forta.nl": { role: "beheerder", name: "Liam Mulder", org: "Forta", route: "admin" },
  "klinisch@forta.nl": { role: "klinisch", name: "Eva de Boer", org: "Forta", route: "clinical" },
  "meekijker@wijkteam.nl": { role: "meekijker", name: "Robin Meijer", org: "Wijkteam Utrecht", route: "viewer" },
  "client@example.nl": { role: "client", name: "Amina Hassan", org: "Client", route: "client" },
  "passief@forta.nl": { role: "passief", name: "Passieve gebruiker", org: "Forta", route: "blocked" },
};

const prescriptions = [
  { id: "V-1042", client: "Amina Hassan", protocol: "Forta Intake", items: ["PHQ-9", "AI Intakegesprek"], status: "Actief", consent: true, risk: "Middel", updated: "Vandaag, 09:40" },
  { id: "V-1038", client: "Milan de Vries", protocol: "Verkennend Gesprek", items: ["PraatPlaat", "GAD-7"], status: "Afgerond", consent: true, risk: "Laag", updated: "Gisteren" },
  { id: "V-1034", client: "Sara El Amrani", protocol: "Intake Herhaaltraject", items: ["SQ-48", "AI Samenvatting"], status: "Wacht op consent", consent: false, risk: "Hoog", updated: "2 dagen geleden" },
];

const surveys = [
  { id: "SV-201", name: "PHQ-9", locales: ["NL", "EN"], status: "Actief", scoring: "UI + calculated values", source: "PDF naar SurveyJS" },
  { id: "SV-202", name: "GAD-7", locales: ["NL"], status: "Draft", scoring: "UI-configuratie", source: "Handmatig opgebouwd" },
  { id: "SV-203", name: "SQ-48", locales: ["NL", "EN"], status: "Deprecated", scoring: "Custom JavaScript", source: "PDF naar SurveyJS" },
];

const protocols = [
  { name: "Verkennend Gesprek", version: "v3", status: "Actief", items: 2 },
  { name: "Forta Intake", version: "v5", status: "Actief", items: 4 },
  { name: "Intake Herhaaltraject", version: "v2", status: "Draft", items: 3 },
];

const riskProfiles = [
  { title: "Suïciderisico", status: "Actief", version: "v4", alert: "Direct" },
  { title: "Huiselijk geweld", status: "Actief", version: "v2", alert: "Binnen 1 uur" },
  { title: "Middelenmisbruik", status: "Deprecated", version: "v1", alert: "Dagelijks overzicht" },
];

const roles = [
  { name: "Cliënt", members: 84, rights: "Eigen gegevens, consent, voorschriften" },
  { name: "Zorgmedewerker Forta", members: 27, rights: "Cliënten, voorschriften, resultaten" },
  { name: "Klinisch beheerder", members: 4, rights: "Surveys, protocollen, risicoprofielen" },
  { name: "Functioneel/Technisch beheerder", members: 3, rights: "Rollen, logs, configuratie" },
];

const auditRows = [
  { time: "09:41", actor: "Dr. Sophie van Dijk", action: "READ", entity: "Voorschrift V-1042", trace: "Grouped hash" },
  { time: "09:36", actor: "Amina Hassan", action: "UPDATE", entity: "Consent", trace: "CONS-33" },
  { time: "09:12", actor: "Eva de Boer", action: "CREATE", entity: "Survey SV-202", trace: "FORM-98" },
  { time: "08:52", actor: "Systeem", action: "ALERT", entity: "RisicoVlag RF-77", trace: "RISK-77" },
];

const surveyJson = `{
  "title": { "nl": "PHQ-9", "en": "PHQ-9" },
  "pages": [{
    "elements": [{
      "type": "radiogroup",
      "name": "somber",
      "title": { "nl": "Ik voelde me somber", "en": "I felt down" },
      "choices": [0, 1, 2, 3]
    }]
  }],
  "calculatedValues": [{
    "name": "score_totaal",
    "expression": "{somber}",
    "includeIntoResult": true
  }]
}`;

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function SectionTitle({ icon: Icon, title, subtitle, right }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-slate-900 p-2 text-white dark:bg-white dark:text-slate-900">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
      {right}
    </div>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <Card className="rounded-3xl border-0 shadow-sm">
      <CardContent className="p-5">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      </CardContent>
    </Card>
  );
}

function Sidebar({ items, current, onChange }) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          className={cx(
            "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm transition",
            current === item.key ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function LoginScreen({ onLogin, theme, setTheme, fontSize, setFontSize, language, setLanguage }) {
  const [email, setEmail] = useState("psycholoog@forta.nl");
  const [error, setError] = useState("");

  function handleContinue() {
    const value = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setError("Ongeldig e-mailadres formaat.");
      return;
    }
    const record = users[value];
    if (!record) {
      setError("Deze gebruiker is niet bekend in Forta Kompas.");
      return;
    }
    if (record.role === "passief") {
      setError("Gebruiker niet langer geautoriseerd om in te loggen.");
      return;
    }
    setError("");
    onLogin({ email: value, ...record });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-white">
      <div className="mx-auto grid min-h-[92vh] max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col justify-between rounded-[2rem] border border-slate-200/70 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <div>
            <Badge className="rounded-full bg-slate-900 px-3 py-1 text-white dark:bg-white dark:text-slate-900">Forta Kompas prototype</Badge>
            <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">Klikbaar prototype voor intake, vragenlijsten, consent en beheer.</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-300">Deze demo simuleert rolgestuurde login, cliënt- en medewerkerflows, SurveyJS-beheer, protocollen, risicoprofielen, auditlogs en toegankelijke instellingen.</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <StatCard label="Rollen" value="5" hint="Cliënt, zorg, meekijker, klinisch, beheer" />
            <StatCard label="Belangrijkste flow" value="Login → voorschrift → resultaat" hint="Met role-based routing" />
            <StatCard label="Prototype-doel" value="Demo-ready" hint="Mock data, geen backend nodig" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Card className="border-0 shadow-none">
            <CardHeader className="px-0">
              <CardTitle>Inloggen</CardTitle>
              <CardDescription>Voer een e-mailadres in. De prototype-route wordt bepaald op basis van het bekende type gebruiker.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 px-0">
              <div className="space-y-2">
                <label className="text-sm font-medium">E-mailadres</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="naam@organisatie.nl" className="h-12 rounded-2xl" />
              </div>
              {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</div> : null}
              <Button onClick={handleContinue} className="h-12 w-full rounded-2xl">Verder</Button>

              <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Toegankelijkheidsinstellingen</p>
                  <Button variant="outline" size="icon" className="rounded-2xl" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-slate-500">Tekstgrootte</label>
                    <div className="mt-2 flex gap-2">
                      {["compact", "normaal", "groot"].map((s) => <Button key={s} variant={fontSize === s ? "default" : "outline"} className="rounded-2xl" onClick={() => setFontSize(s)}>{s}</Button>)}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Taal</label>
                    <div className="mt-2 flex gap-2">
                      {["NL", "EN"].map((lang) => <Button key={lang} variant={language === lang ? "default" : "outline"} className="rounded-2xl" onClick={() => setLanguage(lang)}>{lang}</Button>)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium">Demo-accounts</p>
                <div className="grid gap-2">
                  {Object.entries(users).filter(([, value]) => value.role !== "passief").map(([mail, info]) => (
                    <button key={mail} onClick={() => setEmail(mail)} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                      <div>
                        <p className="text-sm font-medium">{info.name}</p>
                        <p className="text-xs text-slate-500">{mail}</p>
                      </div>
                      <Badge variant="secondary" className="rounded-full">{info.role}</Badge>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function TopBar({ user, onLogout, title, subtitle }) {
  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm text-slate-500">{subtitle}</p>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-slate-100 px-4 py-2 dark:bg-slate-800">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
        <Button variant="outline" className="rounded-2xl" onClick={onLogout}><ArrowLeft className="mr-2 h-4 w-4" />Uitloggen</Button>
      </div>
    </div>
  );
}

function StaffDashboard() {
  const [selected, setSelected] = useState(prescriptions[0]);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Open voorschriften" value="14" hint="3 met prioriteit vandaag" />
        <StatCard label="Wacht op consent" value="2" hint="Cliënt moet bevestigen" />
        <StatCard label="Risico-signalen" value="1" hint="Nieuwe melding sinds 08:52" />
        <StatCard label="Afgerond vandaag" value="5" hint="Inclusief AI samenvattingen" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[2rem] border-0 shadow-sm">
          <CardHeader><SectionTitle icon={ClipboardList} title="Voorschriften" subtitle="Nieuwste bovenaan, met consent en risicostatus." right={<Button className="rounded-2xl">Nieuw voorschrift</Button>} /></CardHeader>
          <CardContent className="space-y-3">
            {prescriptions.map((item) => (
              <button key={item.id} onClick={() => setSelected(item)} className={cx("w-full rounded-3xl border p-4 text-left transition", selected.id === item.id ? "border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-800" : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800")}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2"><p className="font-medium">{item.client}</p><Badge variant="secondary" className="rounded-full">{item.id}</Badge></div>
                    <p className="text-sm text-slate-500">{item.protocol} · {item.items.join(" · ")}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="rounded-full" variant={item.consent ? "secondary" : "destructive"}>{item.consent ? "Consent actief" : "Geen consent"}</Badge>
                    <Badge className="rounded-full" variant="outline">Risico {item.risk}</Badge>
                    <Badge className="rounded-full" variant="outline">{item.status}</Badge>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-0 shadow-sm">
          <CardHeader><SectionTitle icon={FileText} title="Voorschrift detail" subtitle="Samenvatting van de gekozen cliëntflow." /></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800/60"><p className="text-lg font-semibold">{selected.client}</p><p className="text-sm text-slate-500">{selected.id} · {selected.protocol}</p></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border p-4"><p className="text-sm text-slate-500">Onderdelen</p><ul className="mt-2 space-y-2 text-sm">{selected.items.map((x) => <li key={x} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{x}</li>)}</ul></div>
              <div className="rounded-3xl border p-4"><p className="text-sm text-slate-500">AI-output</p><p className="mt-2 text-sm">Samenvatting klaar, risico-analyse beoordeeld, cliëntreactie beschikbaar op taalniveau B1.</p></div>
            </div>
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">AI-samenvattingen zijn indicatief. Een behandelaar blijft verantwoordelijk voor interpretatie en vervolgacties.</div>
            <div className="flex flex-wrap gap-3"><Button className="rounded-2xl">Resultaten bekijken</Button><Button variant="outline" className="rounded-2xl">Cliënt herinneren</Button><Button variant="outline" className="rounded-2xl">Voorschrift afronden</Button></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ClientPortal() {
  const [consent, setConsent] = useState(true);
  const [notifications, setNotifications] = useState({ reminders: true, results: true });
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Open acties" value="2" hint="1 vragenformulier, 1 interview" />
        <StatCard label="Consent" value={consent ? "Actief" : "Ingetrokken"} hint="Beïnvloedt open voorschriften" />
        <StatCard label="Taalniveau" value="B1" hint="AI-resultaten aangepast leesniveau" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-[2rem] border-0 shadow-sm">
          <CardHeader><SectionTitle icon={Home} title="Mijn voorschriften" subtitle="Overzicht van open en afgeronde trajecten." /></CardHeader>
          <CardContent className="space-y-3">
            {prescriptions.slice(0, 2).map((item) => (
              <div key={item.id} className="rounded-3xl border p-4">
                <div className="flex items-center justify-between gap-2"><div><p className="font-medium">{item.protocol}</p><p className="text-sm text-slate-500">{item.items.join(" · ")}</p></div><Badge className="rounded-full">{item.status}</Badge></div>
                <Progress value={item.status === "Afgerond" ? 100 : 55} className="mt-4" />
                <div className="mt-4 flex gap-2"><Button className="rounded-2xl">Openen</Button><Button variant="outline" className="rounded-2xl">Meer info</Button></div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-0 shadow-sm">
          <CardHeader><SectionTitle icon={User} title="Mijn profiel & consent" subtitle="Wijzig gegevens, contactvoorkeuren en toestemming." /></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2"><div><label className="text-sm font-medium">Voornaam</label><Input defaultValue="Amina" className="mt-2 h-11 rounded-2xl" /></div><div><label className="text-sm font-medium">Mobiel nummer</label><Input defaultValue="06 12345678" className="mt-2 h-11 rounded-2xl" /></div></div>
            <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800/60"><div className="flex items-center justify-between"><div><p className="font-medium">Consent voor verwerking</p><p className="text-sm text-slate-500">Bij intrekken worden open voorschriften afgewezen.</p></div><Switch checked={consent} onCheckedChange={setConsent} /></div></div>
            <div className="space-y-3 rounded-3xl border p-4">
              <div className="flex items-center justify-between"><span className="text-sm">Herinneringen per e-mail</span><Switch checked={notifications.reminders} onCheckedChange={(v) => setNotifications((s) => ({ ...s, reminders: v }))} /></div>
              <div className="flex items-center justify-between"><span className="text-sm">Melding bij nieuwe resultaten</span><Switch checked={notifications.results} onCheckedChange={(v) => setNotifications((s) => ({ ...s, results: v }))} /></div>
            </div>
            <Button className="rounded-2xl">Wijzigingen opslaan</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ViewerPortal() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Toegewezen cliënten" value="4" hint="Alleen meekijker-toegang" />
        <StatCard label="Nieuwe resultaten" value="1" hint="Sinds gisteren" />
        <StatCard label="2FA status" value="Actief" hint="Via sms of authenticator" />
      </div>
      <Card className="rounded-[2rem] border-0 shadow-sm">
        <CardHeader><SectionTitle icon={Users} title="Meekijkerportaal" subtitle="Alleen voorschriften waarop deze externe medewerker is opgenomen." /></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {prescriptions.map((item) => (
            <div key={item.id} className="rounded-3xl border p-4"><p className="font-medium">{item.client}</p><p className="text-sm text-slate-500">{item.protocol}</p><div className="mt-4 flex gap-2"><Badge className="rounded-full">{item.status}</Badge><Badge variant="outline" className="rounded-full">Risico {item.risk}</Badge></div><Button className="mt-4 rounded-2xl">Resultaten bekijken</Button></div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ClinicalWorkspace() {
  const [tab, setTab] = useState("surveys");
  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-6">
      <TabsList className="grid h-auto grid-cols-3 rounded-3xl bg-white p-1 shadow-sm dark:bg-slate-900"><TabsTrigger value="surveys" className="rounded-2xl">Surveys</TabsTrigger><TabsTrigger value="protocols" className="rounded-2xl">Protocollen</TabsTrigger><TabsTrigger value="risks" className="rounded-2xl">Risicoprofielen</TabsTrigger></TabsList>
      <TabsContent value="surveys" className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card className="rounded-[2rem] border-0 shadow-sm">
            <CardHeader><SectionTitle icon={Wand2} title="Survey builder" subtitle="Van PDF naar concept SurveyJS JSON, daarna handmatige verfijning." right={<Button className="rounded-2xl">Nieuwe survey</Button>} /></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border p-4"><p className="text-sm text-slate-500">Stap 1</p><p className="mt-1 font-medium">Upload PDF</p></div>
                <div className="rounded-3xl border p-4"><p className="text-sm text-slate-500">Stap 2</p><p className="mt-1 font-medium">AI maakt concept</p></div>
                <div className="rounded-3xl border p-4"><p className="text-sm text-slate-500">Stap 3</p><p className="mt-1 font-medium">Beheerder verfijnt JSON</p></div>
              </div>
              <div className="rounded-3xl border border-dashed p-5"><p className="font-medium">Upload intakeformulier.pdf</p><p className="mt-1 text-sm text-slate-500">Sleep een PDF hierheen om extractie te simuleren.</p><Button variant="outline" className="mt-4 rounded-2xl">Bestand kiezen</Button></div>
              <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800/60"><p className="text-sm font-medium">Scoring-aanpak</p><div className="mt-3 flex flex-wrap gap-2"><Badge className="rounded-full">Thema's</Badge><Badge className="rounded-full">Reverse items</Badge><Badge className="rounded-full">Cutoffs</Badge><Badge className="rounded-full">Calculated values</Badge><Badge className="rounded-full">Custom JS</Badge></div></div>
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] border-0 shadow-sm">
            <CardHeader><SectionTitle icon={FileCog} title="SurveyJS concept" subtitle="Voorbeeld van gegenereerde JSON met meertaligheid en scoring." /></CardHeader>
            <CardContent><Textarea className="min-h-[380px] rounded-3xl font-mono text-xs" defaultValue={surveyJson} /><div className="mt-4 flex gap-2"><Button className="rounded-2xl">Opslaan als draft</Button><Button variant="outline" className="rounded-2xl">Preview</Button></div></CardContent>
          </Card>
        </div>
        <Card className="rounded-[2rem] border-0 shadow-sm">
          <CardHeader><SectionTitle icon={LayoutGrid} title="Survey overzicht" subtitle="Status, talen en type scoring per survey." /></CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            {surveys.map((survey) => <div key={survey.id} className="rounded-3xl border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{survey.name}</p><p className="text-sm text-slate-500">{survey.id}</p></div><Badge className="rounded-full">{survey.status}</Badge></div><p className="mt-4 text-sm text-slate-500">Bron: {survey.source}</p><p className="mt-1 text-sm text-slate-500">Scoring: {survey.scoring}</p><div className="mt-3 flex gap-2">{survey.locales.map((locale) => <Badge key={locale} variant="outline" className="rounded-full">{locale}</Badge>)}</div></div>)}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="protocols" className="space-y-6">
        <Card className="rounded-[2rem] border-0 shadow-sm"><CardHeader><SectionTitle icon={ListChecks} title="Protocolbeheer" subtitle="Versiebeheer voor combinaties van open vragenlijsten en formulieren." right={<Button className="rounded-2xl">Nieuw protocol</Button>} /></CardHeader><CardContent className="grid gap-4 lg:grid-cols-3">{protocols.map((protocol) => <div key={protocol.name} className="rounded-3xl border p-4"><div className="flex items-center justify-between gap-2"><p className="font-medium">{protocol.name}</p><Badge className="rounded-full">{protocol.status}</Badge></div><p className="mt-2 text-sm text-slate-500">Versie {protocol.version}</p><p className="text-sm text-slate-500">{protocol.items} onderdelen</p><div className="mt-4 flex gap-2"><Button variant="outline" className="rounded-2xl">Openen</Button><Button variant="outline" className="rounded-2xl">Kopieer versie</Button></div></div>)}</CardContent></Card>
      </TabsContent>
      <TabsContent value="risks" className="space-y-6">
        <Card className="rounded-[2rem] border-0 shadow-sm"><CardHeader><SectionTitle icon={HeartPulse} title="Risicoprofielen" subtitle="Specificeer risico's, prompts en meldingsgedrag." right={<Button className="rounded-2xl">Nieuw profiel</Button>} /></CardHeader><CardContent className="grid gap-4 lg:grid-cols-3">{riskProfiles.map((profile) => <div key={profile.title} className="rounded-3xl border p-4"><div className="flex items-center justify-between gap-2"><p className="font-medium">{profile.title}</p><Badge className="rounded-full">{profile.status}</Badge></div><p className="mt-2 text-sm text-slate-500">Versie {profile.version}</p><p className="text-sm text-slate-500">Alert: {profile.alert}</p><div className="mt-4 flex gap-2"><Button variant="outline" className="rounded-2xl">Bekijken</Button><Button variant="outline" className="rounded-2xl">Nieuwe versie</Button></div></div>)}</CardContent></Card>
      </TabsContent>
    </Tabs>
  );
}

function AdminWorkspace() {
  const [query, setQuery] = useState("");
  const filteredRows = useMemo(() => auditRows.filter((row) => `${row.actor} ${row.action} ${row.entity}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4"><StatCard label="Rollen" value="8" hint="Met datarechten en functierechten" /><StatCard label="Actieve labels" value="14" hint="3 passief" /><StatCard label="Configuraties" value="22" hint="Bewaartermijnen, reminders, sessies" /><StatCard label="Audit entries" value="12.4k" hint="READ-acties gehasht" /></div>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-[2rem] border-0 shadow-sm"><CardHeader><SectionTitle icon={Shield} title="Rollen & rechten" subtitle="DataRechten + FunctieRechten per rol." /></CardHeader><CardContent className="space-y-3">{roles.map((role) => <div key={role.name} className="rounded-3xl border p-4"><div className="flex items-center justify-between gap-2"><div><p className="font-medium">{role.name}</p><p className="text-sm text-slate-500">{role.rights}</p></div><Badge className="rounded-full">{role.members} gebruikers</Badge></div></div>)}<div className="flex gap-2 pt-2"><Button className="rounded-2xl">Nieuwe rol</Button><Button variant="outline" className="rounded-2xl">Datarechten beheren</Button></div></CardContent></Card>
        <Card className="rounded-[2rem] border-0 shadow-sm"><CardHeader><SectionTitle icon={Settings} title="Configuratie & labels" subtitle="Onderhoud parameters, labels en templates." /></CardHeader><CardContent className="space-y-4"><div className="rounded-3xl border p-4"><p className="font-medium">Sessie timeout</p><p className="text-sm text-slate-500">Automatisch beëindigen na 15 minuten inactiviteit.</p></div><div className="rounded-3xl border p-4"><p className="font-medium">Bewaartermijn afgerond voorschrift</p><p className="text-sm text-slate-500">180 dagen na VerwijderDT.</p></div><div className="rounded-3xl border p-4"><p className="font-medium">Forta labels</p><div className="mt-2 flex flex-wrap gap-2">{["Jeugd", "GGZ", "Trauma", "Intake", "Passief"].map((label) => <Badge key={label} variant="outline" className="rounded-full">{label}</Badge>)}</div></div></CardContent></Card>
      </div>
      <Card className="rounded-[2rem] border-0 shadow-sm"><CardHeader><SectionTitle icon={Search} title="Auditlog" subtitle="Filterbaar overzicht met links naar gerelateerde records." right={<div className="w-full max-w-xs"><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Zoek actor, actie, entiteit" className="rounded-2xl" /></div>} /></CardHeader><CardContent><div className="overflow-hidden rounded-3xl border"><div className="grid grid-cols-5 gap-3 border-b bg-slate-50 px-4 py-3 text-sm font-medium dark:bg-slate-800/60"><div>Tijd</div><div>Actor</div><div>Actie</div><div>Entiteit</div><div>Trace</div></div>{filteredRows.map((row, index) => <div key={`${row.time}-${index}`} className="grid grid-cols-5 gap-3 border-b px-4 py-3 text-sm last:border-b-0"><div>{row.time}</div><div>{row.actor}</div><div>{row.action}</div><div>{row.entity}</div><div className="text-slate-500">{row.trace}</div></div>)}</div></CardContent></Card>
    </div>
  );
}

function NotificationsPanel() {
  return (
    <Card className="rounded-[2rem] border-0 shadow-sm"><CardHeader><SectionTitle icon={Bell} title="Meldingen" subtitle="Voorbeeld van alerts en reminders." /></CardHeader><CardContent className="space-y-3">{[{ title: "Consent ingetrokken", kind: "Waarschuwing", icon: AlertTriangle }, { title: "Nieuwe AI-samenvatting klaar", kind: "Info", icon: Bot }, { title: "Risicosignaal vereist beoordeling", kind: "Urgent", icon: HeartPulse }].map((item) => <div key={item.title} className="flex items-start gap-3 rounded-3xl border p-4"><div className="rounded-2xl bg-slate-100 p-2 dark:bg-slate-800"><item.icon className="h-4 w-4" /></div><div><p className="font-medium">{item.title}</p><p className="text-sm text-slate-500">{item.kind}</p></div></div>)}</CardContent></Card>
  );
}

function SecurityPanel() {
  return (
    <Card className="rounded-[2rem] border-0 shadow-sm"><CardHeader><SectionTitle icon={Lock} title="Beveiliging" subtitle="Prototype van security- en privacyinstellingen." /></CardHeader><CardContent className="space-y-4"><div className="rounded-3xl border p-4"><p className="font-medium">Tweestapsverificatie</p><p className="text-sm text-slate-500">Verplicht voor medewerkers en meekijkers.</p></div><div className="rounded-3xl border p-4"><p className="font-medium">Audit READ hashing</p><p className="text-sm text-slate-500">Leesacties worden gegroepeerd opgeslagen.</p></div><div className="rounded-3xl border p-4"><p className="font-medium">Sessiebeëindiging</p><p className="text-sm text-slate-500">Automatisch na inactiviteit.</p></div></CardContent></Card>
  );
}

function AppShell({ user, onLogout, theme, setTheme, fontSize, setFontSize, language, setLanguage }) {
  const defaultSection = user.route === "clinical" ? "clinical" : user.route === "admin" ? "admin" : user.route === "client" ? "client" : user.route === "viewer" ? "viewer" : "staff";
  const [section, setSection] = useState(defaultSection);
  const navItems = [
    ...(user.route === "staff" ? [{ key: "staff", label: "Werkvoorraad", icon: ClipboardList }] : []),
    ...(user.route === "client" ? [{ key: "client", label: "Mijn portaal", icon: Home }] : []),
    ...(user.route === "viewer" ? [{ key: "viewer", label: "Meekijker", icon: Users }] : []),
    ...(user.route === "clinical" ? [{ key: "clinical", label: "Klinisch beheer", icon: FileCog }] : []),
    ...(user.route === "admin" ? [{ key: "admin", label: "Administratie", icon: Shield }] : []),
    { key: "notifications", label: "Meldingen", icon: Bell },
    { key: "security", label: "Beveiliging", icon: Lock },
    { key: "preferences", label: "Voorkeuren", icon: Settings },
  ];

  function renderMain() {
    if (section === "staff") return <StaffDashboard />;
    if (section === "client") return <ClientPortal />;
    if (section === "viewer") return <ViewerPortal />;
    if (section === "clinical") return <ClinicalWorkspace />;
    if (section === "admin") return <AdminWorkspace />;
    if (section === "notifications") return <NotificationsPanel />;
    if (section === "security") return <SecurityPanel />;
    return (
      <Card className="rounded-[2rem] border-0 shadow-sm">
        <CardHeader><SectionTitle icon={Settings} title="Voorkeuren" subtitle="Demo van theming, taal en leesbaarheid." /></CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 rounded-3xl border p-4"><p className="font-medium">Thema</p><div className="flex gap-2"><Button variant={theme === "light" ? "default" : "outline"} className="rounded-2xl" onClick={() => setTheme("light")}><Sun className="mr-2 h-4 w-4" />Licht</Button><Button variant={theme === "dark" ? "default" : "outline"} className="rounded-2xl" onClick={() => setTheme("dark")}><Moon className="mr-2 h-4 w-4" />Donker</Button></div></div>
          <div className="space-y-3 rounded-3xl border p-4"><p className="font-medium">Taal</p><div className="flex gap-2">{[["NL", "Nederlands"], ["EN", "English"]].map(([code, label]) => <Button key={code} variant={language === code ? "default" : "outline"} className="rounded-2xl" onClick={() => setLanguage(code)}>{label}</Button>)}</div></div>
          <div className="space-y-3 rounded-3xl border p-4 md:col-span-2"><p className="font-medium">Tekstgrootte</p><div className="flex flex-wrap gap-2">{["compact", "normaal", "groot"].map((size) => <Button key={size} variant={fontSize === size ? "default" : "outline"} className="rounded-2xl" onClick={() => setFontSize(size)}>{size}</Button>)}</div></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <TopBar user={user} onLogout={onLogout} title="Forta Kompas" subtitle={`${user.org} · ${user.role}`} />
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <Card className="h-fit rounded-[2rem] border-0 shadow-sm"><CardContent className="p-4"><Sidebar items={navItems} current={section} onChange={setSection} /></CardContent></Card>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="min-w-0">{renderMain()}</motion.div>
        </div>
      </div>
    </div>
  );
}

export default function FortaKompasPrototypeApp() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState("normaal");
  const [language, setLanguage] = useState("NL");

  const rootClass = cx(theme === "dark" ? "dark" : "", fontSize === "compact" ? "text-[14px]" : fontSize === "groot" ? "text-[18px]" : "text-[16px]");

  return (
    <div className={rootClass}>
      {user ? <AppShell user={user} onLogout={() => setUser(null)} theme={theme} setTheme={setTheme} fontSize={fontSize} setFontSize={setFontSize} language={language} setLanguage={setLanguage} /> : <LoginScreen onLogin={setUser} theme={theme} setTheme={setTheme} fontSize={fontSize} setFontSize={setFontSize} language={language} setLanguage={setLanguage} />}
    </div>
  );
}
