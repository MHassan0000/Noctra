"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";

export const InsufficientCreditsModal = () => {
  const router = useRouter();

  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent className="max-w-md sm:max-w-lg md:max-w-xl w-[calc(100%-2rem)] mx-auto">
        <AlertDialogHeader className="space-y-4 sm:space-y-6">
          {/* Header with title and close button */}
          <div className="flex items-center justify-between w-full">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">
              Insufficient Credits
            </h3>
            <AlertDialogCancel
              className="border-0 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              onClick={() => router.push("/profile")}
            >
              <Image
                src="/icons/close.svg"
                alt="Close"
                width={20}
                height={20}
                className="cursor-pointer"
              />
            </AlertDialogCancel>
          </div>

          {/* Image container - centered and responsive */}
          <div className="flex justify-center items-center w-full py-2 sm:py-4">
            <div className="relative w-full max-w-[280px] sm:max-w-[350px] md:max-w-[400px] aspect-462/122">
              <Image
                src="/images/stacked-coins.png"
                alt="Credit coins"
                fill
                className="object-contain"
                sizes="(max-width: 640px) 280px, (max-width: 768px) 350px, 400px"
              />
            </div>
          </div>

          {/* Title */}
          <AlertDialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white leading-tight px-2">
            Oops.... Looks like you&#39;ve run out of free credits!
          </AlertDialogTitle>

          {/* Description */}
          <AlertDialogDescription className="text-sm sm:text-base text-center text-gray-600 dark:text-gray-400 px-2 sm:px-4 leading-relaxed">
            No worries, though - you can keep enjoying our services by grabbing
            more credits.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Footer with buttons */}
        <AlertDialogFooter className="flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6">
          <AlertDialogCancel
            className="w-full sm:w-auto order-2 sm:order-1 py-3 px-6 rounded-full font-semibold text-sm sm:text-base focus-visible:ring-offset-0 focus-visible:ring-transparent bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
            onClick={() => router.push("/profile")}
          >
            No, Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="w-full sm:w-auto order-1 sm:order-2 py-3 px-6 rounded-full font-semibold text-sm sm:text-base focus-visible:ring-offset-0 focus-visible:ring-transparent bg-purple-gradient bg-cover text-black hover:text-white hover:opacity-90 transition-opacity shadow-md hover:shadow-lg"
            onClick={() => router.push("/credits")}
          >
            Yes, Proceed
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};