"use client";

import { api } from "@/trpc/react";
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Location = {
  lat: number;
  lng: number;
  address: string;
};

type MapProps = {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
};

const Map = ({ onLocationSelect, initialLocation }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);

  const [term, setTerm] = useState("");

  const { mutate, data } = api.location.getCoordinatesByTerm.useMutation({
    onSuccess: (res) => {
      const hit = res.at(0);
      const lng = hit.coordinates.at(0);
      const lat = hit.coordinates.at(1);
      marker.current?.setLngLat([lng, lat]);
      map.current?.setCenter([lng, lat]);
    },
  });
  const { data: mapStyle } = api.location.getMapStyle.useQuery(undefined, {
    staleTime: Infinity,
    experimental_prefetchInRender: true,
  });

  const { mutateAsync: getLocation, isPending } =
    api.location.getAdressByCoords.useMutation();

  useEffect(() => {
    if (!map.current && mapStyle && mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: initialLocation
          ? [initialLocation.lng, initialLocation.lat]
          : [14.4378, 50.0755], // prague
        zoom: 12,
      });

      marker.current = new maplibregl.Marker({
        draggable: true,
      });

      if (initialLocation) {
        marker.current
          .setLngLat([initialLocation.lng, initialLocation.lat])
          .addTo(map.current);
      }

      map.current.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        if (marker.current && map.current) {
          marker.current.setLngLat([lng, lat]).addTo(map.current);

          getLocation({
            lat: lat,
            long: lng,
          }).then((res) => {
            console.log(res);
            onLocationSelect({
              lat,
              lng,
              address: res.place_name,
            });
          });
        }
      });

      marker.current.on("dragend", () => {
        if (marker.current && map.current) {
          const { lng, lat } = marker.current.getLngLat();
          marker.current.setLngLat([lng, lat]).addTo(map.current);

          const res = getLocation({
            // todo: extract logic to seperate method
            lat: lat,
            long: lng,
          }).then((res) => {
            console.log(res);
            onLocationSelect({
              lat,
              lng,
              address: res.place_name,
            });
          });
        }
      });
    }
  }, [mapStyle, initialLocation]);

  return (
    <>
      <div ref={mapContainer} className={`h-[400px] w-full rounded-lg`} />;
      <Button onClick={() => mutate({ term })}>Send</Button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <Input value={term} onChange={(e) => setTerm(e.target.value)} />
    </>
  );
};

export default function Component() {
  const [resolvedAdress, setResolvedAdress] = useState<null | Location>(null);
  return (
    <main>
      <h1>Test</h1>

      <Map
        onLocationSelect={(c) => setResolvedAdress(c)}
        initialLocation={{
          lat: 50.022,
          lng: 14.4983,
          address: "EDUCANET",
        }}
      />
      {resolvedAdress === null ? (
        <span>¯\_(ツ)_/¯</span>
      ) : (
        <pre>{JSON.stringify(resolvedAdress, null, 2)}</pre>
      )}
    </main>
  );
}
