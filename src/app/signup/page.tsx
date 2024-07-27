import { SignUpForm } from "@/components/SignUpForm";
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

export default async function SignUpPage() {
  const { user } = await validateRequest();
  if (user) {
    redirect("/");
  }
  return (
    <div className="flex h-[100dvh] w-screen flex-col">
      <div className="mx-auto my-auto">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Welcome to Trello Clone, please sign up to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignUpForm />
          </CardContent>
          <CardFooter>
            Already have an account?{" "}
            <Link
              className="text-blue-500 underline transition-colors hover:text-blue-700"
              href="/login"
            >
              Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
