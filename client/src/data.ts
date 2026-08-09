import collectionNocturne from "./assets/generated/collection-nocturne.jpg";
import collectionAscent from "./assets/generated/collection-ascent.jpg";
import collectionChrome from "./assets/generated/collection-chrome.jpg";
import collectionGreyMatter from "./assets/generated/collection-greymatter.jpg";
import collectionUnderground from "./assets/generated/collection-underground.jpg";

export type Collection = {
  name: string;
  description: string;
  image: string;
  price: string;
};

export const collections: Collection[] = [
  {
    name: "Nocturne",
    description: "A skyline held in fog. Deep blue-black, one point of light.",
    image: collectionNocturne,
    price: "9",
  },
  {
    name: "Ascent",
    description: "Raw concrete, hard shadow, a single stair going up.",
    image: collectionAscent,
    price: "9",
  },
  {
    name: "Chrome",
    description: "Liquid metal in macro. Cold, reflective, unrepeatable.",
    image: collectionChrome,
    price: "9",
  },
  {
    name: "Grey Matter",
    description: "Studio fog on near black. Soft grain, no edges.",
    image: collectionGreyMatter,
    price: "9",
  },
  {
    name: "Underground",
    description: "A parking level at 2am. One bulb, long shadows.",
    image: collectionUnderground,
    price: "9",
  },
];

export const testimonials = [
  {
    quote:
      "First wallpaper set I have kept past a week. The grain and the color grading still hold up at full brightness.",
    name: "Mateo Ilic",
    role: "Milan",
  },
  {
    quote: "Bought Nocturne on a whim, ended up buying two more sets the same night.",
    name: "Kenji Osei",
    role: "London",
  },
  {
    quote:
      "The only wallpaper shop that shoots these like an actual editorial, not a stock photo dump.",
    name: "Theo Vance",
    role: "Toronto",
  },
];

export const faqs = [
  {
    question: "What resolution are the files?",
    answer:
      "Every MacBook set ships at 5K, 5120 by 2880. Every iPhone set ships at native resolution for iPhone 13 through 16 Pro Max.",
  },
  {
    question: "Do I get both MacBook and iPhone versions?",
    answer:
      "Yes. Every collection ships as a matched pair, one crop for desktop, one for mobile, graded to the same palette.",
  },
  {
    question: "Can I use these commercially?",
    answer:
      "No. Every license covers personal device use only. For commercial or client work, contact us directly.",
  },
  {
    question: "Is All Access a subscription?",
    answer: "Yes, billed yearly. Cancel any time and keep every file you already downloaded.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Within 14 days if a file is corrupted or the wrong resolution. Since files are digital, we do not offer refunds for change of mind.",
  },
];

export const pricing = [
  {
    name: "Single Drop",
    price: "9",
    period: "one time",
    description: "One matched MacBook and iPhone set, full resolution.",
    features: ["1 collection, both devices", "Full resolution files", "Personal use license", "Instant download"],
    cta: "Get This Set",
    highlighted: false,
  },
  {
    name: "All Access",
    price: "89",
    period: "per year",
    description: "The entire archive, plus every collection we shoot after today.",
    features: [
      "Every current collection",
      "New drops included",
      "Early access before public release",
      "Priority support",
    ],
    cta: "Join All Access",
    highlighted: true,
  },
];

export const processSteps = [
  {
    index: "01",
    title: "Pick a collection",
    body: "Browse matched MacBook and iPhone sets by mood, not by category.",
  },
  {
    index: "02",
    title: "Get instant access",
    body: "Files land in your inbox in seconds, full resolution, no watermark.",
  },
  {
    index: "03",
    title: "Set it once, everywhere",
    body: "Apply the same set across every screen you own for one considered look.",
  },
];
