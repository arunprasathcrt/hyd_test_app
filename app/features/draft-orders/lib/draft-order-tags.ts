import {
  DRAFT_ORDER_BRAND_TAG_PREFIX,
  DRAFT_ORDER_TAG,
} from '~/shared/constants/draft-order-tags';

/**
 * Builds the tag list for a draft. Brand tags are replaced by the brands
 * selected now; every other existing tag is kept as it is.
 */
export function buildDraftOrderTags(existingTags: string[], brands: string[]): string[] {
  const keptTags = existingTags.filter(
    (tag) => tag !== DRAFT_ORDER_TAG && !tag.startsWith(DRAFT_ORDER_BRAND_TAG_PREFIX),
  );

  return [
    DRAFT_ORDER_TAG,
    ...brands.map((brand) => `${DRAFT_ORDER_BRAND_TAG_PREFIX}${brand}`),
    ...keptTags,
  ];
}
