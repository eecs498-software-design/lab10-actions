import { z } from "zod";
import { PUZZLE_ACTIONS, PuzzleWithActions } from "./actions";

export const INVALID_WORD_REASONS = ["too_short", "missing_center_letter", "invalid_letters", "not_in_dictionary"] as const;
export type InvalidWordReason = typeof INVALID_WORD_REASONS[number];

// Schemas for the "guess" action
const GuessParamsSchema = z.object({
  guessed_word: z.string().toLowerCase(),
}).readonly();
const GuessResultsSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("rejected"),
    reason: z.enum(["duplicate"]),
  }).readonly(),
  z.object({
    status: z.literal("completed"),
    evaluation: z.discriminatedUnion("kind", [
      z.object({
        kind: z.literal("valid"),
        is_pangram: z.boolean(),
        points_earned: z.number().int().nonnegative(),
      }).readonly(),
      z.object({
        kind: z.literal("invalid"),
        reason: z.enum(INVALID_WORD_REASONS),
      }).readonly(),
    ]),
  }).readonly(),
]);

// Schemas for the "shuffle" action
const ShuffleParamsSchema = z.object({}).readonly();
const ShuffleResultsSchema = z.object({
  status: z.literal("complete"),
}).readonly();


// TASK 1a - Add schemas for the "hint" action, following the
// pattern of the "guess" and "shuffle" actions. A hint may be
// rejected with the reason "no_words_remaining", or completed
// with a result property .hint, which contains the hint string.






// Convenience types for the params and results, so we
// don't have to keep writing `z.infer<...>` everywhere.
type GuessParams = z.infer<typeof GuessParamsSchema>;
type GuessResult = z.infer<typeof GuessResultsSchema>;
type ShuffleParams = z.infer<typeof ShuffleParamsSchema>;
type ShuffleResult = z.infer<typeof ShuffleResultsSchema>;



// TASK 1b - Add convenience types above for the hint action.


export const SpellingBeeActions = PUZZLE_ACTIONS({
  guess: {
    params: GuessParamsSchema,
    results: GuessResultsSchema,
  },
  shuffle: {
    params: ShuffleParamsSchema,
    results: ShuffleResultsSchema,
  },
  // TASK 1a: Uncomment once you've defined HintParamsSchema and HintResultsSchema
  // hint: {
  //   params: HintParamsSchema,
  //   results: HintResultsSchema,
  // },
} as const);
type SpellingBeeActions = typeof SpellingBeeActions;


const DICTIONARY = ["apple", "banana", "orange"];

export class SpellingBeeGame implements PuzzleWithActions<SpellingBeeActions> {
  
  public guess(params: GuessParams): GuessResult {
    const { guessed_word } = params;
    if (guessed_word.length < 4) {
      return { status: "completed", evaluation: { kind: "invalid", reason: "too_short" } };
    }

    if (DICTIONARY.includes(guessed_word)) {
      return { status: "completed", evaluation: { kind: "valid", is_pangram: false, points_earned: 1 } };
    }
    return { status: "completed", evaluation: { kind: "invalid", reason: "not_in_dictionary" } };
  }

  public shuffle(_params: ShuffleParams): ShuffleResult {
    // Assume shuffle implementation is here
    return { status: "complete" }; // Placeholder
  }

  // TASK 1b: Uncomment once you've defined HintParams and HintResult
  // public give_hint(_params: HintParams): HintResult {
  //   // Assume hint implementation is here
  //   return { status: "completed", hint: "Try a common fruit!" }; // Placeholder
  // }
}