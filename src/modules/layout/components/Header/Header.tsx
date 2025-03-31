"use client";
import * as React from "react";
import { Link as TransitionLink } from "next-view-transitions";
import { Moon, Sun, Shield } from "lucide-react";
import { useTheme } from "next-themes";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
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
  const { data: sessionData, status } = useSession();
  const user = sessionData?.user;

  const components: { title: string; href: string; description: string }[] = [
    {
      title: "Co-housing",
      href: "/",
      description: "Flats for more tenants, perfect for students",
    },
  ];

  return (
    <div className="flex max-w-full flex-row items-center justify-between px-2 py-2 sm:px-5 lg:px-20">
      <NavigationMenu className="relative">
        <TransitionLink
          href="/"
          className="absolute top-1/2 left-0 z-20 -translate-y-1/2"
        >
          <BrandLogo className="text-primary dark:text-primary h-6 w-6" />
        </TransitionLink>

        <NavigationMenuList className="space-x-1 pl-8 sm:space-x-2 sm:pl-12">
          <NavigationMenuItem>
            <NavigationMenuTrigger className="h-auto px-2 py-1 text-[11px] sm:px-3 sm:py-1.5 sm:text-xs">
              About
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-1 p-3 sm:gap-3 sm:p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <TransitionLink
                      href="/"
                      className="flex h-full w-full flex-col justify-end rounded-md bg-rose-100 p-3 no-underline outline-hidden select-none focus:shadow-md sm:p-6 dark:bg-rose-950"
                    >
                      <div className="mt-2 mb-1 text-base font-medium sm:mt-4 sm:mb-2 sm:text-lg">
                        Flat Mates
                      </div>
                      <p className="text-muted-foreground text-xs leading-tight sm:text-sm">
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
            <NavigationMenuTrigger className="h-auto px-2 py-1 text-[11px] sm:px-3 sm:py-1.5 sm:text-xs">
              Flats
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[300px] gap-2 p-3 sm:w-[400px] sm:gap-3 sm:p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
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

      <div className="flex items-center gap-1 sm:gap-3">
        {user && isAdmin(user.role) ? (
          <Link
            href="/admin"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-8 w-8 sm:h-9 sm:w-9"
            )}
          >
            <Shield className="h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem]" />
          </Link>
        ) : null}

        <ModeToggle />

        {status === "loading" ? (
          <UserPopupSkeleton />
        ) : user ? (
          <UserPopup
            image={user.image ?? undefined}
            name={user.name!}
            isVerified={user.verified_status === "VERIFIED"}
            role={user.role}
          />
        ) : (
          <Button
            onClick={() => signIn("google")}
            size="sm"
            className="px-2 text-xs sm:px-3 sm:text-sm"
          >
            Log in
          </Button>
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
            "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-2 leading-none no-underline outline-hidden transition-colors select-none sm:p-3",
            className
          )}
          {...props}
        >
          <div className="text-xs leading-none font-medium sm:text-sm">
            {title}
          </div>
          <p className="text-muted-foreground line-clamp-2 text-xs leading-snug sm:text-sm">
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
        <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
          <Sun className="h-4 w-4 scale-100 rotate-0 transition-all sm:h-[1.2rem] sm:w-[1.2rem] dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all sm:h-[1.2rem] sm:w-[1.2rem] dark:scale-100 dark:rotate-0" />
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

  return (
    <Link className="flex h-fit gap-1 sm:gap-2" href="/me">
      <div>
        <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
          <AvatarImage src={image} alt={`Profile Image`} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col">
        <p className="max-w-[50px] truncate text-xs sm:max-w-none sm:text-sm">
          {name}
        </p>
        <div className="flex flex-wrap gap-0.5 sm:gap-1">
          {isAdmin ? (
            <Badge className="px-1 py-0 text-[9px] sm:px-2 sm:py-0 sm:text-xs">
              {role}
            </Badge>
          ) : null}
          {isVerified ? (
            <Badge className="px-1 py-0 text-[9px] sm:px-2 sm:py-0 sm:text-xs">
              VERIFIED
            </Badge>
          ) : null}
        </div>
      </div>
    </Link>
  );
};

const UserPopupSkeleton = () => {
  return (
    <div className="flex h-fit items-center gap-1 sm:gap-2">
      <div>
        <Skeleton className="h-8 w-8 rounded-full sm:h-9 sm:w-9" />
      </div>
      <div className="flex flex-col gap-1">
        <Skeleton className="h-3 w-[40px] sm:h-4 sm:w-[50px]" />
        <div className="flex gap-0.5 sm:gap-1">
          <Skeleton className="h-3 w-[30px] sm:h-4 sm:w-[40px]" />
        </div>
      </div>
    </div>
  );
};
