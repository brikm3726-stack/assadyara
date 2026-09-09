import { useEffect, useState } from 'react';
import { BandeauConfiance } from './components/BandeauConfiance';
import { Commande } from './components/Commande';
import { CtaFlottant } from './components/CtaFlottant';
import { Hero } from './components/Hero';
import { LesParfums } from './components/LesParfums';
import { Offres } from './components/Offres';
import { PiedDePage } from './components/PiedDePage';
import { OFFRES, type CleOffre, type CleParfum } from './lib/config';
import { initPixel, suivre, suivreUneFois } from './lib/pixel';

/**
 * Une seule page, un seul objectif : transformer la visite en commande.
 * Parcours : photo → offre → formulaire → confirmation.
 */
export function App() {
  /* L'offre « les deux flacons » est sélectionnée par défaut : c'est l'offre
     principale, et celle qui fait le meilleur panier. */
  const [offre, setOffre] = useState<CleOffre>('pack');
  const [parfum, setParfum] = useState<CleParfum | null>(null);
  const [parfumManquant, setParfumManquant] = useState(false);
  const [commandeFaite, setCommandeFaite] = useState(false);

  useEffect(() => {
    initPixel();
  }, []);

  const choisirOffre = (nouvelle: CleOffre) => {
    setOffre(nouvelle);
    if (nouvelle === 'pack') setParfumManquant(false);
    suivre('ViewContent', {
      content_name: OFFRES[nouvelle].sousTitre,
      content_type: 'product',
      currency: 'DZD',
      value: OFFRES[nouvelle].prix,
    });
  };

  const choisirParfum = (choix: CleParfum) => {
    setParfum(choix);
    setParfumManquant(false);
  };

  /** Le formulaire réclame un parfum : on ramène l'acheteur au bon endroit. */
  const signalerParfumManquant = () => {
    setParfumManquant(true);
    const bloc = document.getElementById('choix-parfum') ?? document.getElementById('offres');
    bloc?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.querySelector<HTMLInputElement>('input[name="parfum"]')?.focus({ preventScroll: true });
  };

  const versLeFormulaire = () => suivreUneFois('InitiateCheckout', { currency: 'DZD' });

  return (
    <>
      <Hero auClicCommander={versLeFormulaire} />
      <BandeauConfiance />
      <LesParfums />

      <Offres
        offre={offre}
        choisirOffre={choisirOffre}
        parfum={parfum}
        choisirParfum={choisirParfum}
        parfumManquant={parfumManquant}
      />

      <Commande
        offre={offre}
        parfum={parfum}
        parfumManquant={signalerParfumManquant}
        auSucces={() => setCommandeFaite(true)}
      />

      <PiedDePage />

      <CtaFlottant offre={offre} actif={!commandeFaite} auClic={versLeFormulaire} />

      {/* Marge basse pour que le CTA collant ne masque jamais le pied de page. */}
      <div aria-hidden className="h-24 lg:hidden" />
    </>
  );
}
