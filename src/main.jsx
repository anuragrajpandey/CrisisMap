import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, AlertTriangle, Ambulance, Bell, ChevronDown, ChevronRight,
  CircleHelp, Clock3, Crosshair, Droplets, Flame, Globe2, HeartPulse,
  Hospital, LocateFixed, MapPin, Menu, Navigation, Plus, Radio, Search,
  Send, Shield, Siren, SlidersHorizontal, Users, X, Zap
} from 'lucide-react';
import './styles.css';

const incidents = [
  { id: 1, type: 'Accident', title: 'Multi-vehicle collision', location: 'NH-19, Mathura', time: '12 min ago', severity: 'Critical', x: 52, y: 45, icon: '🚗', reports: 4, summary: 'Multiple vehicles are involved in a collision near the NH-19 corridor. Traffic is slowing in both directions.' },
  { id: 2, type: 'Accident', title: 'Bike accident', location: 'Near Mathura Junction', time: '18 min ago', severity: 'High', x: 59, y: 54, icon: '🏍️', reports: 2, summary: 'A motorcycle collision has been reported near the junction. Emergency response is being coordinated.' },
  { id: 3, type: 'Vehicle', title: 'Car overturned', location: 'Delhi–Agra Expressway', time: '32 min ago', severity: 'Medium', x: 44, y: 35, icon: '🚙', reports: 3, summary: 'A car has overturned on the expressway. One lane is affected according to current reports.' },
  { id: 4, type: 'Accident', title: 'Truck and car collision', location: 'NH-44, Mathura', time: '45 min ago', severity: 'High', x: 68, y: 40, icon: '🚛', reports: 5, summary: 'Truck and passenger vehicle collision reported. Responders are moving toward the location.' },
  { id: 5, type: 'Accident', title: 'Minor accident', location: 'Govardhan Road', time: '1 hour ago', severity: 'Low', x: 37, y: 66, icon: '🚗', reports: 1, summary: 'Minor road incident with limited disruption. No casualties reported by available sources.' },
  { id: 6, type: 'Fire', title: 'Industrial fire detected', location: 'Mathura industrial area', time: '1h 12m ago', severity: 'High', x: 61, y: 28, icon: '🔥', reports: 2, summary: 'Satellite detection indicates an active fire hotspot. Urban confirmation is pending.' },
  { id: 7, type: 'Weather', title: 'Heavy rainfall warning', location: 'Mathura district', time: '2 hours ago', severity: 'Medium', x: 30, y: 50, icon: '🌧️', reports: 1, summary: 'Weather warning active for heavy rainfall. This is a warning event, not a confirmed flood incident.' },
  { id: 8, type: 'Medical', title: 'Medical emergency', location: 'Govardhan Road', time: '2h 18m ago', severity: 'Critical', x: 75, y: 63, icon: '⚕️', reports: 3, summary: 'Medical emergency reported by nearby citizens. Nearest emergency services have been surfaced.' },
];

const services = [
  { icon: Hospital, name: 'District Hospital, Mathura', distance: '2.1 km', eta: '6 min', action: 'Directions' },
  { icon: Shield, name: 'Traffic Police Station', distance: '1.8 km', eta: '5 min', action: 'Directions' },
  { icon: Siren, name: 'Fire Station', distance: '3.4 km', eta: '8 min', action: 'Directions' },
  { icon: Ambulance, name: 'Ambulance Services (108)', distance: 'Emergency', eta: '108', action: 'Call' },
];

const severityClass = (s) => s.toLowerCase();

function Logo() {
  return <div className="brand"><div className="brand-mark"><Shield size={21} fill="currentColor" /></div><div><strong>Crisis<span>Map</span></strong><small>Safer roads. Safer people.</small></div></div>;
}

function Sidebar({ active, setActive }) {
  const items = [
    ['Live Map', Radio], ['Accidents', Siren], ['Report Accident', Plus], ['Nearby Services', Users],
    ['Analytics', Activity], ['Alerts', AlertTriangle], ['Community', Users], ['Settings', SlidersHorizontal]
  ];
  return <aside className="sidebar"><Logo />
    <nav>{items.map(([label, Icon], i) => <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => setActive(label)}><Icon size={17}/><span>{label}</span>{label === 'Alerts' && <b className="nav-badge">3</b>}</button>)}</nav>
    <div className="sidebar-spacer" />
    <div className="save-card"><div className="save-glow"/><strong>Every Report<br/>Can Save a Life</strong><p>Real-time information.<br/>Faster help.<br/>Safer roads.</p><button onClick={() => setActive('Report Accident')}>Start a New Report <ChevronRight size={14}/></button></div>
    <div className="sidebar-foot">● Systems operational</div>
  </aside>;
}

function Topbar({ onReport }) {
  return <header className="topbar"><div className="search"><Search size={17}/><input placeholder="Search location (e.g. Mathura, NH-19, Delhi...)"/><kbd>⌘ K</kbd></div><div className="top-actions"><div className="live"><i/> Live Updates</div><button className="icon-button"><Bell size={18}/><b>3</b></button><button className="report-button" onClick={onReport}><Plus size={17}/> Report Accident</button><div className="avatar">DS</div><ChevronDown size={15}/></div></header>;
}

