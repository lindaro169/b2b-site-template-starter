import { siteConfig } from './site-config';

/**
 * Get crystal image by name
 */
export function getCrystalImage() {
  return {
    url: siteConfig.productPlaceholder,
    alt: 'Template material placeholder',
  };
}
