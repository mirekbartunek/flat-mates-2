"use client";
import * as React from "react";
import { Link as TransitionLink } from "next-view-transitions";

import { Moon, Sun, Shield } from "lucide-react";
import { useTheme } from "next-themes";
import { api } from "@/trpc/react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { cn, isAdmin } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserRole } from "@/server/db/enums";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandLogo } from "@/components/icons";
import Link from "next/link";

export const Header = () => {
  const { data: user, isLoading } = api.users.publicMe.useQuery(undefined, {
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 120,
    throwOnError: false,
  });
  const components: { title: string; href: string; description: string }[] = [
    {
      title: "Co-housing",
      href: "/",
      description: "Flats for more tenants, perfect for students",
    },
  ];
  return (
    <div className="flex max-w-full flex-row items-center justify-between px-5 py-2 sm:px-20">
      <NavigationMenu>
        <TransitionLink href="/">
          <BrandLogo className="text-primary dark:text-primary h-6 w-6" />
        </TransitionLink>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-xs sm:text-sm">
              About
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-1 p-6 sm:gap-3 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <TransitionLink
                      href="/"
                      className="flex h-full w-full flex-col justify-end rounded-md bg-rose-100 p-6 no-underline outline-hidden select-none focus:shadow-md dark:bg-rose-950"
                    >
                      <div className="mt-4 mb-2 text-lg font-medium">
                        Flat Mates
                      </div>
                      <p className="text-muted-foreground text-sm leading-tight">
                        Leasing and co-renting flats has never been easier
                      </p>
                    </TransitionLink>
                  </NavigationMenuLink>
                </li>
                <ListItem
                  href="/list-your-property"
                  title="I want to lease a flat"
                >
                  Identify yourself on one of our points and start renting
                </ListItem>
                <ListItem href="/#listings" title={"I want to rent a flat"}>
                  Choose from the offers that suit your needs
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-xs sm:text-sm">
              Flats
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center gap-3">
        {user && isAdmin(user.role) ? (
          <Link
            href="/admin"
            className={buttonVariants({
              variant: "outline",
            })}
          >
            <Shield className="h-[1.2rem] w-[1.2rem]" />
          </Link>
        ) : null}
        <ModeToggle />
        {isLoading ? (
          <UserPopupSkeleton />
        ) : user ? (
          <UserPopup
            image={user.image ?? undefined}
            name={user.name!}
            isVerified={user.verified_status === "VERIFIED"}
            role={user.role}
          />
        ) : (
          <>
            <Button onClick={() => signIn("google")}>Log in</Button>
          </>
        )}
      </div>
    </div>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors select-none",
            className
          )}
          {...props}
        >
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
const ModeToggle = () => {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
const UserPopup = ({
  image,
  name,
  role,
  isVerified,
}: {
  image: string | undefined;
  name: string;
  role: UserRole;
  isVerified: boolean;
}) => {
  const isAdmin = role === "ADMIN" || role === "SUPERADMIN";
  console.log(role);
  console.log(isVerified);
  return (
    <Link className="flex h-fit gap-2" href="/me">
      <div>
        <Avatar>
          <AvatarImage src={image} alt={`Profile Image`} />
          <AvatarFallback>{name}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col">
        <p>{name}</p>
        <div className="flex gap-2">
          {isAdmin ? <Badge>{role}</Badge> : null}
          {isVerified ? <Badge>VERIFIED</Badge> : null}
        </div>
      </div>
    </Link>
  );
};

const UserPopupSkeleton = () => {
  return (
    <div className="flex h-fit items-center gap-2">
      <div>
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-[100px]" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-[50px]" />
          <Skeleton className="h-4 w-[50px]" />
        </div>
      </div>
    </div>
  );
};
