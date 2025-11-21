"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";

import { Input } from "@/app/components/ui/input";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";

export const Search = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInternalUpdateRef = useRef(false);

  // Initialize query from URL params on mount
  useEffect(() => {
    const urlQuery = searchParams.get("query") || "";
    setQuery(urlQuery);
  }, []);

  // Sync query state when URL changes externally (e.g., browser back/forward)
  useEffect(() => {
    // Skip if this is our own update
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }

    const urlQuery = searchParams.get("query") || "";
    setQuery((prevQuery) => {
      // Only update if different from current query
      if (urlQuery !== prevQuery) {
        return urlQuery;
      }
      return prevQuery;
    });
  }, [searchParams]);

  // Handle input changes - update state immediately for responsive typing
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce URL update
    timeoutRef.current = setTimeout(() => {
      const currentSearchParams = searchParams.toString();
      const currentUrlQuery = searchParams.get("query") || "";
      
      // Only update URL if query actually changed
      if (newQuery !== currentUrlQuery) {
        isInternalUpdateRef.current = true;
        
        if (newQuery.trim()) {
          // Create new params without page to reset to page 1 when searching
          const params = new URLSearchParams(currentSearchParams);
          params.delete('page');
          params.set('query', newQuery.trim());
          
          const newUrl = `${window.location.pathname}?${params.toString()}`;
          // Use push to trigger server component re-render
          router.push(newUrl, { scroll: false });
        } else {
          // Remove both query and page params when clearing search
          const newUrl = removeKeysFromQuery({
            searchParams: currentSearchParams,
            keysToRemove: ["query", "page"],
          });
          router.push(newUrl, { scroll: false });
        }
      }
    }, 300);
  }, [router, searchParams]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex w-2xl rounded-2xl border-2 border-purple-200/20 bg-white px-4 shadow-sm shadow-purple-200/15 ">
      <Image
        src="/icons/search.svg"
        alt="search"
        width={24}
        height={24}
      />

      <Input
        className="border-0 bg-transparent text-dark-600 w-full placeholder:text-dark-400 h-[50px] p-16-medium focus-visible:ring-offset-0 p-3 focus-visible:ring-transparent !important"
        placeholder="Search"
        value={query}
        onChange={handleChange}
      />
    </div>
  );
};