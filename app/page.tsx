import { createClient } from "@/utils/supabase/server";

import { Navigation } from "@/components/navigation";
// import { Button } from "@/components/ui/button";

export default async function Index() {
  const supabase = createClient();
  const { data: proposals, error } = await supabase.from("proposals").select("*");

  if (error) {
    console.error("Error fetching proposals:", error);
  }

  return (
    <div className="h-full flex">
      <Navigation proposals={proposals || []} />
      <main className="flex-1 h-full overflow-y-auto">
        <div className="flex-1 px-6 pb-10 items-center justify-center md:justify-start text-center gap-y-8">
          <h1 className="text-4xl font-bold">Proposals</h1>
          {proposals && proposals.length > 0 ? (
            <div>
              {proposals.map((proposal) => (
                <div key={proposal.id}>
                  <h3 className="font-semibold text-lg">
                    {proposal.proposal_type}-{proposal.number} {proposal.title}
                  </h3>
                  <p>{proposal.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No proposals found.</p>
          )}
        </div>
      </main>
    </div>
  );
}
