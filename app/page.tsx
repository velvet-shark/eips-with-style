import { createClient } from "@/utils/supabase/server";

import { Navigation } from "@/components/navigation";

export default async function Index() {
  const supabase = createClient();
  const { data: proposals, error } = await supabase.from("proposals").select("*");

  if (error) {
    console.error("Error fetching proposals:", error);
  }

  return (
    <div className="h-full flex dark:bg-[#1F1F1F]">
      <Navigation proposals={proposals || []} />
      <main className="flex-1 h-full overflow-y-auto">
        <div className="flex-1 px-6 pb-10 items-center justify-center md:justify-start text-center gap-y-8">
          <h1 className="text-4xl font-bold">Homepage</h1>
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
        </div>
      </main>
    </div>
  );
}
