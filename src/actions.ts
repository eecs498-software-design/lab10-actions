
import { z, type ZodType } from "zod";

export type AttemptedResultStatus = "rejected" | "completed";

// TASK 2a - Define PuzzleActionSpec
// TASK 3d, come back later to add ResultsSchemaBase constraint




// TASK 3a, 3b - Define PuzzleActionManifest using a mapped
// type, then refactor to use a Record




// TASK 3c - Create PUZZLE_ACTIONS helper function




// TASK 3d - see above alongside TASK 2a




// TASK 4a - Define PuzzleWithActions mapped type
type StringKeyOf<T> = Extract<keyof T, string>;




// TASK 4b - Define AttemptActionFunction and update PuzzleWithActions




// TASK 5 - Create the attemptAction function