import { Button } from "../../components/ui/button";
import { features } from "../../../constants/index";
import Link from "next/link";
import { SignedIn } from "@clerk/nextjs";


export default function Hero() {

  return (
    <section className="w-full bg-white text-gray-900 pt-6 md:pt-8 lg:pt-10 overflow-hidden mt-15">
      <div className="w-full max-w-full mx-auto px-2 sm:px-3 md:px-4 lg:px-6 overflow-hidden">
        <div className="w-full max-w-5xl mx-auto py-4 sm:py-6 md:py-8 lg:py-12">
          <div className="flex flex-col items-center gap-4 sm:gap-5 md:gap-6 w-full">
            {/* Headings */}
            <div className="text-center space-y-2 sm:space-y-3 w-full px-1">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold leading-tight w-full px-2">
                <span className="block">Bring Your Images to Life</span>
                <span className="bg-linear-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                  with Noctra AI
                </span>
              </h1>
              <p className="text-sm xs:text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-2 mt-2">
                <span className="block sm:inline">Edit, restore, and enhance your images</span>
                <span className="block sm:inline">effortlessly with powerful AI tools.</span>
                <span className="block sm:inline">Noctra helps you remove objects, recolor elements,</span>
                <span className="block sm:inline">and fill gaps like magic — all in one intuitive platform.</span>
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col xs:flex-row flex-wrap justify-center items-center gap-3 w-full max-w-xl mx-auto px-2">
              <Button
                className="bg-linear-to-r from-purple-600 to-indigo-600 text-white px-7 py-4 rounded-full text-sm sm:text-base shadow hover:shadow-md transition-all w-auto min-w-[120px] text-center"
              >
                <Link href="/sign-in">Get Started</Link>
              </Button>
              <Button

                variant="outline"
                className="px-7 py-4 rounded-full border-gray-200 hover:bg-gray-200 w-auto min-w-[120px] text-center text-sm sm:text-base"

              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>

            {/* Feature Cards */}
            <SignedIn>

              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full mt-4 sm:mt-6 md:mt-8">
                {features.map(({ title, icon: Icon, desc, path }) => (
                  <Link
                    href={path}
                    key={title}
                    className="p-3 sm:p-4 rounded-lg bg-white border border-gray-100 shadow-xs hover:shadow-sm transition-all h-full w-full flex flex-col items-center text-center"
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 mb-2 sm:mb-3" />
                    <h3 className="font-semibold text-xs xs:text-sm sm:text-base mb-1.5 wrap-break-word">{title}</h3>
                    <p className="text-[11px] xs:text-xs sm:text-sm text-gray-500 wrap-break-word leading-tight max-w-[200px] mx-auto">{desc}</p>
                  </Link>
                ))}
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </section>
  );
}
