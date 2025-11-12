import { Image, Eraser, Palette, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function Hero() {
  const features = [
    {
      title: "Image Restore",
      icon: Image,
      desc: "Revive damaged or low-quality images instantly.",
    },
    {
      title: "Generative Fill",
      icon: Sparkles,
      desc: "Use AI to fill missing areas realistically.",
    },
    {
      title: "Object Remove",
      icon: Eraser,
      desc: "Erase unwanted elements with precision.",
    },
    {
      title: "Object Recolor",
      icon: Palette,
      desc: "Change colors seamlessly with AI-driven accuracy.",
    },
  ];

  return (
    <section className="flex flex-col justify-center px-8 py-20 w-screen h-full bg-white text-gray-900">
      <div className="max-w-4xl mx-auto flex flex-col items-start gap-10">
        {/* Headings */}
        <div className="space-y-3">
          <h1 className="text-5xl font-semibold leading-tight">
            Bring Your Images to Life with{" "}
            <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Noctra AI
            </span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl">
            Edit, restore, and enhance your images effortlessly with powerful AI tools.
            Noctra helps you remove objects, recolor elements, and fill gaps like magic —
            all in one intuitive platform.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-wrap gap-4">
          <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-6 rounded-full text-lg shadow-lg hover:shadow-xl transition-all">
            Get Started
          </Button>
          <Button
            variant="outline"
            className="px-8 py-6 rounded-full border-gray-300 hover:bg-gray-100"
          >
            Learn More
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 w-full">
          {features.map(({ title, icon: Icon, desc }) => (
            <div
              key={title}
              className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <Icon className="w-8 h-8 text-purple-500 mb-4" />
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
