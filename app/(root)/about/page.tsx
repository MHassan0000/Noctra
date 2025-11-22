import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="container mx-auto px-6 py-20">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          About Our Platform
        </h1>

        <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
          A modern AI-powered image editing platform built using Cloudinary,
          Next.js, and state-of-the-art machine learning models to help
          creators, developers, and businesses transform visuals effortlessly.
        </p>
      </section>

      {/* Why We Exist */}
      <section className="mt-20 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Why We Built This
          </h2>
          <p className="mt-5 text-gray-600 dark:text-gray-300 leading-relaxed">
            Traditional photo editors are slow, complicated, and require
            expensive hardware. Our mission is to make advanced AI image
            processing accessible to everyone — directly in the cloud, with
            instant results and zero learning curve.
          </p>

          <ul className="mt-8 space-y-4">
            <li className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-purple-500"></span>
              <p className="text-gray-600 dark:text-gray-300">
                Lightning-fast Cloudinary transformations
              </p>
            </li>
            <li className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-purple-500"></span>
              <p className="text-gray-600 dark:text-gray-300">
                AI-powered enhancements, background removal & restoration
              </p>
            </li>
            <li className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-purple-500"></span>
              <p className="text-gray-600 dark:text-gray-300">
                Built for creators, developers & businesses
              </p>
            </li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Image
            src="/images/logo.svg"
            alt="AI Editing"
            width={500}
            height={500}
            className="rounded-2xl shadow-xl object-cover"
          />
        </div>
      </section>

      {/* Technology */}
      <section className="mt-28">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
          Technology Behind the Platform
        </h2>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <h3 className="text-xl font-semibold text-purple-600">
              Cloudinary
            </h3>
            <p className="mt-3 text-gray-600 dark:text-gray-300">
              Handles secure image storage, transformations, CDN delivery, and
              real-time optimization.
            </p>
          </div>

          <div className="p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <h3 className="text-xl font-semibold text-purple-600">Next.js 16</h3>
            <p className="mt-3 text-gray-600 dark:text-gray-300">
              Powers the server-side rendering, API routes, authentication, and
              app-level routing.
            </p>
          </div>

          <div className="p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <h3 className="text-xl font-semibold text-purple-600">AI Models</h3>
            <p className="mt-3 text-gray-600 dark:text-gray-300">
              State-of-the-art ML models handle enhancement, restoration,
              generative edits, and more.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
