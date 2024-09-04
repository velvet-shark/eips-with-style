/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://eip.directory",
  generateRobotsTxt: true,
  exclude: ["/protected", "/login"],
  generateIndexSitemap: false,
  additionalPaths: async (config) => {
    const result = [];
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const { data: proposals } = await supabase.from("proposals").select("proposal_type, slug");

    proposals?.forEach((proposal) => {
      result.push({
        loc: `/${proposal.proposal_type.toLowerCase()}s/${proposal.slug}`,
        lastmod: new Date().toISOString()
      });
    });

    return result;
  }
};
