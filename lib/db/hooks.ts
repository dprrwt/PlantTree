"use client";

import { useEffect, useState } from "react";
import type { District, Farmer, Plot } from "@/lib/data";
import {
  getAllPlots,
  getComingNextDistricts,
  getDistricts,
  getFarmers,
} from "./queries";

export function useDistricts(): District[] | null {
  const [data, setData] = useState<District[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    getDistricts()
      .then((d) => !cancelled && setData(d))
      .catch((e) => {
        console.error("useDistricts:", e);
        if (!cancelled) setData([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return data;
}

export function useComingNextDistricts():
  | { name: string; note: string }[]
  | null {
  const [data, setData] = useState<
    { name: string; note: string }[] | null
  >(null);
  useEffect(() => {
    let cancelled = false;
    getComingNextDistricts()
      .then((d) => !cancelled && setData(d))
      .catch((e) => {
        console.error("useComingNextDistricts:", e);
        if (!cancelled) setData([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return data;
}

export function useFarmers(): Farmer[] | null {
  const [data, setData] = useState<Farmer[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    getFarmers()
      .then((d) => !cancelled && setData(d))
      .catch((e) => {
        console.error("useFarmers:", e);
        if (!cancelled) setData([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return data;
}

export function usePlots(): Plot[] | null {
  const [data, setData] = useState<Plot[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    getAllPlots()
      .then((d) => !cancelled && setData(d))
      .catch((e) => {
        console.error("usePlots:", e);
        if (!cancelled) setData([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return data;
}
