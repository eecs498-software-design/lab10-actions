
import { z, type ZodType } from "zod";


// TASK 2a - Define PuzzleActionSpec




// TASK 3a, 3b - Define PuzzleActionManifest using a mapped type, then as a Record




// TASK 3b - Refactor PuzzleActionManifest to use Record




// TASK 3c - Create PUZZLE_ACTIONS helper function




// TASK 3d - Add ResultsSchemaBase constraint
export type AttemptedResultStatus = "rejected" | "completed";




// TASK 4a - Define PuzzleWithActions mapped type
type StringKeyOf<T> = Extract<keyof T, string>;




// TASK 4b - Define AttemptActionFunction and update PuzzleWithActions




// TASK 5 - Create the attemptAction function