export interface SuccessResponse<Data> {
  message: string
  result: Data
}

export interface ErrorResponse<Data> {
  message: string
  errors?: Data
}

//  cú phápn '-?' sẽ loại bỏ cái key opitonal (hande?)
// nó sẽ loai bỏ undefined ủa key optional
export type NoUndefinedField<T> = {
  [P in keyof T]-?: NoUndefinedField<NonNullable<T>[P]>
}
