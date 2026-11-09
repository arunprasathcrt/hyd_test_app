/**
 * "Active right now" panel — live carts across the rep's book.
 *
 * Prototype markup (DTX `ActiveCarts/ActiveCarts.tsx`), which expressed this
 * panel as Tailwind utilities rather than CSS:
 *
 *   <div className="relative box-border w-full overflow-hidden rounded-3xl
 *                   border border-[#ECECEE] bg-white p-8 mt-6 mb-8
 *                   text-[#111113] max-sm:px-[18px] max-sm:py-[22px]">
 *     <div className="mb-6 flex flex-wrap items-center justify-between gap-[14px]">
 *       <div>
 *         <div className="… text-[11px] uppercase tracking-[0.14em] text-[#8E8E93]">
 *           <span className="size-[6px] shrink-0 rounded-full bg-[#C9A227]" />
 *           Active right now
 *         </div>
 *         <div className="text-[22px] … text-[#111113] tabular-nums">
 *           No carts active
 *         </div>
 *       </div>
 *     </div>
 *     <div className="… rounded-xl border border-dashed border-[#DDDDDD] …">
 *       <div className="… size-9 … rounded-[10px] bg-[#F0F0F0] …"> bell svg </div>
 *       <div>
 *         <div>All your accounts are quiet right now.</div>
 *         <div>We'll notify you when someone starts an order.</div>
 *       </div>
 *     </div>
 *   </div>
 *
 * Those utilities carried six hard-coded hexes. They are transcribed into
 * `styles/accounts.css` against the UTDS tokens, at identical computed values
 * (Tailwind's `p-8` → 32px, `rounded-3xl` → 24px, `size-9` → 36px, and so on);
 * the class names here name the same boxes. The four labels moved verbatim
 * into `locales/en/accounts.json`.
 *
 * The prototype's bell was a raw inline `<svg>`; it is the `notifications`
 * glyph from the prototype's own icon map, so it is rendered through
 * `PrototypeIcon` at the same 18px.
 *
 * ❓ TO CONFIRM — only the empty state is built. The prototype shipped
 * `.ac-card*` styles for populated cart cards but no JSX for them, and the
 * read path is unresolved: an active B2B cart is Storefront/Admin cart state
 * that has no Company association at MVP. Until that is settled this panel
 * renders the quiet state unconditionally rather than polling for carts.
 */
import {useTranslation} from 'react-i18next';
import {PrototypeIcon} from '~/shared/components/PrototypeIcon';

export function ActiveCarts() {
  const {t} = useTranslation('accounts');

  return (
    <div className="active-carts">
      <div className="active-carts-head">
        <div>
          <div className="active-carts-eyebrow">
            <span className="active-carts-livedot" />
            {t('activeCarts.eyebrow')}
          </div>

          <div className="active-carts-count">
            {t('activeCarts.empty.count')}
          </div>
        </div>
      </div>

      <div className="active-carts-empty">
        <div className="active-carts-empty-icon">
          <PrototypeIcon name="notifications" size={18} />
        </div>

        {/* `active-carts-empty-title` / `-message` had no rules in the
            prototype, so both inherited the 13px grey of the wrapper. Kept
            unstyled to match. */}
        <div>
          <div className="active-carts-empty-title">
            {t('activeCarts.empty.title')}
          </div>
          <div className="active-carts-empty-message">
            {t('activeCarts.empty.message')}
          </div>
        </div>
      </div>
    </div>
  );
}
