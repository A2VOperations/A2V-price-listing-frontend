import visitingCardsImg from "../assets/images/categories (5).webp";
import cardHolder from "../assets/images/categories (6).webp";
import stacked_poster from "../assets/images/categories (11).webp";
import tags from "../assets/images/categories (2).webp";
import files from "../assets/images/categories (7).webp";
import letterhead from "../assets/images/categories (13).webp";
import envelopes from "../assets/images/images.jpg";
import digitalPrint from "../assets/images/categories (1).webp";
import atmPouch from "../assets/images/categories (3).webp";
import billBook from "../assets/images/categories (8).webp";
import stickers from "../assets/images/categories (9).webp";
import pens from "../assets/images/categories (4).webp";
import flexBoard from "../assets/images/categories (14).webp";

export const categories = [
  {
    id: "flex-board",
    slug: "flex-board",
    name: "Flex Board",
    image: flexBoard,
    description:
      "Custom Flex Board printing & framing calculator with Iron/Wooden structure options, support rods & installation.",
  },
  {
    id: "visiting-cards",
    slug: "visiting-cards",
    name: "Visiting Cards",
    image: visitingCardsImg,
  },
  {
    id: "card-holders",
    slug: "card-holders",
    name: "Card Holders",
    image: cardHolder,
  },
  {
    id: "pamphlets-posters",
    slug: "pamphlets-posters",
    name: "Pamphlet / Posters",
    image: stacked_poster,
  },
  {
    id: "tags",
    slug: "tags",
    name: "Tags",
    image: tags,
  },
  {
    id: "files",
    slug: "files",
    name: "Files & Folders",
    image: files,
  },
  {
    id: "letter-heads",
    slug: "letter-heads",
    name: "Letter Heads",
    image: letterhead,
  },
  {
    id: "envelopes",
    slug: "envelopes",
    name: "Envelopes",
    image: envelopes,
  },
  {
    id: "digital-paper-printing",
    slug: "digital-paper-printing",
    name: "Digital Paper Printing",
    image: digitalPrint,
  },
  {
    id: "atm-pouches",
    slug: "atm-pouches",
    name: "ATM Pouches",
    image: atmPouch,
  },
  {
    id: "bill-books",
    slug: "bill-books",
    name: "Bill Books",
    image: billBook,
  },
  {
    id: "stickers-labels",
    slug: "stickers-labels",
    name: "Stickers & Labels",
    image: stickers,
  },
  {
    id: "pens",
    slug: "pens",
    name: "Pens",
    image: pens,
  },
];

export function getCategoryBySlug(slug) {
  return categories.find((c) => c.slug === slug);
}
