/**
 * Static imports of every locale JSON.
 *
 * Resources are bundled, never fetched: `i18next-http-backend` is banned
 * because a translation fetch at the edge is an extra round trip on every cold
 * start.
 *
 * Adding a locale means adding a folder under `app/locales/<lng>/` that mirrors
 * `en/` exactly — same files, same keys — and adding it here and to
 * `SUPPORTED_LOCALES`.
 */
import type {Resource} from 'i18next';
import enCommon from '~/locales/en/common.json';
import enAuth from '~/locales/en/auth.json';
import enAccounts from '~/locales/en/accounts.json';
import enErrors from '~/locales/en/errors.json';
import enEnums from '~/locales/en/enums.json';
import enFinance from '~/locales/en/finance.json';
import enOrders from '~/locales/en/orders.json';
import enInvoice from '~/locales/en/invoice.json';
import enProductCardDrawer from '~/locales/en/productCardDrawer.json';
import enProducts from '~/locales/en/products.json';
import enDraftOrders from '~/locales/en/draftOrders.json';
import enArtDesign from "~/locales/en/artDesign.json";
import enPresentations from '~/locales/en/presentations.json';
import enNewDraftOrder from '~/locales/en/newDraftOrder.json';

export const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    accounts: enAccounts,
    errors: enErrors,
    enums: enEnums,
    finance: enFinance,
    orders: enOrders,
    invoice: enInvoice,
    productCardDrawer: enProductCardDrawer,
    products: enProducts,
    draftOrders : enDraftOrders,
    draftOrdersListing: enDraftOrders,
    artDesign: enArtDesign,
    presentations: enPresentations,
    newDraftOrder: enNewDraftOrder,
  },
} satisfies Resource;

export type AppResources = typeof resources;
