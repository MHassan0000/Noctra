"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { CldImage } from "next-cloudinary";
import { transformationTypes } from "@/constants";
import { IImage } from "@/lib/database/models/image.model";
import { formUrlQuery } from "@/lib/utils";
import { Button } from "../ui/button";
import { Search } from "./Search";
import { getAllImages } from "@/lib/actions/image.actions";

export const CollectionDisplay = ({
  hasSearch = false,
  initialImages,
  initialTotalPages = 1,
  initialPage,
}: {
  initialImages: IImage[];
  initialTotalPages?: number;
  initialPage: number;
  hasSearch?: boolean;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [images, setImages] = useState<IImage[]>(initialImages || []);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const prevParamsRef = useRef<string>(searchParams.toString());

  // Fetch images when searchParams change
  useEffect(() => {
    const currentParams = searchParams.toString();
    const currentPage = Number(searchParams.get("page")) || 1;
    const searchQuery = searchParams.get("query") || "";
    
    // Only fetch if params actually changed
    if (currentParams !== prevParamsRef.current) {
      prevParamsRef.current = currentParams;
      
      const fetchImages = async () => {
        setIsLoading(true);
        try {
          const result = await getAllImages({ 
            page: currentPage, 
            searchQuery 
          });
          
          if (result) {
            setImages(result.data || []);
            setTotalPages(result.totalPage || 1);
            setPage(currentPage);
          }
        } catch (error) {
          console.error("Error fetching images:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchImages();
    }
  }, [searchParams]);

  const onPageChange = (action: string) => {
    const pageValue = action === "next" ? Number(page) + 1 : Number(page) - 1;
    const newUrl = formUrlQuery({
      searchParams: searchParams.toString(),
      key: "page",
      value: pageValue,
    });
    router.push(newUrl, { scroll: false });
  };

  return (
    <section className="w-full max-w-full flex flex-col justify-center items-center mx-auto px-4 py-12 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="mb-8 sm:mb-10 md:mb-12 text-center w-full max-w-full">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white wrap-break-word">
          Recent Edits
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-gray-600 dark:text-gray-300 px-2">
          Browse through your recent image transformations and edits
        </p>
      </div>

      {hasSearch && (
        <div className="mb-8 max-w-full mx-auto">
          <Search />
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600 dark:text-gray-300">Loading...</div>
        </div>
      ) : images.length > 0 ? (
        <div className="space-y-8">
          <ul className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((image) => (
              <Card image={image} key={String(image._id)} />
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center">
              <div className="flex items-center space-x-2 rounded-full bg-white dark:bg-gray-800 px-4 py-2 shadow-md">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => onPageChange("prev")}
                  className="h-10 w-10 rounded-full p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  &larr;
                </Button>

                <span className="mx-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Page {page} of {totalPages}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => onPageChange("next")}
                  className="h-10 w-10 rounded-full p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  &rarr;
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <div className="mb-4 rounded-full bg-purple-100 p-4 dark:bg-purple-900/20">
            <svg
              className="h-8 w-8 text-purple-600 dark:text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {searchParams.get("query") ? "No results found" : "No images found"}
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {searchParams.get("query")
              ? "No images match your search. Try a different term."
              : "Your collection is empty. Start by uploading your first image."}
          </p>
        </div>
      )}
    </section>
  );
};

const Card = ({ image }: { image: IImage }) => {
  const transformation = transformationTypes[image.transformationType as TransformationTypeKey];

  return (
    <li className="group overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:bg-gray-800">
      <Link
        href={`/transformation/${image._id}`}
        className="block h-full"
      >
        <div className="relative aspect-square overflow-hidden">
          {image.transformationUrl ? (
            // Use the transformed image URL if available
            <img
              src={image.transformationUrl}
              alt={image.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            // Fallback to CldImage with transformation if transformationURL is not available
            <CldImage
              src={image.publicId}
              alt={image.title}
              width={400}
              height={400}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              {...(image.config || {})}
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="truncate font-medium">{image.title}</h3>
              <span className="mt-1 inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                {transformation?.title || 'Transformation'}
              </span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {image.title}
            </p>
            <div className="ml-2 shrink-0">
              <Image
                src={`/icons/${transformation?.icon || 'image.svg'}`}
                alt={transformation?.title || 'Image'}
                width={20}
                height={20}
                className="h-5 w-5 text-gray-400"
              />
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
};