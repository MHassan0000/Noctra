import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";

import { CollectionDisplay } from "@/app/components/shared/CollecionDisplay";
import { Header } from "@/app/components/shared/header";
import { getUserImages } from "@/lib/actions/image.actions";
import { getUserById } from "@/lib/actions/user.actions";

const Profile = async ({ searchParams }: SearchParamProps) => {
  const page = Number(searchParams?.page) || 1;
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);
  const images = await getUserImages({ page, userId: user._id });

  return (
    <>
      <Header
        title="Your Profile"
        subtitle="Manage your credits, track activity, and view your generated images."
      />

      {/* Stats Section */}
      <section className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        
        {/* Credits Available */}
        <div className="rounded-2xl border bg-white shadow-sm px-6 py-8 dark:bg-gray-900 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            CREDITS AVAILABLE
          </p>

          <div className="mt-5 flex items-center gap-4">
            <Image
              src="/icons/coins.svg"
              alt="credits"
              width={40}
              height={40}
              className="opacity-80"
            />
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              {user.creditBalance}
            </h2>
          </div>
        </div>

        {/* Image Manipulation Count */}
        <div className="rounded-2xl border bg-white shadow-sm px-6 py-8 dark:bg-gray-900 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            IMAGE EDITS COMPLETED
          </p>

          <div className="mt-5 flex items-center gap-4">
            <Image
              src="/icons/photo.svg"
              alt="edits"
              width={40}
              height={40}
              className="opacity-80"
            />
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              {images?.data.length}
            </h2>
          </div>
        </div>
      </section>

      {/* Collection Section */}
      <section className="mt-10">
        <CollectionDisplay
          images={images?.data}
          totalPages={images?.totalPages}
          page={page}
        />
      </section>
    </>
  );
};

export default Profile;
