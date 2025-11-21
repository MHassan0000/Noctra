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

      <section className="mt-10 m-5 mx-auto p-4  bg-white rounded-lg shadow-md xm:w-[300px] sm:w-[400px] md:w-[1000px]">
        <TransformationForm
          action="Update"
          userId={user._id}
          type={image.transformationType as TransformationTypeKey}
          creditBalance={user.creditBalance}
          config={image.config}
          data={image}
        />
      </section>
    </>
  );
};

export default Page;