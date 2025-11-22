import { Button } from "../../components/ui/button";
import { features } from "../../../constants/index";
import Link from "next/link";

export default function Hero() {

  return (
    <section className="w-full bg-white text-gray-900 mt-15 md:mt-10 overflow-x-hidden">
      <div className="w-full max-w-full mx-auto">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 max-w-full">
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex flex-col items-center gap-8 md:gap-10 w-full">
              {/* Headings */}
              <div className="text-center space-y-3 w-full px-2">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight break-words">
                  Bring Your Images to Life with{" "}
                  <span className="bg-linear-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                    Noctra AI
                  </span>
                </h1>
                <p className="text-gray-600 text-base sm:text-lg md:text-xl max-w-2xl mx-auto break-words">
                  Edit, restore, and enhance your images effortlessly with powerful AI tools.
                  Noctra helps you remove objects, recolor elements, and fill gaps like magic —
                  all in one intuitive platform.
                </p>
              </div>

              {/* CTA */}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 w-full">
                <Button
                  className="bg-linear-to-r from-purple-600 to-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 md:py-5 rounded-full text-base sm:text-lg shadow-lg hover:shadow-xl transition-all w-full sm:w-auto text-center"
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  className="px-6 sm:px-8 py-3 sm:py-4 md:py-5 rounded-full border-gray-300 hover:bg-gray-100 w-full sm:w-auto text-center"
                >
                  Learn More
                </Button>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full mt-8 sm:mt-12">
                {features.map(({ title, icon: Icon, desc, path }) => (
                  <Link
                    href={path}
                    key={title}
                    className="p-4 sm:p-5 md:p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all h-full"
                  >
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-purple-500 mb-3 sm:mb-4" />
                    <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">{desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
