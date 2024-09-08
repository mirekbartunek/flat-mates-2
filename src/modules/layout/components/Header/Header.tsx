"use client";
import * as React from "react";
import { Link as TransitionLink } from "next-view-transitions";

import { useTranslations } from "next-intl";
import {  Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { api } from "@/trpc/react";
import {
  NavigationMenu, NavigationMenuContent,
  NavigationMenuItem, NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { UserRole } from "@/server/db/enums";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandLogo } from "@/components/icons";

export const Header = () => {
  const t = useTranslations("Header");
  const { data: user, isLoading } = api.users.protectedMe.useQuery(
    undefined,
    {
      retry: 1,
      staleTime: 1000 * 60,
      refetchInterval: 1000 * 120,
    }
  );
  const components: { title: string; href: string; description: string }[] = [
    {
      title: t("flats.co-housing.title"),
      href: "/offers?kind=co-housing",
      description: t("flats.co-housing.description"),
    },
    {
      title: "Hover Card",
      href: "/docs/primitives/hover-card",
      description:
        "For sighted users to preview content available behind a link.",
    },
    {
      title: "Progress",
      href: "/docs/primitives/progress",
      description:
        "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
    },
    {
      title: "Scroll-area",
      href: "/docs/primitives/scroll-area",
      description: "Visually or semantically separates content.",
    },
    {
      title: "Tabs",
      href: "/docs/primitives/tabs",
      description:
        "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
    },
    {
      title: "Tooltip",
      href: "/docs/primitives/tooltip",
      description:
        "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
    },
  ];
  return (
    <div className="flex max-w-full flex-row items-center justify-between px-5 py-2 sm:px-20">
      <NavigationMenu>
        <TransitionLink href="/public">
          <BrandLogo className="h-6 w-6 text-primary dark:text-primary" />
        </TransitionLink>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-xs sm:text-sm">
              {t("heading")}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-1 p-6 sm:gap-3 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <TransitionLink
                      href="/public"
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-rose-100 p-6 no-underline outline-none focus:shadow-md dark:bg-rose-950"
                    >
                      <div className="mb-2 mt-4 text-lg font-medium">
                        Flat Mates
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        {t("description")}
                      </p>
                    </TransitionLink>
                  </NavigationMenuLink>
                </li>
                <ListItem href="/list-your-property" title={t("offer.title")}>
                  {t("offer.description")}
                </ListItem>
                <ListItem href="/#listings" title={t("tenant.title")}>
                  {t("tenant.description")}
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
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
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
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
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
    <div className="flex h-fit">
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
    </div>
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
