import { useEffect, useRef } from 'react';

/**
 * Ajoute la classe « est-visible » quand l'élément entre à l'écran.
 * Un seul IntersectionObserver par élément, débranché après la première fois :
 * aucune animation qui rejoue, aucun coût pendant le défilement.
 */
export function useRevele<T extends HTMLElement = HTMLDivElement>(options?: {
  seuil?: number;
  auCroisement?: () => void;
}) {
  const ref = useRef<T>(null);
  const rappel = useRef(options?.auCroisement);
  rappel.current = options?.auCroisement;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      element.classList.add('est-visible');
      rappel.current?.();
      return;
    }

    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          if (!entree.isIntersecting) continue;
          element.classList.add('est-visible');
          rappel.current?.();
          observateur.disconnect();
        }
      },
      { threshold: options?.seuil ?? 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    observateur.observe(element);
    return () => observateur.disconnect();
  }, [options?.seuil]);

  return ref;
}
