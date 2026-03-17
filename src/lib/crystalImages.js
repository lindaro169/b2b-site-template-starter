import { siteConfig } from './site-config';

export const crystalImages = {
  'Rose Quartz': {
    url: siteConfig.productPlaceholder,
    alt: 'Mock crystal placeholder',
  },
  'Amethyst': {
    url: siteConfig.productPlaceholder,
    alt: 'Mock crystal placeholder',
  },
  'Citrine': {
    url: siteConfig.productPlaceholder,
    alt: 'Mock crystal placeholder',
  },
  'Clear Quartz': {
    url: siteConfig.productPlaceholder,
    alt: 'Mock crystal placeholder',
  },
  'Green Ghost Crystal': {
    url: siteConfig.productPlaceholder,
    alt: 'Mock crystal placeholder',
  },
  'Black Tourmaline': {
    url: siteConfig.productPlaceholder,
    alt: 'Mock crystal placeholder',
  },
};

/**
 * Get crystal image by name
 */
export function getCrystalImage(crystalName) {
  return crystalImages[crystalName] || {
    url: siteConfig.productPlaceholder,
    alt: 'Mock crystal placeholder',
  };
}
