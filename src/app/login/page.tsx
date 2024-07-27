import { LoginForm } from "@/components/LoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { validateRequest } from "@/server/auth/validateRequest";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const { user } = await validateRequest();
  if (user) {
    redirect("/");
  }
  return (
    <div className="flex h-[100dvh] w-screen flex-col">
      <div className="mx-auto my-auto">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Welcome to Trello Clone, please login to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter>
            Don&apos;t have an account?{" "}
            <Link
              className="text-blue-500 underline transition-colors hover:text-blue-700"
              href="/signup"
            >
              Sign up
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
