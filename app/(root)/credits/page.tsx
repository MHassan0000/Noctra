import { auth } from "@clerk/nextjs/server";
import { SignedIn } from "@clerk/nextjs";
import Image from "next/image";
import { redirect } from "next/navigation";

import Header from "@/app/components/shared/header";
import { Button } from "@/app/components/ui/button";
import { plans } from "@/constants";
import { getUserById } from "@/lib/actions/user.actions";
import Checkout from "@/app/components/shared/Checkout";

const Credits = async () => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);

  return (
    <>
      <Header
        title="Buy Credits"
        subtitle="Choose a credit package that suits your needs!"
      />

      <section className="container mx-auto px-4 py-16">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {plans.map((plan) => (
            <li
              key={plan.name}
              className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all hover:shadow-2xl dark:bg-gray-900 dark:border-gray-700"
            >
              {/* Top Section */}
              <div className="flex flex-col items-center text-center gap-4">
                <Image
                  src={plan.icon}
                  alt={plan.name}
                  width={60}
                  height={60}
                  className="mb-2"
                />

                <p className="text-xl font-semibold text-purple-600">
                  {plan.name}
                </p>

                <p className="text-5xl font-extrabold text-gray-900 dark:text-white">
                  ${plan.price}
                </p>

                <p className="text-base text-gray-600 dark:text-gray-300">
                  {plan.credits} Credits
                </p>
              </div>

              {/* Inclusions */}
              <ul className="mt-8 flex flex-col gap-4">
                {plan.inclusions.map((inclusion) => (
                  <li
                    key={plan.name + inclusion.label}
                    className="flex items-center gap-3"
                  >
                    <Image
                      src={`/icons/${
                        inclusion.isIncluded ? "check.svg" : "cross.svg"
                      }`}
                      alt="icon"
                      width={22}
                      height={22}
                    />

                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {inclusion.label}
                    </p>
                  </li>
                ))}
              </ul>

              {/* Action */}
              <div className="mt-10">
                {plan.name === "Free" ? (
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-gray-800"
                  >
                    Free Consumable
                  </Button>
                ) : (
                  <SignedIn>
                    <Checkout
                      plan={plan.name}
                      amount={plan.price}
                      credits={plan.credits}
                      buyerId={user._id}
                    />
                  </SignedIn>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};

export default Credits;
