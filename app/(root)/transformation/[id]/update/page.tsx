import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import Header from "@/app/components/shared/header";
import TransformationForm from "@/app/components/shared/transformationForm";
import { transformationTypes } from "@/constants";
import { getUserById } from "@/lib/actions/user.actions";
import { getImageById } from "@/lib/actions/image.actions";

const Page = async ({ params }: SearchParamProps) => {
  const {id} = await (params as any);
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);
  const image = await getImageById(id);

  const transformation =
    transformationTypes[image.transformationType as TransformationTypeKey];

  return (
    <>
      <Header title={transformation.title} subtitle={transformation.subTitle} />

      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 bg-white rounded-lg shadow-sm sm:shadow-md">
        <div className="w-full max-w-4xl mx-auto">
          <TransformationForm
            action="Update"
            userId={user._id}
            type={image.transformationType as TransformationTypeKey}
            creditBalance={user.creditBalance}
            config={image.config}
            data={image}
          />
        </div>
      </section>
    </>
  );
};

export default Page;