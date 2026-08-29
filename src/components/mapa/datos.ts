"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { applyCartographyFilters } from "./logica";
import { DEMO_COLLECTIONS } from "./fixtures";
import {
  EMPTY_COLLECTIONS,
  type BoundingBox,
  type CartographyDataQuery,
  type CartographyDataResult,
  type CartographyDataSource,
  type CartographyDataState,
  type DateRange,
} from "./tipos";

/**
 * Single replacement seam for the eventual reactive Convex queries.
 *
 * ponytail: fixtures keep the UI demonstrable until Convex publishes its three
 * GeoJSON queries; the layer interfaces do not need a second data path.
 */
export const cartographyDataSource: CartographyDataSource = {
  origin: "fixture",
  get(query: CartographyDataQuery): CartographyDataResult {
    return {
      collections: applyCartographyFilters(DEMO_COLLECTIONS, query),
      origin: "fixture",
      status: "success",
    };
  },
};

const EMPTY_COLLECTIONS_RESULT: CartographyDataResult = {
  status: "success",
  origin: "fixture",
  collections: EMPTY_COLLECTIONS,
};

function esPromesa<T>(value: T | Promise<T>): value is Promise<T> {
  return (
    value !== null &&
    typeof value === "object" &&
    "then" in value &&
    typeof (value as Promise<T>).then === "function"
  );
}

/**
 * A tiny external store so query state lives outside React's render cycle:
 * the loading frame is emitted for already-subscribed consumers and never set
 * synchronously from an effect. This is the same shape a reactive Convex
 * source would implement at the seam.
 */
class CartographyStore {
  private snapshot: CartographyDataState = EMPTY_COLLECTIONS_RESULT;
  private listeners = new Set<() => void>();
  private counter = 0;

  getSnapshot() {
    return this.snapshot;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  begin({ origin }: { origin: CartographyDataSource["origin"] }) {
    this.counter += 1;
    const generation = this.counter;
    this.snapshot = { status: "loading", origin, collections: EMPTY_COLLECTIONS };
    this.notify();
    return generation;
  }

  resolve(generation: number, result: CartographyDataResult) {
    if (generation !== this.counter) return;
    this.snapshot = result;
    this.notify();
  }

  /** Evita un frame de “Cargando…” cuando la fuente responde en el mismo tick. */
  adopt(result: CartographyDataResult) {
    this.snapshot = result;
    this.notify();
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export function useCartographyData({
  bbox,
  dateRange,
  source = cartographyDataSource,
}: {
  bbox: BoundingBox;
  dateRange?: DateRange;
  source?: CartographyDataSource;
}): CartographyDataState {
  const [store] = useState(() => new CartographyStore());
  const { west, south, east, north } = bbox;
  const from = dateRange?.from;
  const to = dateRange?.to;

  useEffect(() => {
    const query: CartographyDataQuery = {
      bbox: { west, south, east, north },
      ...(from && to ? { dateRange: { from, to } } : {}),
    };

    const outcome = source.get(query);
    if (!esPromesa(outcome)) {
      store.adopt(outcome);
      return;
    }

    const generation = store.begin({ origin: source.origin });
    outcome.then(
      (resolved) => {
        store.resolve(generation, resolved);
      },
      (reason: unknown) => {
        store.resolve(generation, {
          status: "error",
          origin: source.origin,
          collections: EMPTY_COLLECTIONS,
          error: reason instanceof Error ? reason.message : "No se pudieron cargar los datos del mapa.",
        });
      },
    );
  }, [east, from, north, south, source, store, to, west]);

  return useSyncExternalStore(
    store.subscribe.bind(store),
    store.getSnapshot.bind(store),
    () => EMPTY_COLLECTIONS_RESULT,
  );
}
