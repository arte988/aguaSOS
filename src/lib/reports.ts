export const EMERGENCY_TYPES = [
  { id: "sin_servicio", label: "Sin servicio de agua" },
  { id: "fuga", label: "Fuga o tubería rota" },
  { id: "baja_presion", label: "Baja presión" },
  { id: "agua_contaminada", label: "Agua contaminada o con mal olor" },
  { id: "otro", label: "Otra emergencia" },
] as const;

export type EmergencyType = (typeof EMERGENCY_TYPES)[number]["id"];
export type ReportStatus = "recibido" | "en_revision" | "atendido";

export type WaterReport = {
  id: string;
  code: string;
  type: EmergencyType;
  name: string;
  phone: string;
  municipality: string;
  neighborhood: string;
  address: string;
  description: string;
  peopleAffected: number;
  createdAt: string;
  status: ReportStatus;
};

const STORAGE_KEY = "aguasos-reports";

export const STATUS_LABEL: Record<ReportStatus, string> = {
  recibido: "Recibido",
  en_revision: "En revisión",
  atendido: "Atendido",
};

export function emergencyLabel(type: EmergencyType) {
  return EMERGENCY_TYPES.find((item) => item.id === type)?.label ?? type;
}

export function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `SOS-${suffix}`;
}

export const SEED_ALERTS: WaterReport[] = [
  {
    id: "seed-1",
    code: "SOS-DEMO",
    type: "sin_servicio",
    name: "Comunidad Las Palmas",
    phone: "",
    municipality: "San Salvador",
    neighborhood: "Las Palmas",
    address: "Varios sectores",
    description: "Corte de agua desde la madrugada. Varias manzanas sin servicio.",
    peopleAffected: 120,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    status: "en_revision",
  },
  {
    id: "seed-2",
    code: "SOS-FUGA",
    type: "fuga",
    name: "Colonia El Roble",
    phone: "",
    municipality: "Santa Tecla",
    neighborhood: "El Roble",
    address: "Calle principal, frente al parque",
    description: "Fuga visible en la vía pública. El agua está corriendo hacia la calle.",
    peopleAffected: 40,
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    status: "recibido",
  },
];

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getStoredReports(): WaterReport[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WaterReport[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveReport(report: WaterReport) {
  const reports = [report, ...getStoredReports()];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  return report;
}

export function getAllReports(): WaterReport[] {
  return [...getStoredReports(), ...SEED_ALERTS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function findReport(code: string) {
  const normalized = code.trim().toUpperCase();
  return getAllReports().find((report) => report.code.toUpperCase() === normalized);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}
