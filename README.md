# lab10

## Setup

Clone this repository. For example:

```console
cd ~/eecs498apsd/labs # or wherever you want to put labs
git clone git@github.com:eecs498-software-design/lab10.git # different url if you want to use https instead
```

Then, open the cloned repo in VS Code or another IDE.

From a terminal, run `pnpm install`. NOT `npm install` -- we are using pnpm now :).

## Exercises

In this exercise, you'll create a generic abstraction for the action set associated with a puzzle and implement types that ensure a puzzle can process each action correctly according to its parameter (input) and result (output) schemas.

### Task 1: Define the hint action schemas and types

Start by taking a look at the object in `src/spelling_bee.ts` called `SpellingBeeActions`. This object defines the actions that a Spelling Bee puzzle supports, along with the schemas for their parameters and results.

**Task 1a**:  
Add schemas for the "hint" action, following the pattern of the "guess" and "shuffle" actions. A hint may be rejected with the reason "no_words_remaining", or completed with a result property `.hint`, which contains the hint string.

Uncomment the `hint` entry in `SpellingBeeActions` once you've defined the schemas.

**Task 1b**:  
Add convenience types for the hint action, similar to `GuessParams` and `ShuffleResult`.

Uncomment the `give_hint` method in the `SpellingBeeGame` class once you've defined the types.




### Task 2: Define the `PuzzleActionSpec` Type

Now, let's move to `src/actions.ts` to define a generic type for puzzle action specifications.

**Task 2a**:  
Create a `PuzzleActionSpec` generic type. This type should have two type parameters, `ParamsSchema` and `ResultsSchema`, both extending `ZodType`. It should be an object type with `params` and `results` properties.

Copy this starter code into `src/actions.ts` and fill in the blanks:

```typescript
type PuzzleActionSpec<ParamsSchema extends ____ = ____, ResultsSchema extends ____ = ____> = {
  readonly params: ____;
  readonly results: ____;
};
```

### Task 3: Define the `PuzzleActionManifest` Type

Now we need a type that represents a collection of action specifications - a "manifest" of all the actions a puzzle supports.

**Task 3a**: Create a `PuzzleActionManifest` type using a **mapped type**.

A mapped type lets you create a new object type by transforming the keys of another type. The syntax looks like:

```typescript
type MyMappedType<T> = {
  [K in keyof T]: SomeTransformation<T[K]>;
};
```

This iterates over each key `K` in `T` and creates a property with that key, where the value type is some transformation of `T[K]`.

For `PuzzleActionManifest`, we want to map over string keys and ensure each value is a `PuzzleActionSpec`. Fill in the blanks:

```typescript
export type PuzzleActionManifest = {
  [K in ____]: ____;
};
```

**Task 3b**: TypeScript provides a built-in utility type called `Record<Keys, Type>` that creates an object type with keys of type `Keys` and values of type `Type`. For example, `Record<string, number>` is equivalent to `{ [key: string]: number }`.

Refactor `PuzzleActionManifest` to use `Record` instead of a mapped type:

```typescript
export type PuzzleActionManifest = Record<____, ____>;
```

**Task 3c**: Create a helper function `PUZZLE_ACTIONS` that takes an action manifest and returns it with proper typing. This is a simple identity function, but it helps TypeScript infer the specific types where you define the manifest, since calling the function gives the compiler the initial cue of the type we're defining.

```typescript
export function PUZZLE_ACTIONS<T extends ____>(manifest: T): T {
  return ____;
}
```

**Task 3d**: There's actually a bug in `ShuffleResultsSchema`! Can you spot it? (Hint: look at the `status` property carefully and compare it to `AttemptedResultStatus`. Don't fix the mistake yet, though.)

The problem is that our `ResultsSchema extends ZodType` constraint is too loose. We want to ensure that all result schemas produce an object with a `status` property that matches our `AttemptedResultStatus` type.

Add a `ResultsSchemaBase` type alias and use it as a constraint:

```typescript
type ResultsSchemaBase = ZodType<{ status: ____ }>;

type PuzzleActionSpec<ParamsSchema extends ZodType = ZodType, ResultsSchema extends ____ = ____> = {
  readonly params: ParamsSchema;
  readonly results: ResultsSchema;
};
```

After this change, you should see a type error in `spelling_bee.ts` for the shuffle action. Fix the bug!

### Task 4: Define the `PuzzleWithActions` Type

Now we need a type that represents a puzzle class that can handle all the actions in a manifest. Each action `"foo"` should correspond to a method `attempt_foo` on the puzzle.

**Task 4a**: Create a `PuzzleWithActions` mapped type that transforms action names to method names.

Mapped types can also **remap keys** using the `as` clause. This lets you transform the key names:

```typescript
type Remapped<T> = {
  [K in keyof T as `prefix_${K & string}`]: T[K];
};
```

The `K & string` is needed because `keyof T` might include `symbol` or `number` keys, and template literal types only work with strings.

First, let's create a helper type to extract just the string keys:

```typescript
type StringKeyOf<T> = Extract<keyof T, string>;
```

Now create `PuzzleWithActions`. For now, just use `any` as the property type - we'll fix this in the next step:

```typescript
export type PuzzleWithActions<T extends PuzzleActionManifest> = {
  [K in StringKeyOf<T> as `____${K}`]: ____;
};
```

Once you have this, check `src/spelling_bee.ts`. The `SpellingBeeGame` class should now have type errors because it implements `PuzzleWithActions<SpellingBeeActions>` but its method names don't match! Rename the methods from `guess` and `shuffle` to `attempt_guess` and `attempt_shuffle`. Also uncomment the `give_hint` method you created in Task 1 and rename it to `attempt_hint`.

**Task 4b**: Now let's properly type the action methods. We need helper types to extract the params and results types from a manifest:

```typescript
type ParamsType<T extends PuzzleActionManifest, K extends StringKeyOf<T>> = z.infer<T[____]["params"]>;
type ResultsType<T extends PuzzleActionManifest, K extends StringKeyOf<T>> = z.infer<T[____]["results"]>;
```

Now create the `AttemptActionFunction` type - a function that takes params and returns results:

```typescript
export type AttemptActionFunction<T extends PuzzleActionManifest, K extends StringKeyOf<T>> = 
  (params: ____) => ____;
```

Finally, update `PuzzleWithActions` to use `AttemptActionFunction` instead of `any`:

```typescript
export type PuzzleWithActions<T extends PuzzleActionManifest> = {
  [K in StringKeyOf<T> as `attempt_${K}`]: ____;
};
```

### Task 5: Create the `attemptAction` Function

Now let's create a generic function that can invoke any action on a puzzle, given the action name and parameters.

**Task 5**: Implement the `attemptAction` function. This function should:
1. Take a `game` (a `PuzzleWithActions<T>`), an `action_kind` (a key from the manifest), and `params`
2. Look up the appropriate `attempt_*` method on the game
3. Call it with the params and return the result

```typescript
export function attemptAction<T extends PuzzleActionManifest, K extends StringKeyOf<T>>(
  game: ____,
  action_kind: ____,
  params: ____
): ____ {
  const attempt_fn = game[`attempt_${action_kind}` as `attempt_${K}`] as AttemptActionFunction<T, K>;
  return attempt_fn(____);
}
```

The type assertion `as \`attempt_${K}\`` is needed because TypeScript can't automatically narrow the template literal type from the dynamic string construction.

