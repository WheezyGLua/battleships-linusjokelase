import { SignOutButton } from "@/components/singOutButton";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-[1200px]">
        <CardHeader>
          <CardTitle>Dina kontouppgifter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <CardTitle>Användarnamn</CardTitle>
          <p className="">{session.user.name}</p>
          <CardTitle>E-post</CardTitle>
          <p className="">{session.user.email}</p>

          <pre>{JSON.stringify(session, null, 2)}</pre>
        </CardContent>
        <CardFooter>
          <div className="w-full flex justify-end">
            <SignOutButton />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}