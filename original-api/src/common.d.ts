export type Ok<OkType> = {
    type: "ok",
}

export type Error<ErrorType> = {
    type: "error"
}

export type Result<OkType, ErrorType> = Ok<OkType> | Error<ErrorType>
