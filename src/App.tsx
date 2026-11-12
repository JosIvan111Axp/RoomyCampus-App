import { lazy, Suspense, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BedDouble,
  Building2,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Compass,
  CreditCard,
  Heart,
  Home,
  KeyRound,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquareText,
  Minus,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Send,
  Users,
  Wifi,
  X,
  Zap,
  Droplets,
} from "lucide-react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { filterAndSortListings } from "./catalog";
import {
  academicStart,
  demandMultiplier,
  listingPriceBreakdown,
  listingTotal,
  residentAlerts,
  residentReviews,
  type Listing,
  type PropertyKind,
  type PropertyStatus,
} from "./data";
import { useDemoStore, type ContactRequest, type UserRole, type Visit } from "./store";

type IconType = typeof Home;
type ToastMessage = { id: number; text: string; tone?: "success" | "warning" };
type MapProps = { listings: Listing[]; onSelect?: (listing: Listing) => void; admin?: boolean; calendarDay?: number };
type SectorPrice = { sector: string; precio: number };
const LazyCampusMap = lazy(() => import("./components/MapView"));
const LazyAdminCharts = lazy(() => import("./components/AdminCharts"));
let toastSequence = 0;
type WindowWithDemo = Window & {
  __ROOMYCAMPUS__?: {
    getState: typeof useDemoStore.getState;
    actions: {
      reset: () => void;
      enrollmentWeek: () => void;
      occupyListings: () => void;
      injectFraud: () => void;
      approveNext: () => void;
    };
  };
};

const money = (value: number) =>
  new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const statusNames: Record<PropertyStatus, string> = {
  available: "Disponible",
  reserved: "En negociación",
  occupied: "Ocupado",
  pending: "Por verificar",
  rejected: "Rechazado",
};

const kindNames: Record<PropertyKind, string> = { Suite: "Suite", Cuarto: "Cuarto", Roomie: "Roomie" };

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link aria-label="RoomyCampus, inicio" className={`brand ${compact ? "brand--compact" : ""}`} to="/">
      <span className="brand__mark">r.</span>
      {!compact && (
        <span className="brand__wordmark">
          roomy<span>campus</span>
        </span>
      )}
    </Link>
  );
}

function Eyebrow({ children, icon: Icon }: { children: ReactNode; icon?: IconType }) {
  return (
    <span className="eyebrow">
      {Icon && <Icon aria-hidden="true" size={14} />}
      {children}
    </span>
  );
}

function Toasts({ items }: { items: ToastMessage[] }) {
  return (
    <div aria-live="polite" className="toast-stack">
      {items.map((toast) => (
        <div className={`toast ${toast.tone === "warning" ? "toast--warning" : ""}`} key={toast.id}>
          {toast.tone === "warning" ? <CircleAlert size={18} /> : <Check size={18} />}
          {toast.text}
        </div>
      ))}
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  return (
    <main className="landing">
      <nav className="landing-nav">
        <Brand />
        <a className="landing-nav__link" href="#como-funciona">
          Cómo funciona
        </a>
        <button className="button button--small button--outline" onClick={() => navigate("/admin")} type="button">
          Panel gerencial <ArrowUpRight size={16} />
        </button>
      </nav>
      <section className="landing-hero">
        <div className="landing-hero__copy">
          <Eyebrow icon={Sparkles}>TU NUEVO COMIENZO, MÁS CERCA</Eyebrow>
          <h1>
            Encuentra tu lugar
            <br />
            <span>cerca del campus.</span>
          </h1>
          <p>
            Habitaciones y suites verificadas alrededor de ESPOL. Compara precios reales, servicios y
            distancia antes de decidir.
          </p>
            <button className="button button--primary button--large" onClick={() => navigate("/app")} type="button">
              Iniciar sesión para explorar <ArrowRight size={18} />
          </button>
          <div className="landing-proof">
            <span className="avatar-stack" aria-hidden="true">
              <i>V</i>
              <i>M</i>
              <i>A</i>
            </span>
            <span>
              <strong>Una búsqueda más tranquila.</strong>
              <small>Diseñado para la vida universitaria.</small>
            </span>
          </div>
        </div>
        <div className="landing-hero__visual">
          <div className="hero-photo">
            <img
              alt="Sala iluminada de un alojamiento estudiantil"
              src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85"
            />
            <div className="photo-tag">
              <span className="live-dot" /> A 8 min de ESPOL
            </div>
          </div>
          <div className="floating-card floating-card--price">
            <span>Desde</span>
            <strong>$110 <small>/ mes</small></strong>
            <small>servicios desglosados</small>
          </div>
          <div className="floating-card floating-card--verified">
            <span className="verified-seal"><ShieldCheck size={18} /></span>
            <span><strong>Arrendadores</strong><small>verificados</small></span>
          </div>
          <div className="hero-orbit" />
        </div>
      </section>
      <section className="role-cards" id="como-funciona">
        <button className="role-card role-card--student" onClick={() => navigate("/registro")} type="button">
          <span className="role-card__icon"><Compass size={22} /></span>
          <span className="role-card__copy"><strong>Crear cuenta de estudiante</strong><small>Regístrate con tu correo ESPOL para guardar y agendar.</small></span>
          <ArrowRight size={19} />
        </button>
        <button className="role-card" onClick={() => navigate("/admin")} type="button">
          <span className="role-card__icon role-card__icon--dark"><ArrowUpRight size={22} /></span>
          <span className="role-card__copy"><strong>Ver panel gerencial</strong><small>Indicadores, revisión de propiedades y tendencias.</small></span>
          <ArrowRight size={19} />
        </button>
        <button className="role-card" onClick={() => navigate("/propietario")} type="button">
          <span className="role-card__icon"><Building2 size={22} /></span>
          <span className="role-card__copy"><strong>Administrar un alojamiento</strong><small>Gestiona mensajes, visitas, comentarios y alertas.</small></span>
          <ArrowRight size={19} />
        </button>
      </section>
      <footer className="landing-footer">
        <Brand compact />
        <span>Proyecto académico · datos de mercado simulados</span>
        <span>Guayaquil, Ecuador</span>
      </footer>
    </main>
  );
}

function LoginPage({ role, signup = false }: { role: UserRole; signup?: boolean }) {
  const navigate = useNavigate();
  const { authenticate } = useDemoStore();
  const [email, setEmail] = useState(
    role === "admin" ? "admin@roomycampus.ec" : role === "landlord" ? "alojamiento@roomycampus.ec" : "",
  );
  const [name, setName] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(signup);
  const [error, setError] = useState("");

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (role === "student" && !normalizedEmail.endsWith("@espol.edu.ec")) {
      setError("Ingresa tu correo institucional con dominio @espol.edu.ec.");
      return;
    }
    if (role === "admin" && normalizedEmail !== "admin@roomycampus.ec") {
      setError("Para esta demo, usa admin@roomycampus.ec.");
      return;
    }
    if (role === "landlord" && normalizedEmail !== "alojamiento@roomycampus.ec") {
      setError("Para esta demo, usa alojamiento@roomycampus.ec.");
      return;
    }
    if (creatingAccount && name.trim().length < 2) {
      setError("Escribe tu nombre para crear la cuenta de demostración.");
      return;
    }
    authenticate(normalizedEmail, role);
    navigate(role === "admin" ? "/admin" : role === "landlord" ? "/propietario" : "/app");
  }

  const isPlatformAdmin = role === "admin";
  const isLandlord = role === "landlord";
  const heading = isPlatformAdmin ? "Panel gerencial" : isLandlord ? "Administración de alojamientos" : creatingAccount ? "Crea tu cuenta" : "Bienvenido a casa";
  const eyebrow = isPlatformAdmin ? "ACCESO DE GESTIÓN" : isLandlord ? "PANEL DEL ALOJAMIENTO" : "TU VIDA UNIVERSITARIA, MÁS CERCA";

  return (
    <main className="login-page">
      <div className="login-top"><Brand /><Link className="text-link" to="/">Volver al inicio</Link></div>
      <section className="login-card">
        <span className="login-symbol">{isPlatformAdmin ? <KeyRound size={23} /> : isLandlord ? <Building2 size={23} /> : <Home size={23} />}</span>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1>{heading}</h1>
        <p>{isPlatformAdmin ? "Ingresa al espacio de administración de RoomyCampus." : isLandlord ? "Revisa las solicitudes y novedades de quienes viven en tus alojamientos." : creatingAccount ? "Regístrate con tu correo institucional para guardar propiedades y coordinar visitas." : "Accede con tu correo ESPOL para explorar propiedades verificadas."}</p>
        <form className="login-form" onSubmit={signIn}>
          {creatingAccount && <><label htmlFor="account-name">Nombre completo</label><input autoComplete="name" id="account-name" onChange={(event) => { setName(event.target.value); setError(""); }} placeholder="Tu nombre" required value={name} /></>}
          <label htmlFor="email">Correo electrónico</label>
          <input
            autoComplete="email"
            id="email"
            onChange={(event) => { setEmail(event.target.value); setError(""); }}
            placeholder={isPlatformAdmin ? "admin@roomycampus.ec" : isLandlord ? "alojamiento@roomycampus.ec" : "nombre@espol.edu.ec"}
            required
            type="email"
            value={email}
          />
          {error && <span className="form-error" role="alert">{error}</span>}
          <button className="button button--primary button--full" type="submit">
            {isPlatformAdmin ? "Ingresar al panel" : isLandlord ? "Entrar al panel del alojamiento" : creatingAccount ? "Crear cuenta de demostración" : "Continuar con ESPOL"} <ArrowRight size={17} />
          </button>
        </form>
        <div className="login-note"><ShieldCheck size={15} /> Cuenta simulada; no se guardan contraseñas ni se conecta a un servidor.</div>
        {role === "student" && <button className="text-button login-demo" onClick={() => { setCreatingAccount(!creatingAccount); setError(""); }} type="button">{creatingAccount ? "Ya tengo cuenta · iniciar sesión" : "¿Primera vez? Crear cuenta"}</button>}
        {role !== "student" && <button className="text-button login-demo" onClick={() => { authenticate(email, role); navigate(isPlatformAdmin ? "/admin" : "/propietario"); }} type="button">Entrar como {isPlatformAdmin ? "administrador de plataforma" : "administrador de alojamiento"} demo <ArrowRight size={15} /></button>}
      </section>
      <span className="prototype-disclaimer">Prototipo académico · usuarios y alojamientos de ejemplo</span>
    </main>
  );
}

