import { Skeleton } from "@/components/ui/skeleton";
import ClientNavigation from "@/components/client-navigation";

export default function Loading() {
  return (
    <div className="flex h-full dark:bg-[#1f1f1f]">
      <ClientNavigation />
      <main className="flex-1 h-full overflow-y-auto">
        <div className="flex-1 px-6 pb-10 items-center justify-center md:justify-start gap-y-8">
          <div className="pb-20">
            <div className="md:max-w-4xl lg:max-w-5xl mx-auto">
              <Skeleton className="h-12 w-3/4 mt-12 mb-2" />
              <Skeleton className="h-6 w-1/2 mb-4" />
              <Skeleton className="h-40 w-full mb-6" />
              <div className="flex flex-col gap-[3px]">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full mb-1" />
                ))}
              </div>
              <Skeleton className="h-96 w-full mt-6" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
