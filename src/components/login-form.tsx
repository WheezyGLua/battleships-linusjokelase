'use client'

import { cn } from "@/lib/utils"
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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)


  const onSignIn = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    authClient.signIn.email({
      email,
      password,
    }, {
      onSuccess: () => {
        setLoading(false)
        redirect("/dashboard")
      },
      onError: (ctx) => {
        console.log(ctx.error.message)
        setError(ctx.error.message)
        setLoading(false)
      },
      onRequest: () => {
        setLoading(true)
      }
    })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Logga in på ditt konto</CardTitle>
          <CardDescription>
            Ange din e-post nedan för att logga in på ditt konto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSignIn}>
            {error && <FieldGroup>
              <Field>
                <FieldLabel htmlFor="error">Fel</FieldLabel>
                <p className="text-red-500">{error}</p>
              </Field>
            </FieldGroup>}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">E-post</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Lösenord</FieldLabel>
                  <a
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Glömt ditt lösenord?
                  </a>
                </div>
                <Input id="password" name="password" type="password" required />
              </Field>
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Loggar in..." : "Logga in"}
                </Button>
                <FieldDescription className="text-center">
                  Har du inget konto? <a href="/signup">Skapa ett konto</a>
                </FieldDescription>
              </Field>
            </FieldGroup>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}
