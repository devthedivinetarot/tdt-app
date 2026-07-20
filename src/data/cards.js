// Sample deck for the Home "Cards Ka Message" section.
// Uses the same reliable, cached card art as the reading engine.
import { cardImage } from './tarot';

const img = (name) => cardImage(name);

// The 3 sample cards shown on the website home ("Cards Ka Message"), exact copy.
export const SAMPLE = [
  {
    id: 'the-fool',
    name: 'The Fool',
    emoji: '🌟',
    image: img('The Fool'),
    message:
      "This card reveals a deep emotional crossroads. You're beginning a new journey, but uncertainty clouds the first step. The universe is nudging you to trust despite the fear.",
  },
  {
    id: 'the-lovers',
    name: 'The Lovers',
    emoji: '💞',
    image: img('The Lovers'),
    message:
      "There's a powerful connection energizing your situation. This isn't just about romance — it's about aligning with what (or who) truly resonates with your soul.",
  },
  {
    id: 'the-star',
    name: 'The Star',
    emoji: '✨',
    image: img('The Star'),
    message:
      'Hope and healing are on the horizon. After recent challenges, clarity and renewed faith are appearing. The universe is restoring your belief in brighter days ahead.',
  },
];

export const DECK = [
  ...SAMPLE,
  { id: 'the-moon', name: 'The Moon', emoji: '🌙', image: img('The Moon'), message: 'Hidden emotions and intuition rise to the surface. Trust what you feel even when the path is not fully lit.' },
  { id: 'the-sun', name: 'The Sun', emoji: '☀️', image: img('The Sun'), message: 'Joy, success and clarity. A bright answer is forming — warmth is returning to your situation.' },
  { id: 'the-empress', name: 'The Empress', emoji: '🌷', image: img('The Empress'), message: 'Abundance and nurturing energy. Something you have cared for is about to bloom.' },
  { id: 'strength', name: 'Strength', emoji: '🦁', image: img('Strength'), message: 'Quiet inner power. You have more resilience than you realize — lead with a calm, steady heart.' },
  { id: 'wheel-of-fortune', name: 'Wheel of Fortune', emoji: '🎡', image: img('Wheel of Fortune'), message: 'A turning point. Cycles are shifting in your favour; stay open to the change arriving now.' },
];

export function drawThree() {
  const shuffled = [...DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}