function Filters({ filters, setFilters }) {
  const [open, setOpen] = useState(null);
  const menus = [
    ['period', 'Last 24 hours', ['Last 24 hours', 'Last 7 days', 'Last 30 days']],
    ['severity', filters.severity === 'All' ? 'All Severities' : filters.severity, ['All', 'Critical', 'High', 'Medium', 'Low']],
    ['type', filters.type === 'All' ? 'All Vehicle Types' : filters.type, ['All', 'Accident', 'Fire', 'Medical', 'Weather']],
    ['state', 'All States', ['All States', 'Uttar Pradesh', 'Delhi', 'Rajasthan']]
  ];
  return <div className="filters"><div className="filter-select accent"><Siren size={14}/><span>Accidents</span><ChevronDown size={14}/></div>{menus.map(([key, label, options]) => <div className="filter-wrap" key={key}><button className="filter-select" onClick={() => setOpen(open === key ? null : key)}><SlidersHorizontal size={13}/><span>{label}</span><ChevronDown size={13}/></button>{open === key && <div className="dropdown">{options.map(o => <button key={o} onClick={() => { setFilters({...filters, [key === 'severity' ? 'severity' : key === 'type' ? 'type' : key]: o}); setOpen(null); }}>{o}</button>)}</div>}</div>)}<button className="clear" onClick={() => setFilters({severity:'All', type:'All'})}>Clear Filters</button></div>;
}

function MapCanvas({ visibleIncidents, selected, setSelected }) {
  return <div className="map-card"><div className="map-texture"/><div className="road road-a"/><div className="road road-b"/><div className="road road-c"/><div className="river"/>
    <span className="place p1">Mathura</span><span className="place p2">Vrindavan</span><span className="place p3">Agra</span><span className="place p4">Kosi Kalan</span><span className="road-label r1">NH-19</span><span className="road-label r2">NH-44</span><span className="road-label r3">Yamuna Expressway</span>
    {visibleIncidents.map((incident) => <button key={incident.id} className={`marker ${severityClass(incident.severity)} ${selected?.id === incident.id ? 'selected' : ''}`} style={{left:`${incident.x}%`, top:`${incident.y}%`}} onClick={() => setSelected(incident)} title={incident.title}><span>{incident.severity === 'Critical' ? incident.reports : incident.icon}</span></button>)}
    <div className="map-info"><strong>Zoom to see more incidents</strong><span>(as you zoom, more real-time updates appear)</span></div>
    <div className="heat"><div className="heat-ring ring1"/><div className="heat-ring ring2"/><div className="heat-dot"/><div className="heat-label"><b>Heatmap Overview</b><span>Zoom in: More<br/>incidents appear</span></div></div>
    <div className="key-card"><b>Key Indicators</b><div><Radio/><span>Total Active Incidents<strong>55</strong></span></div><div><Clock3/><span>Average Response Time<strong>6.2 mins</strong></span></div><div><Users/><span>Live Users Online<strong>148</strong></span></div><hr/><small><i className="dot critical"/>Critical <i className="dot high"/>High <i className="dot medium"/>Medium <i className="dot low"/>Low</small></div>
    <div className="map-tools"><button><Plus/></button><button><span className="minus">−</span></button><button><LocateFixed/></button></div><div className="scale">2 km</div>
  </div>;
}

function IncidentList({ visibleIncidents, selected, setSelected }) {
  return <section className="incidents-panel"><div className="section-head"><div><h3>Incidents Nearby <em>({visibleIncidents.length * 3 + 1})</em></h3><span>Live reports around Mathura</span></div><button>Sort: Latest <ChevronDown size={13}/></button></div><div className="incident-list">{visibleIncidents.slice(0,6).map(i => <button className={`incident-row ${selected?.id === i.id ? 'picked' : ''}`} key={i.id} onClick={() => setSelected(i)}><div className={`incident-icon ${severityClass(i.severity)}`}>{i.icon}</div><div className="incident-copy"><strong>{i.title}</strong><span>{i.location}</span><small>{i.time}</small></div><span className={`pill ${severityClass(i.severity)}`}>{i.severity}</span><div className="thumb">{i.type === 'Fire' ? '🔥' : i.type === 'Weather' ? '🌧️' : '🚘'}</div></button>)}</div><button className="view-all">View All Incidents <ChevronRight size={14}/></button></section>;
}

function RecentAccidents({ visibleIncidents }) {
  return <section className="card recent"><div className="section-head"><h3>Recent Accidents</h3><button>View All <ChevronRight size={13}/></button></div>{visibleIncidents.slice(0,5).map(i => <div className="recent-row" key={i.id}><span className="mini-thumb">{i.icon}</span><span><b>{i.title}</b><small>{i.location}</small></span><time>{i.time}</time><em className={`pill ${severityClass(i.severity)}`}>{i.severity}</em></div>)}</section>;
}

