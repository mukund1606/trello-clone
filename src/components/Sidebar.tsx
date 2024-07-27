"use client";

import { useSidebar } from "@/hooks/useSidebar";
import type { User } from "lucia";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, LogOutIcon } from "lucide-react";
import { useEffect } from "react";
import { Button } from "./ui/button";

export default function Sidebar({ user }: { user: User }) {
  const { isOpen, toggle, setIsOpen } = useSidebar();

  const logOutRoute = api.auth.logOut.useMutation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (event.target instanceof HTMLElement) {
        if (
          event.target.closest("#sidebar") ??
          event.target.closest(".sidebar-item")
        ) {
          return;
        }
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [setIsOpen]);
  return (
    <motion.aside
      id="sidebar"
      className={cn(
        "sticky z-10 flex h-[100dvh] w-10 flex-col border-r-2 bg-background transition-all duration-300 sm:w-14",
        isOpen && "w-40 sm:w-52",
      )}
    >
      <div className="flex items-center justify-between gap-2 p-2">
        <Avatar className="h-6 w-6 sm:h-10 sm:w-10">
          <AvatarImage src="/user.png" />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="flex w-full items-center justify-between"
            >
              <motion.span className="font-medium">{user.name}</motion.span>
              <Button
                disabled={logOutRoute.isPending}
                onClick={async () => {
                  await logOutRoute.mutateAsync();
                  window.location.reload();
                }}
                size="icon"
                variant="link"
                className="sidebar-item h-fit w-fit hover:bg-background/10"
              >
                <LogOutIcon className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-auto border-t-2 border-border p-1">
        <Button onClick={toggle} className="group w-full" size="icon">
          <ChevronRight
            className={cn(
              "h-5 w-5 transition-all duration-300 group-hover:ml-1",
              isOpen && "rotate-180 group-hover:ml-0 group-hover:mr-4",
            )}
          />
        </Button>
      </div>
    </motion.aside>
  );
}
