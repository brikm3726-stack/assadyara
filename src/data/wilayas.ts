/**
 * Les 58 wilayas d'Algérie (découpage administratif actuel).
 * Le nom latin sert uniquement à la recherche : beaucoup d'acheteurs tapent
 * « alger » ou « setif » au clavier latin de leur téléphone.
 */
export type Wilaya = { code: string; nom: string; latin: string };

export const WILAYAS: Wilaya[] = [
  { code: '01', nom: 'أدرار', latin: 'Adrar' },
  { code: '02', nom: 'الشلف', latin: 'Chlef' },
  { code: '03', nom: 'الأغواط', latin: 'Laghouat' },
  { code: '04', nom: 'أم البواقي', latin: 'Oum El Bouaghi' },
  { code: '05', nom: 'باتنة', latin: 'Batna' },
  { code: '06', nom: 'بجاية', latin: 'Bejaia' },
  { code: '07', nom: 'بسكرة', latin: 'Biskra' },
  { code: '08', nom: 'بشار', latin: 'Bechar' },
  { code: '09', nom: 'البليدة', latin: 'Blida' },
  { code: '10', nom: 'البويرة', latin: 'Bouira' },
  { code: '11', nom: 'تمنراست', latin: 'Tamanrasset' },
  { code: '12', nom: 'تبسة', latin: 'Tebessa' },
  { code: '13', nom: 'تلمسان', latin: 'Tlemcen' },
  { code: '14', nom: 'تيارت', latin: 'Tiaret' },
  { code: '15', nom: 'تيزي وزو', latin: 'Tizi Ouzou' },
  { code: '16', nom: 'الجزائر', latin: 'Alger' },
  { code: '17', nom: 'الجلفة', latin: 'Djelfa' },
  { code: '18', nom: 'جيجل', latin: 'Jijel' },
  { code: '19', nom: 'سطيف', latin: 'Setif' },
  { code: '20', nom: 'سعيدة', latin: 'Saida' },
  { code: '21', nom: 'سكيكدة', latin: 'Skikda' },
  { code: '22', nom: 'سيدي بلعباس', latin: 'Sidi Bel Abbes' },
  { code: '23', nom: 'عنابة', latin: 'Annaba' },
  { code: '24', nom: 'قالمة', latin: 'Guelma' },
  { code: '25', nom: 'قسنطينة', latin: 'Constantine' },
  { code: '26', nom: 'المدية', latin: 'Medea' },
  { code: '27', nom: 'مستغانم', latin: 'Mostaganem' },
  { code: '28', nom: 'المسيلة', latin: "M'Sila" },
  { code: '29', nom: 'معسكر', latin: 'Mascara' },
  { code: '30', nom: 'ورقلة', latin: 'Ouargla' },
  { code: '31', nom: 'وهران', latin: 'Oran' },
  { code: '32', nom: 'البيض', latin: 'El Bayadh' },
  { code: '33', nom: 'إليزي', latin: 'Illizi' },
  { code: '34', nom: 'برج بوعريريج', latin: 'Bordj Bou Arreridj' },
  { code: '35', nom: 'بومرداس', latin: 'Boumerdes' },
  { code: '36', nom: 'الطارف', latin: 'El Tarf' },
  { code: '37', nom: 'تندوف', latin: 'Tindouf' },
  { code: '38', nom: 'تيسمسيلت', latin: 'Tissemsilt' },
  { code: '39', nom: 'الوادي', latin: 'El Oued' },
  { code: '40', nom: 'خنشلة', latin: 'Khenchela' },
  { code: '41', nom: 'سوق أهراس', latin: 'Souk Ahras' },
  { code: '42', nom: 'تيبازة', latin: 'Tipaza' },
  { code: '43', nom: 'ميلة', latin: 'Mila' },
  { code: '44', nom: 'عين الدفلى', latin: 'Ain Defla' },
  { code: '45', nom: 'النعامة', latin: 'Naama' },
  { code: '46', nom: 'عين تموشنت', latin: 'Ain Temouchent' },
  { code: '47', nom: 'غرداية', latin: 'Ghardaia' },
  { code: '48', nom: 'غليزان', latin: 'Relizane' },
  { code: '49', nom: 'تيميمون', latin: 'Timimoun' },
  { code: '50', nom: 'برج باجي مختار', latin: 'Bordj Badji Mokhtar' },
  { code: '51', nom: 'أولاد جلال', latin: 'Ouled Djellal' },
  { code: '52', nom: 'بني عباس', latin: 'Beni Abbes' },
  { code: '53', nom: 'عين صالح', latin: 'In Salah' },
  { code: '54', nom: 'عين قزام', latin: 'In Guezzam' },
  { code: '55', nom: 'تقرت', latin: 'Touggourt' },
  { code: '56', nom: 'جانت', latin: 'Djanet' },
  { code: '57', nom: 'المغير', latin: "El M'Ghair" },
  { code: '58', nom: 'المنيعة', latin: 'El Meniaa' },
];

/**
 * Normalise une saisie pour la recherche : accents latins, harakat, hamza et
 * tatweel retires, variantes de lettres unifiees. Ainsi « الجزاير » trouve
 * « الجزائر », « setif » et « setif » trouvent « سطيف ».
 */
export function normaliserArabe(texte: string): string {
  return texte
    .normalize('NFKD')
    .replace(/[\u0300-\u036f\u0640\u064b-\u0655\u0670]/g, '')
    .replace(/\u0649/g, '\u064a') // ى -> ي
    .replace(/\u0629/g, '\u0647') // ة -> ه
    .replace(/[\s'`’-]/g, '')
    .toLowerCase();
}
