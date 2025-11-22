import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import Header from "@/app/components/shared/header";
import Sidebar from "@/app/components/shared/sidebar";
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
      <div className="min-h-screen w-full bg-white overflow-x-hidden ">
        <div className="w-full mx-auto max-w-full">
          <div className="flex w-full">
            <div className="hidden md:block shrink-0">
              <Sidebar />
            </div>
            <div className="flex-1 min-w-0 w-full md:pl-20 mx-auto max-w-full overflow-x-hidden">
              <Header title={transformation.title} subtitle={transformation.subTitle} />

              <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 bg-white rounded-lg shadow-sm sm:shadow-md">
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;