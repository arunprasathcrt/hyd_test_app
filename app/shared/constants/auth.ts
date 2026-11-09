/**
 * Roles, tags and gated actions.
 *
 * Ported from the V63 prototype's role/tag permission model:
 *
 *   /* AGA-V20 — role / tag permission model. One dashboard for the whole team;
 *      tags gate what you can DO, never what you can see. *\/
 *   window.agCan = function(action){
 *     var r = agRole();
 *     if (r === 'superadmin' || agHasTag('superadmin')) return true;
 *     if (r === 'admin' || agHasTag('admin')) return true;
 *     switch(action){
 *       case 'licensing.decide': return agHasTag('licensing');
 *       case 'art.decide':       return agHasTag('art') || agHasTag('creative')
 *                                       || r === 'art' || r === 'creative';
 *       case 'finance.edit':     return agHasTag('finance') || r === 'finance';
 *       case 'sales.act':        return r === 'rep';
 *       default: return true; // everyone may view + use general tools
 *     }
 *   };
 *
 * 🔧 NOT CURRENTLY ENFORCED. `guards.server.ts` and `tags.server.ts` were
 * removed along with the Entra flow, so nothing reads the tag axes below — the
 * app authenticates against the Shopify customer-account session and performs
 * no role check. The model is kept here because it is a faithful port of the
 * prototype's permission table and is what the guards must be rebuilt against.
 *
 * When they are rebuilt: the prototype's permissive `default: return true` must
 * NOT be ported — CLAUDE.md auth rule 6 requires that an action outside the
 * defined list denies.
 *
 * Served via: ❓ TO CONFIRM — the Entra `groups` claim was the source; with
 * Entra removed, where a role tag comes from is an open decision.
 */

/**
 * Role axis. `agRoleLabel` in the prototype enumerates the same set:
 * `{rep:'Sales', art:'Art Production', creative:'Art Production',
 *   licensing:'Licensing', customer:'Customer', admin:'Admin',
 *   superadmin:'Super Admin'}`, plus the `finance` role used by
 * `agCan('finance.edit')`.
 *
 * Labels are NOT stored here — they live in `locales/<lng>/enums.json` keyed by
 * code (`enums.roleTag.<code>`), so the code stays the data value.
 */
export const ROLE_TAGS = [
  'rep',
  'art',
  'creative',
  'licensing',
  'finance',
  'customer',
  'admin',
  'superadmin',
] as const;

export type RoleTag = (typeof ROLE_TAGS)[number];

/**
 * User-type axis — internal (Entra-authenticated staff) vs external (customer
 * contacts, who reach the app through tokenized email links at MVP).
 */
export const USER_TYPE_TAGS = ['internal', 'external'] as const;

export type UserTypeTag = (typeof USER_TYPE_TAGS)[number];

/**
 * The full set of gated actions. `requireScope` denies anything not listed
 * here — there is no permissive default.
 *
 * ❓ TO CONFIRM — these four are every action the V63 prototype gates on
 * (`agCan(...)` call sites: `finance.edit`, `licensing.decide`, plus
 * `art.decide` and `sales.act` defined in the switch). The developer docs'
 * permission model may define more; extend this list rather than passing a
 * string that is not in it.
 */
export const AUTH_SCOPES = [
  'licensing.decide',
  'art.decide',
  'finance.edit',
  'sales.act',
] as const;

export type AuthScope = (typeof AUTH_SCOPES)[number];

export function isRoleTag(value: string): value is RoleTag {
  return (ROLE_TAGS as readonly string[]).includes(value);
}

export function isUserTypeTag(value: string): value is UserTypeTag {
  return (USER_TYPE_TAGS as readonly string[]).includes(value);
}

export function isAuthScope(value: string): value is AuthScope {
  return (AUTH_SCOPES as readonly string[]).includes(value);
}

/**
 * Application-owned session keys. Cookie keys are not user-facing text, so they
 * stay inline values — but they are centralised so nothing writing the cookie
 * can drift.
 *
 * The auth keys (`auth:user`, `auth:entraTokens`, `auth:entraTokensExpireAt`,
 * `auth:pending`) are gone with the Entra flow. Authentication state now lives
 * under the Customer Account client's own key in the same cookie, which
 * Hydrogen owns — do not add a key here that mirrors it.
 */
export const SESSION_KEYS = {
  locale: 'i18n:locale',
} as const;
