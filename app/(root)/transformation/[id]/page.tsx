import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

import Header from "@/app/components/shared/header";
import TransformedImage from "@/app/components/shared/TransformedImage";
import { Button } from "@/app/components/ui/button";
import { getImageById } from "@/lib/actions/image.actions";
import { getImageSize } from "@/lib/utils";
import { DeleteConfirmation } from "@/app/components/shared/DeleteConfirmation";

const ImageDetails = async ({ params }: SearchParamProps) => {
  const { id } = await (params as any);
  const { userId } = await auth();

  const image = await getImageById(id);

  return (
    <>
      <Header title={image.title} />

      <main className="m-5 mx-auto p-4 mt-10  bg-white rounded-lg shadow-md xm:w-[300px] sm:w-[400px] md:w-[1000px]">

        {/* META SECTION */}
        <section className="flex flex-col gap-4 rounded-2xl bg-white/60 p-6 shadow-lg shadow-purple-100 backdrop-blur-md md:flex-row md:items-center md:justify-between">
          <div className="space-y-1 text-center md:text-left">
            <p className="text-xl uppercase tracking-widest text-gray-400">
              Transformation
            </p>
            <p className="text-xl font-bold capitalize text-purple-600">
              {image.transformationType}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
            {image.prompt && (
              <span className="chip">
                <strong>Prompt:</strong> {image.prompt}
              </span>
            )}

            {image.color && (
              <span className="chip">
                <strong>Color:</strong> {image.color}
              </span>
            )}

            {image.aspectRatio && (
              <span className="chip">
                <strong>Aspect Ratio:</strong> {image.aspectRatio}
              </span>
            )}
          </div>
        </section>

        {/* IMAGE COMPARISON */}
        <section className="rounded-3xl border border-purple-200 bg-white/70 p-6 shadow-xl shadow-purple-100 backdrop-blur-xl">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">

            {/* ORIGINAL IMAGE */}
            <div className="space-y-3">
              <div className="group relative overflow-hidden rounded-2xl border border-purple-200 bg-purple-50/60 p-3 shadow-inner transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <p className="absolute left-4 top-4 z-10 h3-bold text-gray-700 drop-shadow-sm">
                  Original
                </p>

                <Image
                  src={image.secureURL}
                  alt="Original Image"
                  width={getImageSize(image.transformationType, image, "width")}
                  height={getImageSize(image.transformationType, image, "height")}
                  className="h-full min-h-72 w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
            </div>

            {/* TRANSFORMED IMAGE */}
            <div className="space-y-3">
              

              <div className="relative overflow-hidden rounded-2xl border border-purple-200 bg-purple-50/70 p-3 shadow-inner transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <TransformedImage
                  image={image}
                  type={image.transformationType}
                  title={image.title}
                  isTransforming={false}
                  transformationConfig={image.config}
                  hasDownload={true}
                />
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          {userId === image.author.clerkId && (
            <div className="mt-10 flex flex-col gap-4 border-t border-gray-200 pt-6 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-gray-500">
                You can update or delete this transformation from your library.
              </p>

              <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row">

                {/* UPDATE BUTTON */}
                <button
                 
                  type="button"
                  className="gradient-btn w-full px-6 py-4 text-sm font-bold md:w-auto"
                >
                  <Link href={`/transformation/${image._id}/update`}>
                    Update Image
                  </Link>
                </button>

                {/* DELETE BUTTON */}
                <div className="w-full md:w-auto">
                  <DeleteConfirmation imageId={image._id} />
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* EXTRA GLOBAL STYLES FOR CHIPS + BUTTONS */}
      <style>{`
        .chip {
          background: rgba(139, 92, 246, 0.08);
          border: 1px solid rgba(139, 92, 246, 0.2);
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          color: #6b6b6b;
        }

        .gradient-btn {
          background: linear-gradient(135deg, #a855f7, #7c3aed);
          color: white;
          border-radius: 999px;
          transition: all .25s ease;
        }

        .gradient-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
      `}</style>
    </>
  );
};

export default ImageDetails;