function CampusMap(props: MapProps) {
  const { admin = false } = props;
  return (
    <Suspense fallback={<div aria-live="polite" className={`map-frame ${admin ? "map-frame--admin" : ""}`}><span className="map-loading">Cargando mapa…</span></div>}>
      <LazyCampusMap {...props} />
    </Suspense>
  );
}

function ListingCard({ listing, onOpen, compact = false }: { listing: Listing; onOpen: (listing: Listing) => void; compact?: boolean }) {
  const { favorites, toggleFavorite } = useDemoStore();
  const calendarDay = useDemoStore((state) => state.calendarDay);
  const total = listingPriceBreakdown(listing, calendarDay).total;
  return (
    <article className={`listing-card ${compact ? "listing-card--compact" : ""}`} onClick={() => onOpen(listing)} onKeyDown={(event) => { if (event.key === "Enter") onOpen(listing); }} role="button" tabIndex={0}>
      <div className="listing-card__image">
        <img alt="" loading="lazy" src={listing.image} />
        <span className={`availability availability--${listing.status}`}>{statusNames[listing.status]}</span>
        <button
          aria-label={favorites.includes(listing.id) ? "Quitar de guardados" : "Guardar alojamiento"}
          aria-pressed={favorites.includes(listing.id)}
          className={`favorite-button ${favorites.includes(listing.id) ? "favorite-button--active" : ""}`}
          onClick={(event) => { event.stopPropagation(); toggleFavorite(listing.id); }}
          type="button"
        >
          <Heart fill={favorites.includes(listing.id) ? "currentColor" : "none"} size={18} />
        </button>
      </div>
      <div className="listing-card__content">
        <div className="listing-card__title-row">
          <span className="listing-kind">{kindNames[listing.kind]} · {listing.sector}</span>
          {listing.verified && <span className="mini-verified" title="Arrendador verificado"><BadgeCheck size={15} /></span>}
        </div>
        <h3>{listing.title}</h3>
        {!compact && <p className="listing-card__address"><MapPin size={13} /> {listing.address}</p>}
        <div className="listing-card__meta">
          <span><Clock3 size={13} /> {listing.walkMinutes} min a ESPOL*</span>
          <span><Star fill="currentColor" size={13} /> {listing.rating || "Nuevo"}{listing.reviews > 0 ? ` (${listing.reviews})` : ""}</span>
        </div>
        <div className="listing-card__price-row">
          <strong>{money(total)}<small> / mes</small></strong>
          <span>servicios incluidos</span>
        </div>
      </div>
    </article>
  );
}

function Overlay({ children, onClose, labelledBy, className = "" }: { children: ReactNode; onClose: () => void; labelledBy: string; className?: string }) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) { if (event.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="overlay" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} role="presentation">
      <section aria-labelledby={labelledBy} aria-modal="true" className={`overlay-card ${className}`} role="dialog">
        <button aria-label="Cerrar" className="overlay-close" onClick={onClose} type="button"><X size={20} /></button>
        {children}
      </section>
    </div>
  );
}

