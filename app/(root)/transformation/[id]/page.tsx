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

      <main className="mx-auto mt-6 w-full max-w-5xl space-y-8 px-4 pb-10 md:px-6">
        {/* META */}
        <section className="flex flex-col items-center gap-3 text-center md:flex-row md:items-baseline md:justify-between md:text-left">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.25em] text-dark-400">Transformation</p>
            <p className="text-sm font-semibold capitalize text-purple-500">
              {image.transformationType}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:justify-end">
            {image.prompt && (
              <span className="rounded-full bg-dark-300/10 px-3 py-1 text-dark-500">
                <span className="font-semibold text-dark-600">Prompt:</span> {image.prompt}
              </span>
            )}

            {image.color && (
              <span className="rounded-full bg-dark-300/10 px-3 py-1 text-dark-500">
                <span className="font-semibold text-dark-600">Color:</span> {image.color}
              </span>
            )}

            {image.aspectRatio && (
              <span className="rounded-full bg-dark-300/10 px-3 py-1 text-dark-500">
                <span className="font-semibold text-dark-600">Aspect Ratio:</span> {image.aspectRatio}
              </span>
            )}
          </div>
        </section>

        {/* IMAGES */}
        <section className="rounded-2xl border border-dark-400/15 bg-dark-100/30 p-4 shadow-sm shadow-purple-100/40 backdrop-blur-sm md:p-6">
          <div className="grid h-fit min-h-[220px] grid-cols-1 gap-6 md:grid-cols-2">
            {/* MEDIA UPLOADER */}
            <div className="flex flex-col gap-3">
              <div className="group relative overflow-hidden rounded-xl border border-dashed border-purple-200/70 bg-purple-50/70 p-2 shadow-inner transition duration-200 hover:-translate-y-[2px] hover:shadow-md hover:shadow-purple-100">
                <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-dark-600 shadow-sm">
                  Original
                </span>

                <Image
                  src={image.secureURL}
                  alt="image"
                  width={getImageSize(image.transformationType, image, "width")}
                  height={getImageSize(image.transformationType, image, "height")}
                  className="h-full min-h-72 w-full rounded-[10px] object-cover transition duration-200 group-hover:scale-[1.01]"
                />
              </div>
            </div>

            {/* TRANSFORMED IMAGE */}
            <div className="flex flex-col gap-3">
              <div className="relative rounded-xl border border-purple-200 bg-purple-50/80 p-2 shadow-inner transition duration-200 hover:-translate-y-[2px] hover:shadow-md hover:shadow-purple-100">
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

          {userId === image.author.clerkId && (
            <div className="mt-6 flex flex-col gap-3 border-t border-dark-400/10 pt-4 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-dark-500">You can update or delete this transformation from your library.</p>

              <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
                <Button
                  asChild
                  type="button"
                  className="bg-purple-gradient bg-cover rounded-full py-3 px-6 p-16-semibold h-[46px] w-full text-sm md:h-[48px] md:w-auto capitalize transition hover:brightness-110"
                >
                  <Link href={`/transformations/${image._id}/update`}>
                    Update Image
                  </Link>
                </Button>

                <div className="w-full md:w-auto">
                  <DeleteConfirmation imageId={image._id} />
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default ImageDetails;