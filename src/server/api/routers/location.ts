import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { env } from "@/env";
import { TRPCError } from "@trpc/server";
import { isSearchResult, SearchResults } from "@/server/api/types/maptiler";
import type { StyleSpecification } from "maplibre-gl";

const MAPTILER_KEY = env.MAPTILER_API_KEY;

export const locationRouter = createTRPCRouter({
  getCoordinatesByTerm: protectedProcedure
    .input(
      z.object({
        term: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const res = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(input.term)}.json?key=${MAPTILER_KEY}`
      );
      const data = (await res.json()) as unknown;
      if (res.status === 400) {
        throw new TRPCError({
          message:
            "Could not find such location, please try a different term or a shorter request",
          code: "BAD_REQUEST",
        });
      }
      if (!isSearchResult(data)) {
        console.log(data);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong while fetching from the external API",
        });
      }
      const parsed = data.features.map((feature) => ({
        title: feature.place_name,
        relevance: feature.relevance,
        text: feature.text,
        coordinates: feature.center,
      }));
      return parsed;
    }),
  getMapStyle: protectedProcedure.query(async ({ ctx }) => {
    const res = await fetch(
      `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`
    );
    return (await res.json()) as StyleSpecification;
  }),
  getAdressByCoords: protectedProcedure
    .input(
      z.object({
        lat: z.number(),
        long: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const res = await fetch(
        `https://api.maptiler.com/geocoding/${input.long},${input.lat}.json?key=${MAPTILER_KEY}`
      );
      const data = (await res.json()) as unknown;
      if (res.status === 400) {
        throw new TRPCError({
          message:
            "Could not find such location, please try a different term or a shorter request",
          code: "BAD_REQUEST",
        });
      }
      if (!isSearchResult(data)) {
        console.log(data);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong while fetching from the external API",
        });
      }
      const parsed = data.features.map((feature) => ({
        title: feature.place_name,
        relevance: feature.relevance,
        text: feature.text,
        place_name: feature.place_name,
      }));
      const hit = parsed.at(0);
      if (!hit) {
        throw new TRPCError({
          message: "Something went wrong while parsing data",
          code: "PARSE_ERROR",
        });
      }
      return hit;
    }),
});
