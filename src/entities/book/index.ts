// Book – the one business entity: its data, storage, cover, sharing and simulated AI writer.

// model
export type { Book, Chapter, ChapterStatus, Stage } from "./model/types";
export { stageOrder } from "./model/types";
export { useBooks } from "./model/store";
export { useBook, useHydrated } from "./model/useHydrated";
export { forwardStage, newChapterId } from "./model/stage";
export { estimate } from "./model/estimate";
export { validateTopic, type TopicCheck } from "./model/validate";
export { sampleBooks } from "./model/samples";
export {
  directionsForMood,
  getCoverDesign,
  type ArtDirection,
  type CoverDesign,
  type CoverPalette,
  type Mood,
} from "./model/cover-design";
export { coverScene, type CoverScene, type FontRole, type Shape, type TextBlock } from "./model/cover-scene";

// api – simulated AI writer
export {
  alternativeChapter,
  ctaText,
  draftOutline,
  shapeIdea,
  suggestAudiences,
  suggestTitles,
  titleCase,
  writeChapter,
  type RewriteDirection,
  type TitleStyle,
} from "./api/generate";
export { exampleTopics } from "./api/content/templates";
export { isDemoTopic } from "./api/content/demo";

// lib
export { decodeBook, encodeBook, shareUrl } from "./lib/share";

// ui
export { BookCard } from "./ui/BookCard";
export { BookPanel, bookDesign } from "./ui/BookPanel";
export { ContinueCard } from "./ui/ContinueCard";
export { Cover } from "./ui/Cover";
