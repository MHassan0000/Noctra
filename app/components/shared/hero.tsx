import { Button } from "../../components/ui/button";
import { features } from "../../../constants/index";
import Link from "next/link";

export default function Hero() {

  return (
    <section className="w-full bg-white text-gray-900 mt-15 md:mt-10" style={{ overflowX: 'hidden', width: '100%', maxWidth: '100%' }}>
      <div className="w-full max-w-full mx-auto" style={{ overflowX: 'hidden', maxWidth: '100%' }}>
        <div className="w-full mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20 max-w-full" style={{ overflowX: 'hidden', maxWidth: '100%' }}>
          <div className="w-full max-w-5xl mx-auto" style={{ overflowX: 'hidden', maxWidth: '100%' }}>
            <div className="flex flex-col items-center gap-6 sm:gap-8 md:gap-10 w-full" style={{ overflowX: 'hidden', width: '100%', maxWidth: '100%' }}>
              {/* Headings */}
              <div className="text-center space-y-2 sm:space-y-3 w-full px-3 sm:px-4 md:px-6" style={{ overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold leading-tight w-full" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', overflowX: 'hidden', maxWidth: '100%', boxSizing: 'border-box', hyphens: 'auto' }}>
                  Bring Your Images to Life with{" "}
                  <span className="bg-linear-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', display: 'inline' }}>
                    Noctra AI
                  </span>
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl max-w-2xl mx-auto px-1 sm:px-2 leading-relaxed" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', overflowX: 'hidden', boxSizing: 'border-box' }}>
                  Edit, restore, and enhance your images effortlessly with powerful AI tools.
                  Noctra helps you remove objects, recolor elements, and fill gaps like magic —
                  all in one intuitive platform.
                </p>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-2.5 sm:gap-3 md:gap-4 w-full px-3 sm:px-4 md:px-6" style={{ overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                <Button
                  className="bg-linear-to-r from-purple-600 to-indigo-600 text-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 lg:py-5 rounded-full text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl transition-all w-full sm:w-auto text-center min-w-0"
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 lg:py-5 rounded-full border-gray-300 hover:bg-gray-100 w-full sm:w-auto text-center min-w-0 text-sm sm:text-base md:text-lg"
                >
                  Learn More
                </Button>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full mt-6 sm:mt-8 md:mt-12 px-3 sm:px-4 md:px-6" style={{ overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                {features.map(({ title, icon: Icon, desc, path }) => (
                  <Link
                    href={path}
                    key={title}
                    className="p-3 sm:p-4 md:p-5 lg:p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all h-full w-full overflow-x-hidden"
                    style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-500 mb-2 sm:mb-3 md:mb-4 shrink-0" />
                    <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-1 sm:mb-2 overflow-x-hidden" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>{title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 overflow-x-hidden" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>{desc}</p>
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
