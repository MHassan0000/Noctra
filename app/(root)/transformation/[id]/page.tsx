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

      <main className="w-full max-w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 bg-white rounded-lg shadow-sm sm:shadow-md overflow-x-hidden mt-10">

        {/* META SECTION */}
        <section className="flex flex-col gap-4 rounded-2xl bg-white/60 p-4 sm:p-6 shadow-md sm:shadow-lg shadow-purple-100 backdrop-blur-sm sm:backdrop-blur-md md:flex-row md:items-center md:justify-between mx-auto w-full">
          <div className="space-y-1 text-center md:text-left">
            <p className="text-xl uppercase tracking-widest text-gray-400">
              Transformation
            </p>
            <p className="text-xl font-bold capitalize text-purple-600">
              {image.transformationType}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end mt-2 sm:mt-0">
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
        <section className="mt-6 rounded-2xl sm:rounded-3xl border border-purple-100 sm:border-purple-200 bg-white/70 p-4 sm:p-6 shadow-sm sm:shadow-lg shadow-purple-50 sm:shadow-purple-100 backdrop-blur-sm sm:backdrop-blur-xl mx-auto w-full">
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:gap-10 md:grid-cols-2">

            {/* ORIGINAL IMAGE */}
            <div className="space-y-3">
              <div className="group flex flex-col gap-3 sm:gap-4 relative overflow-hidden rounded-xl sm:rounded-2xl border border-purple-100 sm:border-purple-200 bg-purple-50/60 p-3 sm:p-4 shadow-inner transition-all duration-300 hover:-translate-y-1 hover:shadow-lg mx-auto w-full">
                <div className='flex-between'>

                  <h3 className="text-lg sm:text-3xl font-bold text-black sm:ml-3">
                    Original
                  </h3>
                  <div>

                  </div>

                </div>

                <Image
                  src={image.secureURL}
                  alt="Original Image"
                  width={getImageSize(image.transformationType, image, "width")}
                  height={getImageSize(image.transformationType, image, "height")}
                  className="h-full min-h-60 sm:min-h-72 w-full rounded-lg sm:rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
            </div>

            {/* TRANSFORMED IMAGE */}
            <div className="space-y-3">


              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-purple-100 sm:border-purple-200 bg-purple-50/70 p-3 sm:p-4 shadow-inner transition-all duration-300 hover:-translate-y-1 hover:shadow-lg mx-auto w-full">
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
            <div className="mt-8 sm:mt-10 flex flex-col gap-4 border-t border-gray-100 sm:border-gray-200 pt-4 sm:pt-6 md:flex-row md:items-center md:justify-between mx-auto w-full">
              <p className="text-xs sm:text-sm text-gray-500 text-center md:text-left">
                You can update or delete this transformation from your library.
              </p>

              <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row">

                {/* UPDATE BUTTON */}
                <button
                  type="button"
                  className="gradient-btn w-full px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold md:w-auto"
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
