'use client'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { redirect } from "next/navigation"
import { useState } from "react"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSignup = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string
    const confirmPassword = formData.get("confirm-password") as string

    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte")
      return
    }

    setError(null)
    setLoading(true)
    authClient.signUp.email({
      email: email,
      password: password,
      name: name,
    },
    {
      onRequest(ctx) {
        setLoading(true)
      },
      onSuccess(ctx) {
        setLoading(false)
        redirect("/")
      },
      onError(ctx) {
        console.log(ctx.error.message)
        setError(ctx.error.message)
        setLoading(false)
      }
    })
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Skapa konto</CardTitle>
        <CardDescription>
          Ange dina uppgifter nedan för att skapa ditt konto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSignup}>
          {error && <FieldGroup>
            <Field>
              <FieldLabel htmlFor="error">Fel</FieldLabel>
              <p className="text-red-500">{error}</p>
            </Field>
          </FieldGroup>}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Användarnamn</FieldLabel>
              <Input
              name="name"
              id="name" type="text" placeholder="Användarnamn" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">E-post</FieldLabel>
              <Input
              name="email"
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
              <FieldDescription>
                Vi kommer att använda detta för att kontakta dig. Vi kommer inte att dela din e-postadress med någon annan.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Lösenord</FieldLabel>
              <Input
              name="password"
              id="password" type="password" required />
              <FieldDescription>
                Måste vara minst 8 tecken långt.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Bekräfta lösenord
              </FieldLabel>
              <Input
              name="confirm-password"
              id="confirm-password" type="password" required />
              <FieldDescription>Vänligen bekräfta ditt lösenord.</FieldDescription>
            </Field>
            <FieldGroup>
              <Button type="submit" disabled={loading}>
                {loading ? "Skapar konto..." : "Skapa konto"}
              </Button>
              <FieldDescription className="text-center">
                Har du redan ett konto? <a href="/signin">Logga in</a>
              </FieldDescription>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
