# exercises module

Home for the shared `Exercise` library (name, muscle group, default
sets/reps, demo link). Backed by `GET /exercises` (open to any
authenticated role — trainers and members both need to browse it when
building a workout plan).

No page of its own — `exercisesService.listAll()` is consumed by the
`workout-plans` module's exercise picker.
