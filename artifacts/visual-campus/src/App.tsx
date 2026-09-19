import { type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Accessibility,
  BusFront,
  ChevronDown,
  CircleHelp,
  Compass,
  DoorOpen,
  Footprints,
  Layers3,
  LocateFixed,
  MapPin,
  Menu,
  Minus,
  Navigation,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import {
  getGetCampusSummaryQueryKey,
  getHealthCheckQueryKey,
  getListBuildingsQueryKey,
  getListPlaceStatusesQueryKey,
  getSearchPlacesQueryKey,
  type Building,
  type CampusPlace,
  type PlaceStatus,
  useBuildRoute,
  useGetCampusSummary,
  useHealthCheck,
  useListBuildings,
  useListPlaceStatuses,
  useSearchPlaces,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

const fallbackBuildings: Building[] = [
  { id: 'library', code: 'LIB', name: 'North Library', floors: 4, accent: '#e8a44a', position: { x: 29, y: 29 } },
  { id: 'science', code: 'SCI', name: 'Science Centre', floors: 3, accent: '#3f9690', position: { x: 61, y: 22 } },
  { id: 'arts', code: 'ART', name: 'Arts Quad', floors: 2, accent: '#c66a62', position: { x: 26, y: 66 } },
  { id: 'student', code: 'STU', name: 'Student Union', floors: 3, accent: '#7f88ba', position: { x: 69, y: 67 } },
  { id: 'engineering', code: 'ENG', name: 'Engineering Hall', floors: 5, accent: '#4c9c73', position: { x: 83, y: 42 } },
];

const fallbackPlaces: CampusPlace[] = [
  { id: 'reading-room', name: 'Silent Reading Room', type: 'Study space', buildingId: 'library', floor: 2, nodeId: 'lib-2-reading', accessible: true, x: 28, y: 25, capacity: 120, details: 'Large south-facing tables, power at every seat.' },
  { id: 'cafe', name: 'Juniper Café', type: 'Food & drink', buildingId: 'student', floor: 1, nodeId: 'stu-1-cafe', accessible: true, x: 67, y: 63, capacity: 86, details: 'Hot meals until 17:30. Quiet seating on the mezzanine.' },
  { id: 'lecture-a', name: 'Lecture Theatre A', type: 'Teaching', buildingId: 'science', floor: 1, nodeId: 'sci-1-a', accessible: true, x: 59, y: 18, capacity: 220, details: 'Wide entrance on the east side. Hearing loop installed.' },
  { id: 'makerspace', name: 'The Makerspace', type: 'Workshop', buildingId: 'engineering', floor: 2, nodeId: 'eng-2-maker', accessible: false, x: 82, y: 39, capacity: 48, details: 'Induction required. Shared workshop benches.' },
  { id: 'gallery', name: 'West Gallery', type: 'Exhibition', buildingId: 'arts', floor: 1, nodeId: 'art-1-gallery', accessible: true, x: 25, y: 62, capacity: 72, details: 'Current exhibition: Lines of Departure.' },
];

const fallbackStatuses: PlaceStatus[] = [
  { placeId: 'reading-room', current: 73, capacity: 120, status: 'moderate', updatedAt: new Date().toISOString() },
  { placeId: 'cafe', current: 51, capacity: 86, status: 'moderate', updatedAt: new Date().toISOString() },
  { placeId: 'lecture-a', current: 196, capacity: 220, status: 'busy', updatedAt: new Date().toISOString() },
  { placeId: 'makerspace', current: 12, capacity: 48, status: 'available', updatedAt: new Date().toISOString() },
  { placeId: 'gallery', current: 18, capacity: 72, status: 'available', updatedAt: new Date().toISOString() },
];

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function LogoMark() {
  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[13px] bg-[#e9aa50] text-[#193744] shadow-[0_6px_20px_rgba(233,170,80,.24)]" aria-label="Visual Campus">
      <span className="absolute -right-1 -top-2 h-5 w-5 rounded-full border-2 border-[#193744]/70" />
      <span className="absolute bottom-1.5 left-2 h-3.5 w-3.5 rounded-full border-2 border-[#193744]/70" />
      <span className="relative z-10 font-display text-sm font-bold tracking-[-.12em]">VC</span>
    </div>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="noise-overlay min-h-[100dvh] bg-[#edf4f2] text-[#193744]">
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-[246px] flex-col bg-[#193744] px-5 py-6 text-[#dceae7] transition-transform duration-300 md:translate-x-0',
        menuOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        <div className="flex items-center gap-3 px-1">
          <LogoMark />
          <div>
            <div className="font-display text-[15px] font-bold tracking-[-.03em] text-[#f4f7ef]">Visual Campus</div>
            <div className="font-mono text-[9px] uppercase tracking-[.16em] text-[#87aaa9]">Spatial intelligence</div>
          </div>
          <button className="ml-auto rounded-lg p-1 text-[#87aaa9] md:hidden" onClick={() => setMenuOpen(false)} aria-label="Close navigation" data-testid="button-close-navigation">
            <X size={17} />
          </button>
        </div>
        <div className="mt-12 px-1 font-mono text-[9px] uppercase tracking-[.18em] text-[#789b9d]">Workspace</div>
        <nav className="mt-3 space-y-1">
          <a href="/" className="group flex items-center gap-3 rounded-xl bg-[#2a4b54] px-3 py-3 text-sm font-semibold text-[#f4f7ef] shadow-inner shadow-white/[.03]" data-testid="link-campus-map">
            <Compass size={17} className="text-[#e9aa50]" />
            Campus map
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#63c4af]" />
          </a>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#9ab8b7] transition hover:bg-[#25454e] hover:text-white" data-testid="button-saved-places" onClick={() => window.alert('Saved places will appear here as you pin them.')}>
            <MapPin size={17} />
            Saved places
            <span className="ml-auto font-mono text-[10px] text-[#64898b]">soon</span>
          </button>
        </nav>
        <div className="mt-10 px-1 font-mono text-[9px] uppercase tracking-[.18em] text-[#789b9d]">Quick layers</div>
        <div className="mt-3 space-y-1">
          {[
            ['Live occupancy', <Users size={17} />, 'on'],
            ['Accessible routes', <Accessibility size={17} />, 'on'],
            ['Transit & entrances', <BusFront size={17} />, 'off'],
          ].map(([label, icon, state]) => (
            <button key={String(label)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#9ab8b7] transition hover:bg-[#25454e]" onClick={() => window.alert(`${label} layer toggled`)} data-testid={`button-layer-${String(label).toLowerCase().replaceAll(' ', '-')}`}>
              {icon}
              {label}
              <span className={cn('ml-auto h-1.5 w-1.5 rounded-full', state === 'on' ? 'bg-[#63c4af]' : 'bg-[#628386]')} />
            </button>
          ))}
        </div>
        <div className="mt-auto rounded-2xl border border-[#43626a] bg-[#21424b] p-3.5">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#d9ede7]"><ShieldCheck size={15} className="text-[#63c4af]" /> Built for finding your way</div>
          <p className="mt-2 text-[11px] leading-relaxed text-[#8eacad]">Every route is checked for lifts, ramps and step-free entrances.</p>
        </div>
        <button className="mt-4 flex items-center gap-3 px-2 py-2 text-left text-xs text-[#91adae] transition hover:text-white" onClick={() => window.alert('Help centre is opening soon.')} data-testid="button-help">
          <CircleHelp size={16} /> Help & feedback
        </button>
      </aside>
      <div className="md:pl-[246px]">
        <header className="flex h-[76px] items-center justify-between border-b border-[#d7e5e2] bg-[#edf4f2]/90 px-5 backdrop-blur-xl md:px-10">
          <button className="rounded-xl p-2 text-[#31565f] md:hidden" onClick={() => setMenuOpen(true)} aria-label="Open navigation" data-testid="button-open-navigation"><Menu size={20} /></button>
          <div className="hidden items-center gap-2 text-[11px] text-[#5a777c] md:flex"><span className="h-2 w-2 rounded-full bg-[#63c4af]" /> Campus live <span className="text-[#a3b8b5]">/</span> Main map</div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[#d7e5e2] bg-[#f7fbf8] px-3 py-2 text-[11px] text-[#5a777c] sm:flex"><span className="font-mono text-[10px] text-[#193744]">M</span> Search anywhere</div>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d7e8e4] font-display text-xs font-bold text-[#28535b] transition hover:bg-[#c6dfd9]" onClick={() => window.alert('Profile settings are coming soon.')} aria-label="Open profile" data-testid="button-profile">AV</button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    available: 'bg-[#d7efe5] text-[#26705d]',
    moderate: 'bg-[#fff0d4] text-[#956425]',
    busy: 'bg-[#f8dfd9] text-[#a64c42]',
    closed: 'bg-[#e7e9e8] text-[#677779]',
  };
  return <span className={cn('rounded-full px-2 py-1 font-mono text-[9px] uppercase tracking-[.1em]', styles[status] || styles.moderate)}>{status}</span>;
}

function LoadingPanel({ label }: { label: string }) {
  return <div className="flex items-center gap-3 rounded-2xl border border-[#d7e5e2] bg-[#f8fcf9] p-4 text-xs text-[#789092]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#54b4a2]" /> Loading {label}…</div>;
}

function EmptyPanel({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-[#c5d7d4] bg-[#f6fbf8] p-7 text-center text-xs text-[#6e888a]">No {label} match this view.</div>;
}

function CampusMap({
  buildings,
  places,
  selectedBuilding,
  selectedPlace,
  activeFloor,
  routeActive,
  onBuilding,
  onPlace,
  onLocate,
}: {
  buildings: Building[];
  places: CampusPlace[];
  selectedBuilding: string | null;
  selectedPlace: CampusPlace | null;
  activeFloor: number | 'all';
  routeActive: boolean;
  onBuilding: (building: Building) => void;
  onPlace: (place: CampusPlace) => void;
  onLocate: () => void;
}) {
  const mapBuildings = buildings.length ? buildings : fallbackBuildings;
  const visiblePlaces = places.filter((place) => activeFloor === 'all' || place.floor === activeFloor);
  return (
    <div className="map-grid relative min-h-[540px] flex-1 overflow-hidden rounded-[22px] border border-[#c6d9d5] shadow-[0_18px_55px_rgba(33,73,77,.10)] md:min-h-[640px]">
      <div className="map-drift absolute inset-[-8%] opacity-60">
        <svg viewBox="0 0 1000 700" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
          <path d="M35 92 C220 145 250 25 410 91 S675 164 965 88" fill="none" stroke="#9ac3bd" strokeWidth="24" opacity=".38" />
          <path d="M35 92 C220 145 250 25 410 91 S675 164 965 88" fill="none" stroke="#eef7f1" strokeWidth="11" opacity=".8" />
          <path d="M44 624 C190 560 320 642 450 560 S720 495 954 590" fill="none" stroke="#9ac3bd" strokeWidth="20" opacity=".32" />
          <path d="M44 624 C190 560 320 642 450 560 S720 495 954 590" fill="none" stroke="#edf6f0" strokeWidth="8" opacity=".85" />
          <path d="M720 -20 C665 130 745 250 660 370 S680 590 618 730" fill="none" stroke="#a5c5ba" strokeWidth="14" opacity=".3" />
          <path d="M108 30 C166 180 85 302 160 440 S130 610 194 734" fill="none" stroke="#aacabe" strokeWidth="10" opacity=".3" />
          <path d="M0 350 H1000 M370 0 V700" stroke="#8eb8b1" strokeWidth="2" strokeDasharray="10 18" opacity=".22" />
          <path d="M180 0 L290 700 M0 495 L1000 230" stroke="#a5c6be" strokeWidth="2" strokeDasharray="4 14" opacity=".25" />
        </svg>
      </div>
      <div className="absolute left-5 top-5 z-10 rounded-xl border border-white/70 bg-[#eef7f1]/90 px-3 py-2 shadow-sm backdrop-blur"><div className="font-mono text-[9px] uppercase tracking-[.16em] text-[#487175]">North campus</div><div className="mt-0.5 text-[11px] font-semibold text-[#234852]">Live spatial view</div></div>
      <div className="absolute right-5 top-5 z-10 flex flex-col overflow-hidden rounded-xl border border-[#c7dbd7] bg-[#eff8f3]/90 shadow-sm backdrop-blur">
        <button className="p-2.5 text-[#3b6267] transition hover:bg-white" onClick={() => window.alert('Zoomed in')} aria-label="Zoom in" data-testid="button-map-zoom-in"><Plus size={16} /></button>
        <div className="h-px bg-[#c7dbd7]" />
        <button className="p-2.5 text-[#3b6267] transition hover:bg-white" onClick={() => window.alert('Zoomed out')} aria-label="Zoom out" data-testid="button-map-zoom-out"><Minus size={16} /></button>
        <div className="h-px bg-[#c7dbd7]" />
        <button className="p-2.5 text-[#3b6267] transition hover:bg-white" onClick={onLocate} aria-label="Locate me" data-testid="button-map-locate"><LocateFixed size={16} /></button>
      </div>
      <div className="absolute bottom-5 left-5 z-10 flex items-center gap-3 rounded-xl border border-white/70 bg-[#eff8f3]/90 px-3 py-2 text-[10px] text-[#527174] shadow-sm backdrop-blur">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#54b4a2]" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#e9aa50]" /> Moderate</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#cb756b]" /> Busy</span>
      </div>
      {routeActive && (
        <svg className="pointer-events-none absolute inset-0 z-[2] h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Active route">
          <path className="route-line" d="M23 77 C36 72 40 57 45 48 C53 32 69 40 82 37" fill="none" stroke="#247e78" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="3 2" />
          <circle cx="23" cy="77" r="1.7" fill="#e9aa50" stroke="#f6fbf8" strokeWidth=".7" />
          <circle cx="82" cy="37" r="1.7" fill="#247e78" stroke="#f6fbf8" strokeWidth=".7" />
        </svg>
      )}
      <div className="absolute inset-0 z-[3]">
        {mapBuildings.map((building) => {
          const isSelected = selectedBuilding === building.id;
          return (
            <button key={building.id} onClick={() => onBuilding(building)} className="group absolute -translate-x-1/2 -translate-y-1/2 text-left transition duration-300 hover:scale-105" style={{ left: `${building.position.x}%`, top: `${building.position.y}%` }} data-testid={`button-building-${building.id}`}>
              <span className={cn('block rounded-[10px] border-2 px-3 py-2 shadow-[0_8px_20px_rgba(44,83,83,.14)] transition', isSelected ? 'scale-110 border-[#193744] bg-[#f9fcf6]' : 'border-white/80 bg-[#eef7f1]/90 group-hover:border-[#4c8f88]')} style={{ borderLeftColor: building.accent }}>
                <span className="block font-mono text-[9px] font-medium tracking-[.14em] text-[#5c7e81]">{building.code}</span>
                <span className="mt-0.5 block whitespace-nowrap text-[11px] font-bold text-[#294c54]">{building.name}</span>
              </span>
              <span className={cn('mx-auto mt-1 block h-2.5 w-2.5 rounded-full border-2 border-[#f3faf5] transition', isSelected ? 'scale-125 bg-[#193744]' : 'bg-[#63b6a3]')} />
            </button>
          );
        })}
        {visiblePlaces.map((place) => {
          const active = selectedPlace?.id === place.id;
          return (
            <button key={place.id} className={cn('absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#f1faf4] shadow-md transition hover:scale-150', active ? 'z-10 scale-150 bg-[#193744]' : 'bg-[#4c9f91]')} style={{ left: `${place.x}%`, top: `${place.y}%` }} onClick={() => onPlace(place)} aria-label={`View ${place.name}`} data-testid={`button-place-${place.id}`}>
              <span className="sr-only">{place.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CampusWorkspace() {
  const [search, setSearch] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [activeFloor, setActiveFloor] = useState<number | 'all'>('all');
  const [selectedPlace, setSelectedPlace] = useState<CampusPlace | null>(null);
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const [routeStart, setRouteStart] = useState('main-gate');
  const [routeOpen, setRouteOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [locateFlash, setLocateFlash] = useState(false);

  const summaryQuery = useGetCampusSummary({ query: { queryKey: getGetCampusSummaryQueryKey() } });
  const buildingsQuery = useListBuildings({ query: { queryKey: getListBuildingsQueryKey() } });
  const searchParams = useMemo(() => ({
    q: search.trim() || undefined,
    buildingId: selectedBuilding || undefined,
    floor: typeof activeFloor === 'number' ? activeFloor : undefined,
  }), [search, selectedBuilding, activeFloor]);
  const placesQuery = useSearchPlaces(searchParams, { query: { queryKey: getSearchPlacesQueryKey(searchParams) } });
  const statusesQuery = useListPlaceStatuses({ query: { queryKey: getListPlaceStatusesQueryKey() } });
  const healthQuery = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), refetchInterval: 60000 } });
  const routeMutation = useBuildRoute();

  const buildings = buildingsQuery.data?.length ? buildingsQuery.data : fallbackBuildings;
  const apiPlaces = placesQuery.data?.length ? placesQuery.data : fallbackPlaces;
  const places = apiPlaces.filter((place) => !accessibleOnly || place.accessible);
  const statuses = statusesQuery.data?.length ? statusesQuery.data : fallbackStatuses;
  const campusSummary = summaryQuery.data || { buildings: 12, rooms: 284, activeEvents: 7, liveZones: 18 };
  const activeBuilding = buildings.find((building) => building.id === selectedBuilding) || null;
  const activeStatus = selectedPlace ? statuses.find((status) => status.placeId === selectedPlace.id) : null;
  const currentPlace = selectedPlace || places[0] || fallbackPlaces[0];
  const routeDestination = currentPlace;
  const routeResponse = routeMutation.data;
  const floorCount = activeBuilding?.floors || 4;

  const selectBuilding = (building: Building) => {
    setSelectedBuilding(building.id);
    setActiveFloor('all');
    setSelectedPlace(null);
  };

  const buildRoute = () => {
    if (!routeDestination) return;
    setRouteOpen(true);
    routeMutation.mutate({
      data: {
        startNodeId: routeStart,
        destinationNodeId: routeDestination.nodeId,
        accessibleOnly,
      },
    });
  };

  const locate = () => {
    setLocateFlash(true);
    window.setTimeout(() => setLocateFlash(false), 1400);
  };

  return (
    <main className="px-4 pb-8 pt-5 md:px-10 md:pt-8">
      <div className="mx-auto max-w-[1500px]">
        <section className="mb-6 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.2em] text-[#4e8582]"><span className="h-1.5 w-1.5 rounded-full bg-[#54b4a2]" /> Tuesday, 14 May · 10:42</div>
            <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3.3rem)] font-semibold leading-[.98] tracking-[-.06em] text-[#193744]">Find your place<br className="hidden sm:block" /> on campus.</h1>
            <p className="mt-3 max-w-[510px] text-sm leading-relaxed text-[#678285]">A live map for getting around, settling in, and knowing what is happening now.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#5f7a7d]">
            <span className={cn('flex items-center gap-2 rounded-full border px-3 py-2', healthQuery.isError ? 'border-[#edc4bc] bg-[#fff1ed] text-[#a64c42]' : 'border-[#c9e1da] bg-[#e5f4ee] text-[#287362]')} data-testid="status-api-health"><span className={cn('h-1.5 w-1.5 rounded-full', healthQuery.isError ? 'bg-[#c96a5d]' : 'bg-[#54b4a2]')} /> {healthQuery.isError ? 'Live data reconnecting' : 'Live data connected'}</span>
            <span className="hidden rounded-full border border-[#d7e5e2] bg-[#f8fcf9] px-3 py-2 sm:inline-flex" data-testid="text-last-updated">Updated 2 min ago</span>
          </div>
        </section>

        <section className="relative z-20 mb-5 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex min-h-[50px] flex-1 items-center rounded-2xl border border-[#c7dbd7] bg-[#f7fbf8] shadow-[0_8px_28px_rgba(46,91,89,.06)] transition focus-within:border-[#6aa99f] focus-within:shadow-[0_8px_30px_rgba(46,135,123,.12)]">
            <Search size={18} className="ml-4 text-[#4c817e]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} onFocus={() => setMobileSearchOpen(true)} className="w-full bg-transparent px-3 py-3 text-sm text-[#234852] outline-none placeholder:text-[#8aa09f]" placeholder="Search buildings, rooms, services or places…" aria-label="Search campus" data-testid="input-search-campus" />
            {search && <button className="mr-3 rounded-full p-1 text-[#719092] hover:bg-[#e3efeb]" onClick={() => setSearch('')} aria-label="Clear search" data-testid="button-clear-search"><X size={15} /></button>}
            {mobileSearchOpen && search && (
              <div className="absolute left-0 right-0 top-[56px] rounded-2xl border border-[#c7dbd7] bg-[#f7fbf8] p-2 shadow-[0_18px_45px_rgba(33,73,77,.14)]">
                {places.slice(0, 4).map((place) => <button key={place.id} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-[#e8f2ee]" onClick={() => { setSelectedPlace(place); setSearch(place.name); setMobileSearchOpen(false); }} data-testid={`button-search-result-${place.id}`}><MapPin size={15} className="text-[#4c9f91]" /><span className="text-xs font-semibold text-[#294c54]">{place.name}</span><span className="ml-auto text-[10px] text-[#7d9695]">{place.type}</span></button>)}
                {places.length === 0 && <EmptyPanel label="places" />}
              </div>
            )}
          </div>
          <button className="flex min-h-[50px] items-center justify-center gap-2 rounded-2xl border border-[#c7dbd7] bg-[#f7fbf8] px-5 text-xs font-semibold text-[#42676c] transition hover:-translate-y-0.5 hover:border-[#82aaa2] lg:w-[180px]" onClick={() => setAccessibleOnly(!accessibleOnly)} data-testid="button-toggle-accessibility"><Accessibility size={17} className={accessibleOnly ? 'text-[#247e78]' : 'text-[#789495]'} /> {accessibleOnly ? 'Accessible places' : 'All places'} <span className={cn('ml-auto h-2 w-2 rounded-full', accessibleOnly ? 'bg-[#54b4a2]' : 'bg-[#c0cfcc]')} /></button>
          <button className="flex min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-[#193744] px-5 text-xs font-bold text-[#eff8f3] transition hover:-translate-y-0.5 hover:bg-[#285663] lg:w-[148px]" onClick={() => setRouteOpen(!routeOpen)} data-testid="button-toggle-route"><Navigation size={16} /> {routeOpen ? 'Hide route' : 'Plan a route'}</button>
        </section>
        {placesQuery.isPending && <div className="mb-4"><LoadingPanel label="campus places" /></div>}
        {placesQuery.isError && <div className="mb-4 flex items-center justify-between rounded-2xl border border-[#edc4bc] bg-[#fff2ee] px-4 py-3 text-xs text-[#9b554c]" data-testid="status-places-error"><span>Live place search is unavailable. Showing the last known campus map.</span><button className="font-semibold underline underline-offset-2" onClick={() => placesQuery.refetch()} data-testid="button-retry-places">Retry</button></div>}

        <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Buildings', campusSummary.buildings, 'on campus'],
            ['Rooms', campusSummary.rooms, 'mapped spaces'],
            ['Happening now', campusSummary.activeEvents, 'active events'],
            ['Live zones', campusSummary.liveZones, 'occupancy signals'],
          ].map(([label, value, detail], index) => (
            <div key={String(label)} className="group rounded-2xl border border-[#d4e2df] bg-[#f7fbf8] p-4 transition hover:-translate-y-0.5 hover:border-[#a8c8c1]" data-testid={`card-summary-${String(label).toLowerCase().replaceAll(' ', '-')}`}>
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[.13em] text-[#789294]"><span>{label}</span><span className={cn('h-1.5 w-1.5 rounded-full', index === 2 ? 'bg-[#e9aa50]' : 'bg-[#69b7a5]')} /></div>
              <div className="mt-2 font-display text-2xl font-semibold tracking-[-.04em] text-[#234852]">{value}</div>
              <div className="mt-1 text-[10px] text-[#8a9e9d]">{detail}</div>
            </div>
          ))}
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
          <section className="min-w-0">
            <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-base font-bold tracking-[-.02em] text-[#234852]">Campus map</h2>
                <span className="font-mono text-[10px] uppercase tracking-[.13em] text-[#8aa09f]">1 : 4200</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button className={cn('shrink-0 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.1em] transition', selectedBuilding === null ? 'bg-[#193744] text-[#eaf5ef]' : 'bg-[#dbe9e6] text-[#5e7c7e] hover:bg-[#cbdeda]')} onClick={() => { setSelectedBuilding(null); setActiveFloor('all'); }} data-testid="button-filter-all-buildings">All campus</button>
                {buildings.slice(0, 4).map((building) => <button key={building.id} className={cn('shrink-0 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.1em] transition', selectedBuilding === building.id ? 'bg-[#193744] text-[#eaf5ef]' : 'bg-[#dbe9e6] text-[#5e7c7e] hover:bg-[#cbdeda]')} onClick={() => selectBuilding(building)} data-testid={`button-filter-building-${building.id}`}>{building.code}</button>)}
              </div>
            </div>
            <div className={cn('relative flex', locateFlash && 'rise-in')}>
              <CampusMap buildings={buildings} places={places} selectedBuilding={selectedBuilding} selectedPlace={selectedPlace} activeFloor={activeFloor} routeActive={routeOpen && !!routeResponse} onBuilding={selectBuilding} onPlace={(place) => { setSelectedPlace(place); setRouteOpen(false); }} onLocate={locate} />
              {locateFlash && <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#193744] px-4 py-2 text-xs font-semibold text-[#eef8f3] shadow-xl">Location centred</div>}
            </div>
            <div className="mt-3 flex items-center gap-2 overflow-x-auto rounded-2xl border border-[#d4e2df] bg-[#f7fbf8] p-2">
              <div className="shrink-0 px-2 font-mono text-[9px] uppercase tracking-[.15em] text-[#809697]">Floor</div>
              <button className={cn('rounded-xl px-3 py-2 text-xs font-semibold transition', activeFloor === 'all' ? 'bg-[#d9ece5] text-[#24736a]' : 'text-[#698587] hover:bg-[#e8f2ee]')} onClick={() => setActiveFloor('all')} data-testid="button-floor-all">All</button>
              {Array.from({ length: floorCount }, (_, index) => index + 1).map((floor) => <button key={floor} className={cn('rounded-xl px-3 py-2 text-xs font-semibold transition', activeFloor === floor ? 'bg-[#d9ece5] text-[#24736a]' : 'text-[#698587] hover:bg-[#e8f2ee]')} onClick={() => setActiveFloor(floor)} data-testid={`button-floor-${floor}`}>L{floor}</button>)}
              <span className="ml-auto hidden items-center gap-1.5 px-2 text-[10px] text-[#809697] sm:flex"><Layers3 size={14} /> {activeFloor === 'all' ? 'Layered view' : `Level ${activeFloor} detail`}</span>
            </div>
          </section>

          <aside className="space-y-4">
            {selectedPlace ? (
              <div className="rise-in overflow-hidden rounded-[22px] border border-[#c6dbd6] bg-[#f7fbf8] shadow-[0_12px_35px_rgba(38,90,85,.08)]">
                <div className="relative h-24 overflow-hidden bg-[#285e63] p-4">
                  <div className="absolute -right-6 -top-10 h-32 w-32 rounded-full border-[18px] border-[#63b9a5]/30" /><div className="absolute right-8 top-6 h-12 w-12 rounded-full border-[8px] border-[#e9aa50]/50" />
                  <div className="relative z-10 flex items-start justify-between"><div><div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#a8d3c8]">{selectedPlace.type} · L{selectedPlace.floor}</div><h3 className="mt-1 font-display text-lg font-bold tracking-[-.04em] text-[#f3f8ef]">{selectedPlace.name}</h3></div><button onClick={() => setSelectedPlace(null)} className="rounded-full p-1.5 text-[#b3d3cd] hover:bg-white/10" aria-label="Close place details" data-testid="button-close-place"><X size={16} /></button></div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between"><StatusPill status={activeStatus?.status || 'available'} /><span className="font-mono text-[10px] text-[#779191]">{activeStatus?.current ?? selectedPlace.capacity ?? 0} / {activeStatus?.capacity ?? selectedPlace.capacity ?? '—'} here now</span></div>
                  <p className="mt-3 text-xs leading-relaxed text-[#658082]">{selectedPlace.details || 'A mapped campus place with current access and occupancy information.'}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center gap-2 rounded-xl bg-[#193744] px-3 py-3 text-xs font-bold text-[#eef7f1] transition hover:bg-[#285663]" onClick={buildRoute} data-testid="button-route-to-place"><Navigation size={14} /> Route here</button>
                    <button className="flex items-center justify-center gap-2 rounded-xl border border-[#c8dcda] px-3 py-3 text-xs font-semibold text-[#4f7074] transition hover:bg-[#e9f2ef]" onClick={() => window.alert(`${selectedPlace.name} saved to your places.`)} data-testid="button-save-place"><MapPin size={14} /> Save place</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[22px] border border-[#c6dbd6] bg-[#193744] p-5 text-[#edf7f2] shadow-[0_12px_35px_rgba(38,90,85,.12)]">
                <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.18em] text-[#80c2b2]"><Sparkles size={13} /> Start exploring</div>
                <h3 className="mt-3 max-w-[230px] font-display text-xl font-semibold leading-tight tracking-[-.04em]">Tap a place on the map to see it come alive.</h3>
                <p className="mt-3 text-xs leading-relaxed text-[#9ebcba]">Occupancy, access notes and an exact route — all in one view.</p>
                <button className="mt-5 flex items-center gap-2 rounded-xl bg-[#e9aa50] px-3.5 py-2.5 text-xs font-bold text-[#193744] transition hover:bg-[#f2ba69]" onClick={() => setSelectedPlace(currentPlace)} data-testid="button-show-featured-place"><MapPin size={14} /> Show a nearby place</button>
              </div>
            )}

            {routeOpen && (
              <div className="rise-in rounded-[22px] border border-[#c6dbd6] bg-[#f7fbf8] p-5 shadow-[0_12px_35px_rgba(38,90,85,.07)]">
                <div className="flex items-center justify-between"><div><div className="font-mono text-[9px] uppercase tracking-[.16em] text-[#6f8b8d]">Route planner</div><h3 className="mt-1 font-display text-base font-bold tracking-[-.02em] text-[#234852]">How do you want to travel?</h3></div><button onClick={() => setRouteOpen(false)} className="rounded-full p-1 text-[#7d9696] hover:bg-[#e6f0ed]" aria-label="Close route planner" data-testid="button-close-route"><X size={15} /></button></div>
                <div className="mt-4 space-y-2">
                  <label className="block text-[10px] font-semibold uppercase tracking-[.12em] text-[#799294]">Starting point</label>
                  <div className="relative"><select value={routeStart} onChange={(event) => setRouteStart(event.target.value)} className="w-full appearance-none rounded-xl border border-[#cbdedb] bg-[#eef6f2] px-3 py-3 text-xs text-[#315a61] outline-none focus:border-[#63a99d]" data-testid="select-route-start"><option value="main-gate">Main gate</option><option value="south-gate">South gate</option><option value="student-hub">Student hub</option></select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-3.5 text-[#789495]" /></div>
                  <div className="flex items-center gap-2 rounded-xl bg-[#e8f2ed] px-3 py-2.5 text-[11px] text-[#587579]"><Footprints size={15} className="text-[#398d81]" /> Destination: <strong className="text-[#315a61]">{routeDestination?.name || 'Select a place'}</strong></div>
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#247e78] py-3 text-xs font-bold text-white transition hover:bg-[#1e6e69] disabled:cursor-not-allowed disabled:opacity-60" onClick={buildRoute} disabled={!routeDestination || routeMutation.isPending} data-testid="button-build-route"><Navigation size={14} /> {routeMutation.isPending ? 'Finding the clearest way…' : 'Build route'}</button>
                </div>
                {routeMutation.isError && <div className="mt-3 rounded-xl bg-[#fff0eb] p-3 text-[11px] leading-relaxed text-[#a65349]" data-testid="status-route-error">The route service is taking a moment. Try again or choose another starting point.</div>}
                {routeResponse && !routeMutation.isPending && <div className="mt-4 border-t border-[#d7e5e2] pt-4" data-testid="panel-route-response"><div className="flex items-end justify-between"><div><div className="font-display text-2xl font-bold tracking-[-.05em] text-[#234852]">{routeResponse.durationMinutes} min</div><div className="text-[10px] text-[#779091]">{routeResponse.distanceMeters} m · {routeResponse.floors.length} floor change{routeResponse.floors.length === 1 ? '' : 's'}</div></div><span className="rounded-full bg-[#d7efe5] px-2 py-1 font-mono text-[9px] uppercase text-[#26705d]">{routeResponse.accessible ? 'Step-free' : 'Standard'}</span></div><div className="mt-3 space-y-3">{routeResponse.steps.slice(0, 3).map((step, index) => <div key={`${step.label}-${index}`} className="flex gap-3 text-[11px]"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dcece6] font-mono text-[9px] text-[#347e76]">{index + 1}</span><div><strong className="font-semibold text-[#456b70]">{step.label}</strong><p className="mt-0.5 text-[#819796]">{step.detail}</p></div></div>)}</div></div>}
              </div>
            )}

            <div className="rounded-[22px] border border-[#d4e2df] bg-[#f7fbf8] p-5">
              <div className="flex items-center justify-between"><div><div className="font-mono text-[9px] uppercase tracking-[.16em] text-[#789294]">Right now</div><h3 className="mt-1 font-display text-base font-bold tracking-[-.02em] text-[#234852]">Popular places</h3></div><button className="text-[10px] font-semibold text-[#37857c] hover:text-[#193744]" onClick={() => setSearch('')} data-testid="button-refresh-places">View all</button></div>
              <div className="mt-4 space-y-1">
                {places.slice(0, 4).map((place) => {
                  const status = statuses.find((item) => item.placeId === place.id);
                  return <button key={place.id} className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-[#eaf3ef]" onClick={() => { setSelectedPlace(place); setRouteOpen(false); }} data-testid={`row-popular-place-${place.id}`}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#dcece6] text-[#39887e] transition group-hover:bg-[#cce3da]">{place.type === 'Food & drink' ? <Sparkles size={15} /> : place.type === 'Teaching' ? <DoorOpen size={15} /> : <MapPin size={15} />}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-[#3e6268]">{place.name}</span><span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[.08em] text-[#8aa09f]">{place.type} · L{place.floor}</span></span><StatusPill status={status?.status || 'available'} /></button>;
                })}
                {places.length === 0 && <EmptyPanel label="popular places" />}
              </div>
            </div>
          </aside>
        </div>
        <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-[#d4e2df] pt-4 text-[10px] text-[#819796] sm:flex-row"><span>Visual Campus · Northbridge University</span><span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#54b4a2]" /> {healthQuery.isError ? 'Some live services are offline' : 'All campus systems operational'} <span className="font-mono text-[#9db0ae]">v0.9.4</span></span></footer>
      </div>
    </main>
  );
}

function Router() {
  return (
    <ErrorBoundary resetKey={useLocation()[0]}>
      <AppShell>
        <Switch>
          <Route path="/" component={CampusWorkspace} />
          <Route component={NotFound} />
        </Switch>
      </AppShell>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;