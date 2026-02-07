import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";
import { CollectionDisplay } from "@/app/components/shared/CollecionDisplay";
import Header from "@/app/components/shared/header";
import { getUserImages } from "@/lib/actions/image.actions";
import { getUserById } from "@/lib/actions/user.actions";

const Profile = async ({ searchParams }: SearchParamProps) => {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);
  const images = await getUserImages({ page, userId: user._id });

  const imageData = images?.data || [];
  const totalPages = images?.totalPages || 1;

  return (
    <div className="w-full min-h-screen bg-white overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header
          title="Your Profile"
          subtitle="Manage your credits, track activity, and view your generated images."
        />

        {/* Stats Section */}
        <section className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:max-w-4xl lg:mx-auto">
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
                {imageData.length}
              </h2>
            </div>
          </div>
        </section>

        {/* Collection Section */}
        <section className="mt-10 w-full">
          <CollectionDisplay
            initialImages={imageData}
            initialTotalPages={totalPages}
            initialPage={page}
          />
        </section>
      </div>
    </div>
  );
};

export default Profile;