function PropertyDetails({ listing, close, notify }: { listing: Listing; close: () => void; notify: (text: string, tone?: ToastMessage["tone"]) => void }) {
  const { calendarDay, contactsThisMonth, email, favorites, reserveListing, scheduleVisit, sendContactRequest, toggleFavorite } = useDemoStore();
  const [visitOpen, setVisitOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [visitDate, setVisitDate] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const isAvailable = listing.status === "available";
  const prices = listingPriceBreakdown(listing, calendarDay);

  function contact() {
    if (contactsThisMonth >= 3) {
      setPlanOpen(true);
      return;
    }
    setContactOpen(true);
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = contactMessage.trim();
    if (message.length < 8) return;
    sendContactRequest(listing.id, email, message);
    setContactOpen(false);
    setContactMessage("");
    notify(`Solicitud enviada a ${listing.landlord}. El administrador la verá en su panel. Contacto ${contactsThisMonth + 1} de 3.`);
  }

  function bookVisit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!visitDate) return;
    scheduleVisit(listing.id, visitDate, email);
    setVisitOpen(false);
    notify("Visita agendada. La fecha es simulada en este prototipo.");
  }

  function reserve() {
    reserveListing(listing.id);
    notify("Habitación marcada como ocupada; el cambio ya se comparte con el panel gerencial.");
    close();
  }

  return (
    <Overlay className="property-dialog" labelledBy="property-heading" onClose={close}>
      {planOpen ? (
        <section className="plan-content">
          <Eyebrow icon={Sparkles}>MÁS CONTACTOS, MEJORES OPCIONES</Eyebrow>
          <h2 id="property-heading">Elige tu plan</h2>
          <p>Planes ilustrativos. No se realizará ningún cobro real.</p>
          <div className="plan-grid">
            <article className="plan-card"><span>BASIC</span><strong>Gratis</strong><p>3 contactos al mes</p><Check size={16} /> Explora todo el mapa</article>
            <article className="plan-card plan-card--pro"><span>PRO · DEMO</span><strong>$4.99<small> / mes</small></strong><p>Contactos ilimitados</p><Check size={16} /> Alertas tempranas</article>
          </div>
          <label className="payment-label" htmlFor="demo-card"><CreditCard size={16} /> Tarjeta de prueba</label>
          <input id="demo-card" autoComplete="off" inputMode="numeric" placeholder="4242 4242 4242 4242" />
          <button className="button button--primary button--full" onClick={() => { setPlanOpen(false); notify("Suscripción de demo simulada. No se procesó ningún pago."); }} type="button">Simular activación de Pro</button>
          <button className="text-button text-button--center" onClick={() => setPlanOpen(false)} type="button">Volver a la propiedad</button>
        </section>
      ) : contactOpen ? (
        <section className="visit-content">
          <Eyebrow icon={MessageSquareText}>MENSAJE AL ADMINISTRADOR</Eyebrow>
          <h2 id="property-heading">Contactar alojamiento</h2>
          <p>Tu solicitud para <strong>{listing.title}</strong> se mostrará en el panel de {listing.landlord}. El envío es simulado.</p>
          <form onSubmit={sendMessage}>
            <label htmlFor="contact-message">¿Qué te gustaría consultar?</label>
            <textarea id="contact-message" maxLength={500} minLength={8} onChange={(event) => setContactMessage(event.target.value)} placeholder="Hola, quisiera conocer más sobre la habitación y coordinar una visita." required rows={4} value={contactMessage} />
            <button className="button button--primary button--full" type="submit"><Send size={16} /> Enviar solicitud</button>
          </form>
          <button className="text-button text-button--center" onClick={() => setContactOpen(false)} type="button">Cancelar</button>
        </section>
      ) : visitOpen ? (
        <section className="visit-content">
          <Eyebrow icon={CalendarDays}>COORDINA CON EL ARRENDADOR</Eyebrow>
          <h2 id="property-heading">Agenda una visita</h2>
          <p>{listing.title} · {listing.sector}</p>
          <form onSubmit={bookVisit}>
            <label htmlFor="visit-date">Fecha preferida</label>
            <input id="visit-date" min={new Date().toISOString().slice(0, 10)} onChange={(event) => setVisitDate(event.target.value)} required type="date" value={visitDate} />
            <button className="button button--primary button--full" type="submit">Solicitar visita</button>
          </form>
          <button className="text-button text-button--center" onClick={() => setVisitOpen(false)} type="button">Cancelar</button>
        </section>
      ) : (
        <>
          <div className="detail-gallery">
            <img alt={`Alojamiento de ejemplo: ${listing.title}`} src={listing.image} />
            <span className={`availability availability--${listing.status}`}>{statusNames[listing.status]}</span>
          </div>
          <div className="detail-content">
            <Eyebrow icon={MapPin}>{listing.sector.toUpperCase()} · {kindNames[listing.kind].toUpperCase()}</Eyebrow>
            <h2 id="property-heading">{listing.title}</h2>
            <p className="detail-address">{listing.address}</p>
            <div className="detail-highlights">
              <span><BedDouble size={17} /> {listing.area} m² · {listing.bedrooms} dormitorio</span>
              <span><Clock3 size={17} /> {listing.walkMinutes} min a pie · {listing.distanceKm} km*</span>
              <span><Star fill="currentColor" size={16} /> {listing.rating || "Sin reseñas"} {listing.reviews ? `· ${listing.reviews} reseñas de ejemplo` : ""}</span>
            </div>
            <div className="financial-card">
              <div><span>Renta mensual</span><strong>{money(prices.rent)}</strong></div>
              <div><span><Droplets size={14} /> Agua</span><strong>{money(prices.water)}</strong></div>
              <div><span><Zap size={14} /> Luz</span><strong>{money(prices.power)}</strong></div>
              <div><span><Wifi size={14} /> Wifi</span><strong>{money(prices.wifi)}</strong></div>
              <div className="financial-card__total"><strong>Total estimado al mes{calendarDay >= 21 && calendarDay <= 27 ? " · matrícula" : ""}</strong><strong>{money(prices.total)}</strong></div>
            </div>
            <div className="landlord-card">
              <span className="landlord-avatar">{listing.landlord.charAt(0)}</span>
              <span><strong>{listing.landlord}</strong><small>{listing.verified ? "Identidad de ejemplo verificada" : "Perfil pendiente de verificar"}</small></span>
              {listing.verified ? <BadgeCheck className="verified-check" size={20} /> : <CircleAlert className="warning-icon" size={20} />}
            </div>
            <p className="fine-print">* Ruta y tiempo referenciales del prototipo, no calculados en tiempo real. Precios, reseñas y perfiles son datos simulados.</p>
            <div className="detail-actions">
              <button className="button button--outline" onClick={() => setVisitOpen(true)} type="button"><CalendarDays size={17} /> Agendar visita</button>
              <button className="button button--primary" disabled={!isAvailable} onClick={contact} type="button"><MessageCircle size={17} /> Contactar</button>
            </div>
            {isAvailable && <button className="text-button reserve-button" onClick={reserve} type="button">Reservar habitación · acción de demo</button>}
            <button className="text-button detail-favorite" onClick={() => toggleFavorite(listing.id)} type="button">
              <Heart fill={favorites.includes(listing.id) ? "currentColor" : "none"} size={16} />
              {favorites.includes(listing.id) ? "Quitar de guardados" : "Guardar en favoritos"}
            </button>
          </div>
        </>
      )}
    </Overlay>
  );
}

function VisitCalendar({ visits, listings, email, listingIds }: { visits: Visit[]; listings: Listing[]; email?: string; listingIds?: string[] }) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const myVisits = visits
    .filter((visit) => listingIds ? listingIds.includes(visit.listingId) : visit.studentEmail === email)
    .sort((a, b) => a.date.localeCompare(b.date));
  const visitDates = new Set(myVisits.map((visit) => visit.date));
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDayOffset = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
  const monthPrefix = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  const visibleVisits = myVisits.filter((visit) =>
    selectedDate ? visit.date === selectedDate : visit.date >= new Date().toISOString().slice(0, 10),
  ).slice(0, selectedDate ? undefined : 3);

  function moveMonth(amount: number) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
    setSelectedDate(null);
  }

  return (
    <section aria-label="Calendario de visitas" className="visit-calendar" id="student-visits">
      <div className="visit-calendar__intro">
        <Eyebrow icon={CalendarCheck}>AGENDA PERSONAL</Eyebrow>
        <h2>Visitas agendadas</h2>
        <p>Consulta tus solicitudes y fechas en un solo lugar.</p>
        <span className="visit-calendar__count">{myVisits.length} visita{myVisits.length === 1 ? "" : "s"} · demo</span>
      </div>
      <div className="visit-calendar__widget">
        <div className="mini-calendar__header">
          <strong>{month.toLocaleDateString("es-EC", { month: "long", year: "numeric" })}</strong>
          <span>
            <button aria-label="Mes anterior" onClick={() => moveMonth(-1)} type="button"><ChevronLeft size={16} /></button>
            <button aria-label="Mes siguiente" onClick={() => moveMonth(1)} type="button"><ChevronRight size={16} /></button>
          </span>
        </div>
        <div aria-label="Días de la semana" className="mini-calendar__grid">
          {["L", "M", "X", "J", "V", "S", "D"].map((day, index) => <span className="mini-calendar__weekday" key={`${day}-${index}`}>{day}</span>)}
          {Array.from({ length: firstDayOffset }, (_, index) => <span aria-hidden="true" className="mini-calendar__empty" key={`empty-${index}`} />)}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const date = `${monthPrefix}-${String(day).padStart(2, "0")}`;
            return <button aria-label={`${day}${visitDates.has(date) ? ", visita agendada" : ""}`} aria-pressed={selectedDate === date} className={`${visitDates.has(date) ? "mini-calendar__day--has-visit" : ""} ${selectedDate === date ? "mini-calendar__day--selected" : ""}`} key={date} onClick={() => setSelectedDate(selectedDate === date ? null : date)} type="button">{day}</button>;
          })}
        </div>
      </div>
      <div className="visit-calendar__list">
        <strong>{selectedDate ? `Visitas del ${new Date(`${selectedDate}T12:00:00`).toLocaleDateString("es-EC", { day: "numeric", month: "long" })}` : "Próximas visitas"}</strong>
        {visibleVisits.length === 0 ? (
          <p>{selectedDate ? "No tienes una visita agendada para ese día." : myVisits.length === 0 ? "Cuando agendes una visita, aparecerá aquí." : "No hay visitas en este mes."}</p>
        ) : visibleVisits.map((visit) => {
          const listing = listings.find((item) => item.id === visit.listingId);
          return <div className="visit-calendar__item" key={visit.id}><CalendarDays size={16} /><span><b>{new Date(`${visit.date}T12:00:00`).toLocaleDateString("es-EC", { day: "numeric", month: "short" })}</b><small>{listing?.title ?? "Alojamiento"} · solicitud por confirmar</small></span></div>;
        })}
      </div>
    </section>
  );
}

