import type { ReactNode, FC } from 'react'

declare module 'react-hook-form' {
  export type FieldValues = Record<string, unknown>
  export type FieldPath<TFieldValues extends FieldValues = FieldValues> = string & keyof TFieldValues

  export interface UseFormReturn<TFieldValues extends FieldValues = FieldValues> {
    getFieldState: (name: FieldPath<TFieldValues>, formState?: unknown) => { error?: { message?: string } }
    formState: unknown
  }

  export type ControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
  > = {
    name: TName
    render: (data: { field: unknown }) => ReactNode
  }

  export const Controller: <TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
    props: ControllerProps<TFieldValues, TName>
  ) => JSX.Element

  export const FormProvider: FC<{ children: ReactNode }>

  export const useFormContext: <TFieldValues extends FieldValues = FieldValues>() => UseFormReturn<TFieldValues>
}
