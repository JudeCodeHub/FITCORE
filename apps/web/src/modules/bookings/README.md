# bookings module

Member-facing booking actions and the "My Bookings" page. Class
booking itself (the Book/Cancel buttons on the grid) lives inside the
`classes` module's `WeeklyTimetable` component (`interactive` mode),
which imports `bookingsService` from this module's barrel.

**Routes:** `/member/bookings`

**Data deps:** `apps/api` — `POST /bookings/me`, `GET /bookings/me`,
`POST /bookings/me/:id/cancel`.