function Services() {
  return <section className="card services"><div className="section-head"><div><h3>Nearby Services</h3><span>Find help close to this location</span></div><button>View All <ChevronRight size={13}/></button></div>{services.map(({icon:Icon,name,distance,eta,action}) => <div className="service-row" key={name}><div className="service-icon"><Icon size={16}/></div><span><b>{name}</b><small>{distance} <i>•</i> {eta}</small></span><button className="phone"><Navigation size={14}/></button><button className="direction">{action}</button></div>)}</section>;
}

function BottomRelief() {
  return <section className="relief-card"><div className="relief-icon"><HeartPulse/></div><div><b>Need help beyond emergency services?</b><span>Connect with verified relief organizations and community responders.</span></div><button>Explore Relief Network <ChevronRight size={15}/></button></section>;
}

function ReportModal({ close }) {
  const [sent, setSent] = useState(false);
  if (sent) return <div className="modal-backdrop"><div className="modal success"><button className="close" onClick={close}><X/></button><div className="success-icon"><Send/></div><h2>Report received</h2><p>Your report is now <b>unverified</b> and will be correlated with other available sources before verification.</p><button className="primary" onClick={close}>Back to Live Map</button></div></div>;
  return <div className="modal-backdrop"><div className="modal"><button className="close" onClick={close}><X/></button><div className="modal-kicker"><Radio size={15}/> COMMUNITY REPORT</div><h2>Witness an incident?</h2><p>Share what you know. Keep it short, location-aware, and factual.</p><label>Incident type<select><option>Accident</option><option>Fire</option><option>Medical emergency</option><option>Infrastructure</option><option>Other</option></select></label><label>Description<textarea placeholder="What happened? Add any useful details..."></textarea></label><label>Location<div className="location-input"><LocateFixed size={16}/> Use current location <span>Mathura, Uttar Pradesh</span></div></label><div className="upload"><Plus size={18}/><span><b>Add photo</b><small>Optional evidence</small></span></div><button className="primary" onClick={() => setSent(true)}><Send size={16}/> Submit Report</button><small className="privacy">Your identity is not shown publicly. Reports remain unverified until reviewed.</small></div></div>;
}

function DetailDrawer({ incident, close }) {
  if (!incident) return null;
  return <div className="detail-drawer"><button className="drawer-close" onClick={close}><X/></button><div className={`detail-icon ${severityClass(incident.severity)}`}>{incident.icon}</div><span className={`status ${severityClass(incident.severity)}`}>{incident.severity.toUpperCase()} SEVERITY</span><h2>{incident.title}</h2><div className="detail-location"><MapPin size={16}/> {incident.location}</div><div className="verified"><Shield size={15}/> Unverified incident <span>• {incident.reports} reports</span></div><div className="detail-section"><h4>AI SUMMARY</h4><p>{incident.summary}</p></div><div className="detail-section"><h4>SOURCES & CONFIDENCE</h4><div className="source"><span>Citizen reports</span><b>{Math.min(96, 52 + incident.reports * 7)}%</b></div><div className="source"><span>Automated processing</span><b>89%</b></div></div><div className="detail-section"><h4>NEARBY HELP</h4><div className="help-row"><Hospital size={17}/> District Hospital <span>2.1 km</span></div><div className="help-row"><Shield size={17}/> Traffic Police <span>1.8 km</span></div></div><button className="route"><Navigation size={16}/> Get route to incident</button></div>;
}

function App() {
  const [active, setActive] = useState('Live Map');
  const [filters, setFilters] = useState({severity:'All', type:'All'});
  const [selected, setSelected] = useState(null);
  const [report, setReport] = useState(false);
  const visible = useMemo(() => incidents.filter(i => (filters.severity === 'All' || i.severity === filters.severity) && (filters.type === 'All' || i.type === filters.type)), [filters]);
  const handleNav = (label) => { setActive(label); if (label === 'Report Accident') setReport(true); };
  return <div className="app"><Sidebar active={active} setActive={handleNav}/><main><Topbar onReport={() => setReport(true)}/><div className="content"><div className="page-title"><div><div className="eyebrow"><i/> LIVE INTELLIGENCE</div><h1>Live Incident Map</h1><p>Real-time public safety events and response resources across your area.</p></div><div className="last-updated"><span><Zap size={13}/> LIVE</span> Updated just now</div></div><Filters filters={filters} setFilters={setFilters}/><div className="dashboard-grid"><div className="map-column"><MapCanvas visibleIncidents={visible} selected={selected} setSelected={setSelected}/><div className="bottom-grid"><RecentAccidents visibleIncidents={visible}/><Services/></div><BottomRelief/></div><IncidentList visibleIncidents={visible} selected={selected} setSelected={setSelected}/></div></div></main>{selected && <DetailDrawer incident={selected} close={() => setSelected(null)}/>} {report && <ReportModal close={() => setReport(false)}/>}<div className="emergency"><CircleHelp size={15}/> In an emergency, always call <b>112</b></div></div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