function StudentApp() {
  const { email, logout, listings, favorites, visits, calendarDay } = useDemoStore();
  const [selected, setSelected] = useState<Listing | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"Todos" | PropertyKind>("Todos");
  const [maxPrice, setMaxPrice] = useState(250);
  const [sortMode, setSortMode] = useState<"price" | "rating" | "distance">("price");
  const [wifiOnly, setWifiOnly] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const date = new Date(academicStart);
  date.setDate(date.getDate() + calendarDay);
  const enrollmentWeek = calendarDay >= 21 && calendarDay <= 27;

  function notify(text: string, tone?: ToastMessage["tone"]) {
    const id = ++toastSequence;
    setToasts((items) => [...items, { id, text, tone }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3600);
  }

  const visibleListings = useMemo(
    () => filterAndSortListings(listings, { category, calendarDay, favorites, maxPrice, query, showSaved, sortMode, wifiOnly }),
    [calendarDay, category, favorites, listings, maxPrice, query, showSaved, sortMode, wifiOnly],
  );

  return (
    <main className="student-page">
      <header className="student-header">
        <div className="student-header__brand"><Brand compact /><span className="student-divider" /><span className="student-context">Mi próximo hogar</span></div>
        <div className="student-header__right">
          <span className="student-email"><span className="online-dot" /> {email}</span>
          <button aria-label="Menú" className="icon-button mobile-menu-button" onClick={() => setMobileMenu(!mobileMenu)} type="button"><Menu size={21} /></button>
          <div className={`student-actions ${mobileMenu ? "student-actions--open" : ""}`}>
            <button aria-pressed={showSaved} className={`saved-toggle ${showSaved ? "saved-toggle--active" : ""}`} onClick={() => { setShowSaved(!showSaved); setMobileMenu(false); }} type="button"><Heart size={16} /> Guardados {favorites.length > 0 && <span className="saved-count">{favorites.length}</span>}</button>
            <Link className="student-logout" onClick={() => logout()} to="/">Salir</Link>
          </div>
        </div>
      </header>
      <section className="explore-toolbar">
        <div className="explore-toolbar__heading">
          <span>
            <Eyebrow icon={MapPin}>ALREDEDORES DEL CAMPUS · ESPOL</Eyebrow>
            <h1>Encuentra tu espacio <span aria-hidden="true">✦</span></h1>
            <p>Precios claros. Arrendadores verificados. Más tranquilidad.</p>
            {enrollmentWeek && <span className="enrollment-banner"><Sparkles size={13} /> Alta demanda · precios de demo +12%</span>}
          </span>
          <div className={`semester-pill ${enrollmentWeek ? "semester-pill--active" : ""}`}><CalendarDays size={15} /><span><small>{enrollmentWeek ? "Semana de matrícula" : "Calendario demo"}</small><strong>{date.toLocaleDateString("es-EC", { day: "numeric", month: "short", year: "numeric" })}</strong></span></div>
        </div>
        <div className="filter-row">
          <label className="search-field"><MapPin size={17} /><input aria-label="Busca por sector o alojamiento" onChange={(event) => setQuery(event.target.value)} placeholder="Sector, calle o alojamiento" value={query} /><SlidersHorizontal size={17} /></label>
          <label className="budget-filter"><span>Presupuesto hasta</span><select aria-label="Presupuesto máximo" onChange={(event) => setMaxPrice(Number(event.target.value))} value={maxPrice}><option value={150}>$150 / mes</option><option value={200}>$200 / mes</option><option value={250}>$250 / mes</option><option value={1000}>Sin límite</option></select><ChevronDown size={14} /></label>
          <div aria-label="Modalidad" className="filter-chips">
            {(["Todos", "Suite", "Cuarto", "Roomie"] as const).map((filter) => (
              <button aria-pressed={category === filter} className={`filter-chip ${category === filter ? "filter-chip--active" : ""}`} key={filter} onClick={() => setCategory(filter)} type="button">{filter}</button>
            ))}
          </div>
        </div>
        <div className="service-filter-row">
          <button aria-pressed={wifiOnly} className={`service-filter ${wifiOnly ? "service-filter--active" : ""}`} onClick={() => setWifiOnly(!wifiOnly)} type="button"><Wifi size={14} /> Wifi disponible <span>{wifiOnly ? <Check size={13} /> : <Plus size={13} />}</span></button>
          {enrollmentWeek && <span className="enrollment-demand"><Sparkles size={12} /> Demanda x{demandMultiplier(calendarDay).toFixed(1)}</span>}
        </div>
      </section>
      <section className="explore-layout">
        <div className="map-column">
          <div className="map-heading"><span><strong>Mapa de alojamientos</strong><small>{visibleListings.length} opciones para ti</small></span><span className="map-heading__source"><MapPin size={14} /> Sectores referenciales</span></div>
          <CampusMap calendarDay={calendarDay} listings={visibleListings} onSelect={setSelected} />
          <div className="map-caption"><span><i className="map-caption__campus" /> ESPOL · garita referencial</span><span>Trayectos referenciales · OSM</span></div>
        </div>
        <div className="results-column">
          <div className="results-heading"><div><strong>{showSaved ? "Tus guardados" : "Alojamientos disponibles"}</strong><span>{visibleListings.length} lugares · datos simulados</span></div><label className="sort-control">Ordenar<select aria-label="Ordenar alojamientos" className="sort-button" onChange={(event) => setSortMode(event.target.value as typeof sortMode)} value={sortMode}><option value="price">Menor precio</option><option value="rating">Mejor calificación</option><option value="distance">Más cerca</option></select></label></div>
          {visibleListings.length > 0 ? (
            <div className="listing-grid">
              {visibleListings.map((listing) => <ListingCard key={listing.id} listing={listing} onOpen={setSelected} />)}
            </div>
          ) : (
            <div className="empty-state"><Home size={28} /><strong>No encontramos alojamientos</strong><p>Prueba otro sector, presupuesto o filtro.</p><button className="button button--outline" onClick={() => { setQuery(""); setCategory("Todos"); setMaxPrice(250); setShowSaved(false); setWifiOnly(false); }} type="button">Limpiar filtros</button></div>
          )}
        </div>
      </section>
      <nav aria-label="Navegación de estudiante" className="student-bottom-nav">
        <button className="bottom-nav__item bottom-nav__item--active" onClick={() => { setShowSaved(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} type="button"><Home size={19} /><span>Explorar</span></button>
        <button className="bottom-nav__item" onClick={() => setShowSaved(true)} type="button"><Heart size={19} /><span>Guardados</span></button>
        <button className="bottom-nav__item" onClick={() => document.getElementById("student-visits")?.scrollIntoView({ behavior: "smooth" })} type="button"><CalendarDays size={19} /><span>Visitas</span></button>
      </nav>
      <VisitCalendar email={email} listings={listings} visits={visits} />
      <footer className="prototype-footer">RoomyCampus · Prototipo académico · Propiedades, reseñas y costos de ejemplo. <Link to="/">Inicio</Link></footer>
      {selected && <PropertyDetails close={() => setSelected(null)} listing={selected} notify={notify} />}
      <Toasts items={toasts} />
    </main>
  );
}

type LandlordSection = "overview" | "properties" | "messages" | "feedback" | "visits";

function LandlordApp() {
  const { email, logout, listings, visits, contactRequests, handleContactRequest } = useDemoStore();
  const [section, setSection] = useState<LandlordSection>("overview");
  const managedListings = listings.filter((listing) => listing.status !== "rejected" && listing.status !== "pending");
  const listingIds = new Set(managedListings.map((listing) => listing.id));
  const messages = contactRequests.filter((request) => listingIds.has(request.listingId));
  const openMessages = messages.filter((request) => request.status === "new");
  const upcomingVisits = visits.filter((visit) => listingIds.has(visit.listingId));
  const pageInfo: Record<LandlordSection, { title: string; description: string }> = {
    overview: { title: "Resumen de alojamientos", description: "Un vistazo a tus propiedades, solicitudes y novedades de residentes." },
    properties: { title: "Mis alojamientos", description: "Consulta el estado y los datos publicados de tu portafolio de demostración." },
    messages: { title: "Mensajes de estudiantes", description: "Responde las consultas recibidas desde las fichas de alojamiento." },
    feedback: { title: "Comentarios y alertas", description: "Lee experiencias y reportes de residentes para dar seguimiento." },
    visits: { title: "Agenda de visitas", description: "Revisa las fechas solicitadas para conocer tus alojamientos." },
  };
  const nav: { id: LandlordSection; label: string; icon: IconType }[] = [
    { id: "overview", label: "Resumen", icon: Home },
    { id: "properties", label: "Mis alojamientos", icon: Building2 },
    { id: "messages", label: "Mensajes", icon: MessageCircle },
    { id: "feedback", label: "Comentarios y alertas", icon: CircleAlert },
    { id: "visits", label: "Visitas", icon: CalendarDays },
  ];

  return (
    <main className="admin-page landlord-page">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand"><Brand /><span>ALOJAMIENTOS</span></div>
        <div className="admin-profile"><span className="admin-profile__avatar">A</span><span><strong>Administrador</strong><small>del alojamiento · demo</small></span><ChevronDown size={15} /></div>
        <span className="sidebar-label">GESTIÓN DEL ALOJAMIENTO</span>
        {nav.map(({ id, label, icon: Icon }) => <button aria-current={section === id ? "page" : undefined} className={`sidebar-link ${section === id ? "sidebar-link--active" : ""}`} key={id} onClick={() => setSection(id)} type="button"><Icon size={17} /> {label}{id === "messages" && openMessages.length > 0 && <span className="sidebar-count">{openMessages.length}</span>}</button>)}
        <div className="sidebar-bottom">
          <div className="integrity-card"><ShieldCheck size={18} /><strong>Atención cercana</strong><span>Las solicitudes y opiniones son datos de demostración compartidos entre pestañas.</span></div>
          <button className="sidebar-link sidebar-logout" onClick={() => logout()} type="button"><ArrowLeft size={16} /> Cerrar sesión</button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar"><div className="breadcrumb">Alojamiento <span>/</span> <strong>{pageInfo[section].title}</strong></div><div className="admin-topbar__right"><span className="admin-live"><i /> Prototipo en vivo</span><span className="admin-topbar__email">{email}</span><span className="admin-avatar">AL</span></div></header>
        <div className="admin-content landlord-content">
          <section className="admin-title-row"><div><Eyebrow icon={Building2}>PANEL DEL ALOJAMIENTO</Eyebrow><h1>{pageInfo[section].title}</h1><p>{pageInfo[section].description}</p></div></section>
          {section === "overview" && <>
            <section aria-label="Resumen del alojamiento" className="metrics-grid">
              <MetricCard icon={Home} label="Alojamientos publicados" value={String(managedListings.length)} note="Inventario de ejemplo" />
              <MetricCard icon={MessageCircle} label="Mensajes pendientes" value={String(openMessages.length)} note="Solicitudes de estudiantes" tone="green" />
              <MetricCard icon={CalendarDays} label="Visitas agendadas" value={String(upcomingVisits.length)} note="Fechas simuladas" tone="amber" />
              <MetricCard icon={CircleAlert} label="Alertas abiertas" value={String(residentAlerts.length)} note="Reportes de residentes" tone="violet" />
            </section>
            <div className="landlord-overview-grid">
              <article className="review-card"><div className="section-heading"><span><Eyebrow icon={MessageCircle}>BANDEJA DE ENTRADA</Eyebrow><h2>Últimas solicitudes</h2></span><button className="text-button" onClick={() => setSection("messages")} type="button">Ver mensajes <ArrowRight size={14} /></button></div>
                {messages.slice(0, 3).map((request) => <ContactRequestCard key={request.id} listings={listings} onHandle={handleContactRequest} request={request} />)}
                {messages.length === 0 && <div className="review-empty"><strong>Aún no hay mensajes</strong><p>Los contactos que envíen los estudiantes aparecerán aquí.</p></div>}
              </article>
              <article className="review-card"><div className="section-heading"><span><Eyebrow icon={CircleAlert}>SEGUIMIENTO</Eyebrow><h2>Alertas recientes</h2></span><button className="text-button" onClick={() => setSection("feedback")} type="button">Ver todas <ArrowRight size={14} /></button></div>
                {residentAlerts.slice(0, 2).map((alert) => <ResidentAlertCard key={alert.id} alert={alert} listings={listings} />)}
              </article>
            </div>
          </>}
          {section === "properties" && <div className="landlord-property-grid">{managedListings.map((listing) => <article className="landlord-property-card" key={listing.id}><img alt="" src={listing.image} /><div><span className={`availability availability--${listing.status}`}>{statusNames[listing.status]}</span><h2>{listing.title}</h2><p>{listing.sector} · {listing.kind} · {listing.area} m²</p><strong>{money(listingTotal(listing))} / mes</strong></div></article>)}</div>}
          {section === "messages" && <section className="review-card landlord-message-list"><div className="section-heading"><span><Eyebrow icon={MessageSquareText}>CONTACTOS</Eyebrow><h2>Solicitudes recibidas</h2></span><span className="review-count">{openMessages.length} nuevas</span></div>{messages.length ? messages.map((request) => <ContactRequestCard key={request.id} listings={listings} onHandle={handleContactRequest} request={request} />) : <div className="review-empty"><strong>No hay solicitudes todavía</strong><p>Cuando un estudiante te contacte, encontrarás el mensaje aquí.</p></div>}</section>}
          {section === "feedback" && <div className="landlord-overview-grid"><section className="review-card"><div className="section-heading"><span><Eyebrow icon={Star}>EXPERIENCIAS</Eyebrow><h2>Comentarios de residentes</h2></span></div>{residentReviews.filter((review) => listingIds.has(review.listingId)).map((review) => <article className="resident-review-card" key={review.id}><div><strong>{review.author}</strong><span><Star fill="currentColor" size={13} /> {review.rating}/5</span></div><p>{review.comment}</p><small>{listings.find((item) => item.id === review.listingId)?.title} · {review.date}</small></article>)}</section><section className="review-card"><div className="section-heading"><span><Eyebrow icon={CircleAlert}>REPORTES</Eyebrow><h2>Alertas para atender</h2></span><span className="review-count">{residentAlerts.length} abiertas</span></div>{residentAlerts.filter((alert) => listingIds.has(alert.listingId)).map((alert) => <ResidentAlertCard alert={alert} key={alert.id} listings={listings} />)}</section></div>}
          {section === "visits" && <VisitCalendar email={email} listingIds={[...listingIds]} listings={listings} visits={upcomingVisits} />}
          <footer className="admin-footer"><span>RoomyCampus · panel académico de demostración; mensajes y comentarios son simulados.</span></footer>
        </div>
      </div>
    </main>
  );
}

function ContactRequestCard({ request, listings, onHandle }: { request: ContactRequest; listings: Listing[]; onHandle: (id: string) => void }) {
  const listing = listings.find((item) => item.id === request.listingId);
  return <article className={`contact-request ${request.status === "handled" ? "contact-request--handled" : ""}`}><div className="contact-request__header"><span><strong>{request.studentEmail}</strong><small>{listing?.title ?? "Alojamiento"} · {new Date(request.createdAt).toLocaleDateString("es-EC")}</small></span><span className="review-label">{request.status === "new" ? "NUEVA" : "ATENDIDA"}</span></div><p>{request.message}</p>{request.status === "new" && <button className="button button--outline" onClick={() => onHandle(request.id)} type="button"><Check size={15} /> Marcar atendida</button>}</article>;
}

function ResidentAlertCard({ alert, listings }: { alert: (typeof residentAlerts)[number]; listings: Listing[] }) {
  return <article className={`resident-alert resident-alert--${alert.severity}`}><span><CircleAlert size={16} /><strong>{alert.title}</strong></span><p>{alert.detail}</p><small>{listings.find((item) => item.id === alert.listingId)?.title} · {alert.date}</small></article>;
}

function AdminCharts({ prices }: { prices: SectorPrice[] }) {
  return (
    <Suspense fallback={<div aria-live="polite" className="analytics-grid"><div className="chart-card chart-loading">Cargando analítica…</div></div>}>
      <LazyAdminCharts prices={prices} />
    </Suspense>
  );
}

function MetricCard({ label, value, note, icon: Icon, tone = "violet" }: { label: string; value: string; note: string; icon: IconType; tone?: "violet" | "green" | "amber" }) {
  return (
    <article className="metric-card">
      <span className={`metric-icon metric-icon--${tone}`}><Icon size={19} /></span>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <span className="metric-note">{note}</span>
    </article>
  );
}

type PlatformSection = "overview" | "monitor" | "verification" | "analytics";

function AdminReviewQueue({ pending, onReview, notify }: { pending: Listing[]; onReview: (id: string) => void; notify: (text: string) => void }) {
  return <article className="review-card">
    <div className="section-heading"><span><Eyebrow icon={ShieldCheck}>ANTI-FRAUDE</Eyebrow><h2>Bandeja de verificación</h2></span><span className="review-count">{pending.length} pendientes</span></div>
    {pending.length === 0 ? (
      <div className="review-empty"><span><Check size={20} /></span><strong>Todo al día</strong><p>No hay propiedades por revisar.</p></div>
    ) : (
      <div className="review-list">
        {pending.map((listing) => (
          <article className={`review-item ${listing.reported ? "review-item--flagged" : ""}`} key={listing.id}>
            <img alt="" src={listing.image} />
            <div className="review-item__body"><div><strong>{listing.title}</strong><span className={listing.reported ? "flag-label" : "review-label"}>{listing.reported ? <><CircleAlert size={12} /> Reportada · revisar con cuidado</> : "NUEVA PROPIEDAD"}</span></div><span>{listing.landlord} · {listing.sector}</span><small>{money(listingTotal(listing))}/mes · identidad pendiente</small></div>
            <button aria-label={`Revisar ${listing.title}`} className="review-open" onClick={() => onReview(listing.id)} type="button"><ArrowRight size={17} /></button>
          </article>
        ))}
      </div>
    )}
    <button className="review-all" onClick={() => pending[0] ? onReview(pending[0].id) : notify("No hay propiedades pendientes de revisión.")} type="button">Revisar propiedades pendientes <ArrowRight size={15} /></button>
  </article>;
}

function AdminMonitoringPanel({ active, availableCount, occupiedCount, onSelect, calendarDay }: { active: Listing[]; availableCount: number; occupiedCount: number; onSelect: (listing: Listing) => void; calendarDay: number }) {
  return <article className="monitor-card">
    <div className="section-heading"><span><Eyebrow icon={MapPin}>OFERTA HABITACIONAL</Eyebrow><h2>Monitoreo por sector</h2></span><button aria-label="Ver propiedad destacada" className="chart-menu-button" onClick={() => active[0] && onSelect(active[0])} type="button"><ArrowUpRight size={17} /></button></div>
    <CampusMap admin calendarDay={calendarDay} listings={active} onSelect={onSelect} />
    <div className="monitor-legend"><span><i className="legend-dot legend-dot--green" /> Disponible</span><span><i className="legend-dot legend-dot--amber" /> En negociación</span><span><i className="legend-dot legend-dot--gray" /> Ocupado</span></div>
    <div className="sector-summary"><span><strong>{availableCount}</strong><small>disponibles</small></span><span><strong>{occupiedCount}</strong><small>ocupadas</small></span><span><strong>{active.filter((item) => item.status === "reserved").length}</strong><small>en negociación</small></span></div>
  </article>;
}

function AdminApp() {
  const { calendarDay, email, listings, fraudReports, logout, setDemoOpen } = useDemoStore();
  const [selected, setSelected] = useState<Listing | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [reviewNote, setReviewNote] = useState<{ id: string; reason: string } | null>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [section, setSection] = useState<PlatformSection>("overview");
  const availableCount = listings.filter((item) => item.status === "available").length;
  const occupiedCount = listings.filter((item) => item.status === "occupied").length;
  const occupancyRate = Math.round((occupiedCount / Math.max(1, listings.filter((item) => item.status !== "rejected").length)) * 100);
  const pending = listings.filter((item) => item.status === "pending");
  const active = listings.filter((item) => ["available", "reserved", "occupied"].includes(item.status));
  const priceByArea = ["Los Ceibos", "Mapasingue", "Vía a la Costa", "Urdesa"].map((sector) => {
    const group = active.filter((listing) => listing.sector === sector).map((listing) => listingPriceBreakdown(listing, calendarDay).total / listing.area).sort((a, b) => a - b);
    const middle = Math.floor(group.length / 2);
    const median = group.length ? group.length % 2 ? group[middle] : (group[middle - 1] + group[middle]) / 2 : 0;
    return { sector: sector === "Vía a la Costa" ? "Vía a Costa" : sector, precio: Number(median.toFixed(2)) };
  });

  function notify(text: string, tone?: ToastMessage["tone"]) {
    const id = ++toastSequence;
    setToasts((items) => [...items, { id, text, tone }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3500);
  }

  function reviewProperty(id: string, decision: "approve" | "reject") {
    useDemoStore.setState((state) => ({
      listings: state.listings.map((item) => item.id === id
        ? { ...item, status: decision === "approve" ? "available" : "rejected", verified: decision === "approve" }
        : item),
      fraudReports: decision === "reject" ? state.fraudReports + 1 : state.fraudReports,
    }));
    setReviewNote(null);
    setReviewing(null);
    notify(decision === "approve" ? "Propiedad aprobada y visible en el mapa." : "Propiedad rechazada y retirada del mapa.", decision === "reject" ? "warning" : undefined);
  }

  function exportCsv() {
    const rows = [
      ["Propiedad", "Sector", "Modalidad", "Estado", "Renta USD", "Agua USD", "Luz USD", "Wifi USD", "Total USD", "m2", "USD por m2"],
      ...active.map((item) => {
        const prices = listingPriceBreakdown(item, calendarDay);
        return [item.title, item.sector, item.kind, statusNames[item.status], prices.rent, prices.water, prices.power, prices.wifi, prices.total, item.area, (prices.total / item.area).toFixed(2)];
      }),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map((field) => `"${String(field).replaceAll('"', '""')}"`).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "roomycampus-indicadores-demo.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Cuadro de mando exportado a CSV.");
  }

  const sectionInfo: Record<PlatformSection, { title: string; eyebrow: string; description: string }> = {
    overview: { title: "Resumen ejecutivo", eyebrow: "CUADRO DE MANDO GERENCIAL", description: "Una vista clara del mercado de alojamiento estudiantil en Guayaquil." },
    monitor: { title: "Monitoreo del mapa", eyebrow: "OFERTA HABITACIONAL", description: "Ubica propiedades activas y compara su disponibilidad por sector." },
    verification: { title: "Verificación de propiedades", eyebrow: "SEGURIDAD Y CONFIANZA", description: "Revisa señales de riesgo y valida cada anuncio antes de publicarlo." },
    analytics: { title: "Analítica del mercado", eyebrow: "TENDENCIAS Y PRECIOS", description: "Interpreta la demanda estacional y el precio mediano por metro cuadrado." },
  };
  const nav: { id: PlatformSection; label: string; icon: IconType }[] = [
    { id: "overview", label: "Resumen", icon: Home },
    { id: "monitor", label: "Monitoreo del mapa", icon: MapPin },
    { id: "verification", label: "Verificación", icon: ShieldCheck },
    { id: "analytics", label: "Analítica", icon: ArrowUpRight },
  ];

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand"><Brand /><span>MANAGEMENT</span></div>
        <div className="admin-profile"><span className="admin-profile__avatar">R</span><span><strong>Administración</strong><small>Plataforma · demo</small></span><ChevronDown size={15} /></div>
        <span className="sidebar-label">ESPACIO DE TRABAJO</span>
        {nav.map(({ id, label, icon: Icon }) => <button aria-current={section === id ? "page" : undefined} className={`sidebar-link ${section === id ? "sidebar-link--active" : ""}`} key={id} onClick={() => { setSection(id); window.scrollTo({ top: 0 }); }} type="button"><Icon size={17} /> {label}{id === "verification" && pending.length > 0 && <span className="sidebar-count">{pending.length}</span>}</button>)}
        <div className="sidebar-bottom">
          <div className="integrity-card"><ShieldCheck size={18} /><strong>Confianza ante todo</strong><span>Revisa identidad, fotos y contrato antes de publicar.</span></div>
          <button className="sidebar-link sidebar-logout" onClick={() => logout()} type="button"><ArrowLeft size={16} /> Cerrar sesión</button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>{sectionInfo[section].title}</strong></div><div className="admin-topbar__right"><span className="admin-live"><i /> Prototipo en vivo</span><span className="admin-topbar__email">{email}</span><button aria-label="Abrir panel de demo" className="admin-avatar" onClick={() => setDemoOpen(true)} type="button">RC</button></div></header>
        <div className="admin-content">
          <section className="admin-title-row"><div><Eyebrow icon={Sparkles}>{sectionInfo[section].eyebrow}</Eyebrow><h1>{section === "overview" ? <>Buenos días, equipo <span>✦</span></> : sectionInfo[section].title}</h1><p>{sectionInfo[section].description}</p></div>{section === "overview" && <button className="button button--outline export-button" onClick={exportCsv} type="button"><ArrowDownToLine size={17} /> Exportar datos <ChevronDown size={14} /></button>}</section>
          {section === "overview" && <>
            <section aria-label="Indicadores clave" className="metrics-grid">
              <MetricCard icon={Home} label="Propiedades disponibles" value={String(availableCount)} note="Inventario de ejemplo" />
              <MetricCard icon={Users} label="Estudiantes activos" value="248" note="Dato sintético del prototipo" tone="green" />
              <MetricCard icon={ArrowUpRight} label="Tasa de ocupación" value={`${occupancyRate}%`} note={`${occupiedCount} ocupadas de ${active.length} publicadas`} tone="amber" />
              <MetricCard icon={ShieldCheck} label="Alertas de fraude" value={String(fraudReports + listings.filter((item) => item.reported && item.status === "pending").length)} note="Revisión manual recomendada" tone="violet" />
            </section>
            <section aria-label="Analítica resumida"><AdminCharts prices={priceByArea} /></section>
            <section className="admin-bottom-grid"><AdminReviewQueue notify={notify} onReview={setReviewing} pending={pending} /><AdminMonitoringPanel active={active} availableCount={availableCount} calendarDay={calendarDay} occupiedCount={occupiedCount} onSelect={setSelected} /></section>
          </>}
          {section === "monitor" && <section className="topic-page"><p className="topic-page__note">Los pines distinguen alojamientos disponibles, en negociación y ocupados. Las ubicaciones son referenciales y los listados del prototipo no constituyen una oferta real.</p><AdminMonitoringPanel active={active} availableCount={availableCount} calendarDay={calendarDay} occupiedCount={occupiedCount} onSelect={setSelected} /></section>}
          {section === "verification" && <section className="topic-page"><p className="topic-page__note">La bandeja reúne anuncios que requieren revisión. En este prototipo, las identidades y evidencias son ficticias: la aprobación y el rechazo solo cambian el estado de demostración.</p><AdminReviewQueue notify={notify} onReview={setReviewing} pending={pending} /></section>}
          {section === "analytics" && <section className="topic-page"><p className="topic-page__note">Las tendencias y medianas se construyen con datos sintéticos. Úsalas para explorar cómo se presentaría un cuadro gerencial; no representan estadísticas oficiales del mercado.</p><AdminCharts prices={priceByArea} /><div className="analytics-explainer"><strong>¿Cómo leer estos indicadores?</strong><p>La estacionalidad compara un índice ilustrativo entre semestre regular y semana de matrícula. El precio por m² usa la mediana de la oferta activa por sector y el calendario puede modificar los valores de ejemplo.</p><button className="button button--outline" onClick={exportCsv} type="button"><ArrowDownToLine size={16} /> Exportar cuadro de datos</button></div></section>}
          <footer className="admin-footer"><span>RoomyCampus · Prototipo académico. Métricas, propiedades y usuarios son sintéticos.</span><button className="text-button" onClick={() => setDemoOpen(true)} type="button">Abrir controles de demo <ArrowRight size={14} /></button></footer>
        </div>
      </div>
      {selected && <Overlay className="admin-listing-dialog" labelledBy="admin-listing-heading" onClose={() => setSelected(null)}><div className="admin-listing-dialog__photo"><img alt="" src={selected.image} /></div><Eyebrow icon={MapPin}>{selected.sector.toUpperCase()} · {statusNames[selected.status]}</Eyebrow><h2 id="admin-listing-heading">{selected.title}</h2><p>{selected.address}</p><div className="admin-listing-stats"><span>Renta <strong>{money(selected.rent)}</strong></span><span>Área <strong>{selected.area} m²</strong></span><span>Total estimado <strong>{money(listingTotal(selected))}/mes</strong></span><span>Arrendador <strong>{selected.landlord}</strong></span></div><p className="fine-print">Ficha de muestra. Coordenadas y trayectos referenciales; confirmar identidad y documentación fuera del prototipo.</p></Overlay>}
      {reviewing && (() => {
        const listing = listings.find((item) => item.id === reviewing);
        if (!listing) return null;
        const isReported = listing.reported;
        return (
          <Overlay className="review-dialog" labelledBy="review-dialog-title" onClose={() => { setReviewing(null); setReviewNote(null); }}>
            <Eyebrow icon={isReported ? CircleAlert : ShieldCheck}>{isReported ? "ALERTA DE POSIBLE FRAUDE" : "REVISIÓN DE NUEVO ALOJAMIENTO"}</Eyebrow>
            <h2 id="review-dialog-title">{listing.title}</h2>
            {isReported && <div className="fraud-alert"><CircleAlert size={18} /><span>{listing.note} No publiques ni solicites anticipos antes de verificar identidad, dirección, fotos y contrato.</span></div>}
            <div className="review-evidence"><img alt="Foto enviada para revisión" src={listing.image} /><div><strong>{listing.landlord}</strong><span>{listing.address}</span><span>{listing.sector} · {listing.area} m² · {money(listingTotal(listing))}/mes</span><small><CircleAlert size={13} /> Fotos e identidad son datos de demostración; no hay documentos reales adjuntos.</small></div></div>
            <div className="checklist"><strong>Lista de revisión sugerida</strong><span><Minus size={15} /> Verificar identidad y titularidad</span><span><Minus size={15} /> Confirmar dirección y ubicación</span><span><Minus size={15} /> Revisar fotos y condiciones del contrato</span></div>
            {reviewNote ? <div className="decision-note"><strong>Rechazo registrado</strong><p>{reviewNote.reason}</p><button className="button button--primary button--full" onClick={() => reviewProperty(reviewNote.id, "reject")} type="button">Confirmar rechazo</button></div> : (
              <div className="review-dialog__actions">
                <button className="button button--outline button--danger" onClick={() => setReviewNote({ id: listing.id, reason: "Propiedad marcada como no verificable y retirada del prototipo." })} type="button">Rechazar publicación</button>
                {!isReported && <button className="button button--primary" onClick={() => reviewProperty(listing.id, "approve")} type="button"><Check size={16} /> Aprobar propiedad</button>}
              </div>
            )}
          </Overlay>
        );
      })()}
      <Toasts items={toasts} />
    </main>
  );
}

function DemoPanel() {
  const { calendarDay, speed, demoOpen, advanceCalendar, setCalendarDay, setSpeed, setDemoOpen, occupyAvailable, injectFraud, approveNext, resetDemo } = useDemoStore();
  const date = new Date(academicStart);
  date.setDate(date.getDate() + calendarDay);
  const enrollmentWeek = calendarDay >= 21 && calendarDay <= 27;
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.shiftKey && event.key.toLowerCase() === "d") {
        event.preventDefault();
        setDemoOpen(!useDemoStore.getState().demoOpen);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setDemoOpen]);

  useEffect(() => {
    if (!new URLSearchParams(location.search).has("guion")) return;
    resetDemo();
    const role: UserRole = location.pathname === "/admin" ? "admin" : location.pathname === "/propietario" ? "landlord" : "student";
    const email = role === "admin" ? "admin@roomycampus.ec" : role === "landlord" ? "alojamiento@roomycampus.ec" : "demo@espol.edu.ec";
    if (useDemoStore.getState().role !== role) {
      useDemoStore.getState().authenticate(email, role);
    }
    const bridge: WindowWithDemo["__ROOMYCAMPUS__"] = {
      getState: useDemoStore.getState,
      actions: {
        reset: resetDemo,
        enrollmentWeek: () => setCalendarDay(21),
        occupyListings: occupyAvailable,
        injectFraud,
        approveNext,
      },
    };
    (window as WindowWithDemo).__ROOMYCAMPUS__ = bridge;
    return () => { delete (window as WindowWithDemo).__ROOMYCAMPUS__; };
  }, [approveNext, injectFraud, location.pathname, location.search, occupyAvailable, resetDemo, setCalendarDay]);

  if (!demoOpen) return <button aria-label="Abrir controles de demo" className="demo-fab" onClick={() => setDemoOpen(true)} type="button"><Sparkles size={17} /> Demo <kbd>⇧D</kbd></button>;

  return (
    <aside aria-label="Controles de demostración" className={`demo-panel ${collapsed ? "demo-panel--collapsed" : ""}`}>
      <header className="demo-panel__header"><span><Sparkles size={17} /> Controles de demo</span><div><button aria-label={collapsed ? "Expandir panel" : "Contraer panel"} className="demo-close" onClick={() => setCollapsed(!collapsed)} type="button">{collapsed ? <Plus size={17} /> : <Minus size={17} />}</button><button aria-label="Cerrar controles" className="demo-close" onClick={() => setDemoOpen(false)} type="button"><X size={17} /></button></div></header>
      {!collapsed && (
        <div className="demo-panel__body">
          <span className="demo-date-label"><CalendarDays size={15} /> Calendario académico virtual</span>
          <div className="demo-date"><span>{date.toLocaleDateString("es-EC", { day: "numeric", month: "long", year: "numeric" })}</span><strong className={enrollmentWeek ? "demo-enrollment" : ""}>{enrollmentWeek ? "Semana de matrícula" : "Semestre regular"}</strong></div>
          <div className="demo-control-row"><span>Velocidad</span><div className="speed-controls">{([1, 3, 10] as const).map((rate) => <button aria-pressed={speed === rate} className={speed === rate ? "speed-active" : ""} key={rate} onClick={() => setSpeed(rate)} type="button">×{rate}</button>)}</div></div>
          <button className="demo-action" onClick={advanceCalendar} type="button"><ArrowRight size={16} /> Avanzar {speed} día{speed > 1 ? "s" : ""}</button>
          <button className="demo-action" onClick={() => setCalendarDay(21)} type="button"><CalendarDays size={16} /> Ir a semana de matrícula</button>
          <div className="demo-divider" />
          <span className="demo-date-label">ESCENARIOS EN VIVO</span>
          <button className="demo-action" onClick={occupyAvailable} type="button"><Home size={16} /> Ocupar 3 propiedades</button>
          <button className="demo-action" onClick={injectFraud} type="button"><CircleAlert size={16} /> Inyectar anuncio sospechoso</button>
          <button className="demo-action" onClick={approveNext} type="button"><BadgeCheck size={16} /> Aprobar siguiente pendiente</button>
          <button className="demo-action demo-action--reset" onClick={resetDemo} type="button"><X size={16} /> Reiniciar datos de demo</button>
          <p className="demo-panel__hint"><KeyRound size={13} /> Atajo del teclado: <kbd>Shift</kbd> + <kbd>D</kbd></p>
        </div>
      )}
    </aside>
  );
}

function App() {
  const role = useDemoStore((state) => state.role);
  return (
    <>
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={role === "student" ? <StudentApp /> : <LoginPage role="student" />} path="/app" />
        <Route element={role === "admin" ? <AdminApp /> : <LoginPage role="admin" />} path="/admin" />
        <Route element={<LoginPage role="student" signup />} path="/registro" />
        <Route element={role === "landlord" ? <LandlordApp /> : <LoginPage role="landlord" />} path="/propietario" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
      <DemoPanel />
    </>
  );
}

export default App;
