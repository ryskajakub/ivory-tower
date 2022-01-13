/*
type PasswordRequestChange = { type: "PasswordRequestChange", token: string }
type Result = { type: "Result" }

export type PasswordRequestChangeResponse = { type: "PasswordRequestChangeResponse", email: string } | null | undefined

type 
*/

type Request1 = { type: "Request1" }
type Response1 = { type: "Response1" }

type Request2 = { type: "Request2" }
type Response2 = { type: "Response2" }

export type Return = { type: "Return" }

export type Gen = Generator<Request1 | Request2, Return, Response1 | Response2>