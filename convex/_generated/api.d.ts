/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as catalogo_zonasCatalogo from "../catalogo/zonasCatalogo.js";
import type * as health from "../health.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_literals from "../lib/literals.js";
import type * as usuarios from "../usuarios.js";
import type * as zonas from "../zonas.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "catalogo/zonasCatalogo": typeof catalogo_zonasCatalogo;
  health: typeof health;
  "lib/auth": typeof lib_auth;
  "lib/literals": typeof lib_literals;
  usuarios: typeof usuarios;
  zonas: typeof zonas;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
