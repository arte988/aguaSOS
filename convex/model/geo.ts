const RADIO_TIERRA_KM = 6371;

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const dLat = aRadianes(b.lat - a.lat);
  const dLng = aRadianes(b.lng - a.lng);
  const senLat = Math.sin(dLat / 2);
  const senLng = Math.sin(dLng / 2);
  const h =
    senLat * senLat +
    Math.cos(aRadianes(a.lat)) * Math.cos(aRadianes(b.lat)) * senLng * senLng;
  return 2 * RADIO_TIERRA_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Caja en grados alrededor de un punto. 1° lat ≈ 111 km. */
export function cajaAlrededor(
  lat: number,
  lng: number,
  radioKm: number,
): { sur: number; norte: number; oeste: number; este: number } {
  const degLat = radioKm / 111;
  const cos = Math.max(Math.cos(aRadianes(lat)), 0.2);
  const degLng = radioKm / (111 * cos);
  return {
    sur: lat - degLat,
    norte: lat + degLat,
    oeste: lng - degLng,
    este: lng + degLng,
  };
}

function aRadianes(grados: number): number {
  return (grados * Math.PI) / 180;
}
