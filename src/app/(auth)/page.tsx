import Tasks from "@/components/Tasks";
import CreateTaskButton from "@/components/Tasks/CreateTaskButton";
import { validateRequest } from "@/server/auth/validateRequest";

export default async function Home() {
  const { user } = await validateRequest();

  return (
    <div className="flex flex-col gap-2 px-2 py-1">
      <h1 className="text-xl font-semibold">Hello, {user?.name}</h1>
      <div className="flex justify-between">
        <h2 className="text-lg font-medium">My Tasks</h2>
        <CreateTaskButton />
      </div>
      <Tasks />
    </div>
  );
}
