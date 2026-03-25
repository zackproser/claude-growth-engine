export default function ScriptPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-[#ccc] py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="border-b border-[#333] pb-6">
          <h1 className="text-3xl font-bold text-white">Demo Script</h1>
          <p className="text-sm text-[#666] mt-1">~19 min &middot; For presenter reference only</p>
        </div>

        {/* ── 1. INTRO PAGE ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#D97757]">You&rsquo;re on the /intro page &mdash; avatar + bullet points</h2>
          <ul className="list-disc list-inside space-y-1.5 text-lg leading-relaxed">
            <li>Staff developer &amp; AI engineer, 14+ years full-stack</li>
            <li><strong>Speaker &amp; workshop leader</strong> &mdash; designed and led an Anthropic cowork workshop on cold prospecting with Claude Code, with Lydia from the Claude Code team. See <a href="https://zackproser.com/speaking" target="_blank" rel="noopener noreferrer" className="underline text-[#D97757] hover:text-white">zackproser.com/speaking</a></li>
            <li>Currently on Applied AI team at WorkOS</li>
            <li>Building with Claude for 3 years &mdash; from the API to the Agent SDK</li>
            <li>From working at startups of every size &mdash; founders are pressed to show traction, catch early adopters, find PMF fast</li>
            <li><strong>That is why I built Claude Growth Engine</strong></li>
          </ul>
        </section>

        {/* ── 2. HOME PAGE ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#D97757]">Click through to the home page &mdash; app overview</h2>
          <ul className="list-disc list-inside space-y-1.5 text-lg leading-relaxed">
            <li>Complete solution &mdash; open source, full test suite, works out of the box, clone and run</li>
            <li>Takes outbounding &amp; lead prospecting completely off your plate</li>
            <li>Uses everything the Anthropic Agent SDK offers</li>
            <li>&ldquo;Let&rsquo;s take a look at how it works&rdquo;</li>
          </ul>
        </section>

        {/* ── 3. CLICK GET STARTED ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#D97757]">Click the Get Started button now</h2>
          <ul className="list-disc list-inside space-y-1.5 text-lg leading-relaxed">
            <li>First thing you do: grab your OpenAPI spec and upload it</li>
            <li>Using PayFlow as the example &mdash; like Stripe but focused on developer UX</li>
            <li>Empowers small-to-large businesses to simplify payment infra, close deals faster, boost MRR through subscriptions</li>
          </ul>
        </section>

        {/* ── 4. UPLOAD PAGE ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#D97757]">Upload the OpenAPI spec</h2>
          <ul className="list-disc list-inside space-y-1.5 text-lg leading-relaxed">
            <li>System instantly recognizes all endpoints + descriptions</li>
            <li>Already has a comprehensive knowledge of your service and how it can help someone</li>
            <li>&ldquo;Now that I&rsquo;ve uploaded my spec as the founder, all I need to do is provide the URL of the prospect&rdquo;</li>
          </ul>
        </section>

        {/* ── 5. PROSPECT URL ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#D97757]">Enter the prospect URL and let the agent run</h2>
          <ul className="list-disc list-inside space-y-1.5 text-lg leading-relaxed">
            <li>Using myself as the prospect &mdash; small business owner, premium tutorials, newsletter, consulting</li>
            <li>Pain point: always struggled with custom payment flows and handling Stripe checkout</li>
            <li>Agent reads the site, discovers more URLs, builds comprehensive profile</li>
            <li>~1 min 20 sec &mdash; detailed analysis with pain points, tech stack, key themes</li>
          </ul>
        </section>

        {/* ── 6. RESULTS: VERIFY RESEARCH ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#D97757]">Results are back &mdash; verify the research is accurate</h2>
          <ul className="list-disc list-inside space-y-1.5 text-lg leading-relaxed">
            <li>Manual milestone-based invoicing &mdash; 50% up front, 50% on delivery, tedious, all manual. <strong>True.</strong></li>
            <li>Mixed revenue streams, no unified billing layer. <strong>True.</strong></li>
            <li>Newsletter not fully monetized. <strong>True.</strong></li>
            <li>All lifted directly from the site &mdash; accurate without any human guidance</li>
          </ul>
        </section>

        {/* ── 7. OUTREACH SUITE ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#D97757]">Scroll through the outreach suite artifacts</h2>
          <ul className="list-disc list-inside space-y-1.5 text-lg leading-relaxed">
            <li><strong>Cold email</strong> &mdash; optimized, simple, speaks directly to their pain points</li>
            <li><strong>Value proposition</strong> &mdash; woven throughout every artifact</li>
            <li><strong>Bespoke demo page</strong> &mdash; built for this one prospect (show later)</li>
            <li><strong>LinkedIn message</strong> &mdash; ready to send</li>
            <li><strong>Agentic calling script</strong> &mdash; about to demo this live</li>
          </ul>
        </section>

        {/* ── 8. PHONE CALL ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#D97757]">Place the agentic voice call</h2>
          <ul className="list-disc list-inside space-y-1.5 text-lg leading-relaxed">
            <li>Look at the script &mdash; references the 50/50 milestone structure, asks if still tracking manually</li>
            <li>&ldquo;My ears would perk up &mdash; it feels fairly targeted&rdquo;</li>
            <li>Place the call &mdash; let the agent handle what founders don&rsquo;t feel like doing</li>
            <li>Uses my cloned founder voice</li>
            <li>Imagine this running 50, 100, 150 times in an hour outbound to real prospects</li>
          </ul>
        </section>

        {/* ── 9. POST-CALL ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#D97757]">Call done &mdash; show transcript &amp; intelligence</h2>
          <ul className="list-disc list-inside space-y-1.5 text-lg leading-relaxed">
            <li>Full transcript pulled and presented &mdash; scan exactly what each person said</li>
            <li>Agent decomposes learnings: new pain points (&ldquo;solo founder overwhelmed&rdquo;)</li>
            <li>Objections tracked (none in this case)</li>
            <li>Significant discovery work taken off our plates by the Agent SDK</li>
            <li>Agent decision log &mdash; why it said what it did</li>
          </ul>
        </section>

        {/* ── 10. DEMO PAGE ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#D97757]">Open the bespoke demo page for this prospect</h2>
          <ul className="list-disc list-inside space-y-1.5 text-lg leading-relaxed">
            <li>&ldquo;Some folks don&rsquo;t answer their phone &mdash; I&rsquo;m one of those people&rdquo;</li>
            <li>Put small business owner hat back on &mdash; got a short email, clicked the link</li>
            <li>Demo page shows significant research on my actual site and business</li>
            <li>Maps each pain point to how the service solves it with specific API endpoints</li>
            <li>Manual invoicing &rarr; POST to PayFlow. Mixed revenue &rarr; subscriptions. Newsletter &rarr; billing API.</li>
            <li>&ldquo;As a small business owner, I would find this incredibly compelling&rdquo;</li>
            <li>Code snippets in Go and Node.js &mdash; grab and try</li>
            <li>Feedback form &mdash; fire off questions about the service</li>
          </ul>
        </section>

        {/* ── 11. TRACKING PAGE ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#D97757]">Navigate to the tracking &amp; lead scoring page</h2>
          <ul className="list-disc list-inside space-y-1.5 text-lg leading-relaxed">
            <li>What does the busy founder see? All activity across the system</li>
            <li>System automatically elevates leads worth your time to the top</li>
            <li>Hot leads: answered call, API interactions, sent feedback, asked questions</li>
            <li>&ldquo;This is the definition of someone super engaged &mdash; follow up now&rdquo;</li>
            <li>Agent log &mdash; who was called, when, what they said, decisions</li>
            <li>CSV export + Google Sheets MCP integration for team reporting</li>
            <li>Single source of truth spreadsheet that auto-updates</li>
          </ul>
        </section>

        {/* ── 12. GITHUB REPO ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#D97757]">Switch to GitHub &mdash; show the open-source repo</h2>
          <ul className="list-disc list-inside space-y-1.5 text-lg leading-relaxed">
            <li>Completely open source, full test suite that passes</li>
            <li>&ldquo;Ready for you to fork, modify, and deploy for your own business&rdquo;</li>
            <li>Upload spec &rarr; pick target &rarr; hand off to Agent SDK &rarr; complete growth suite</li>
            <li>Walk through the architecture diagram</li>
            <li>Agent SDK uses Web Search, Web Fetch, MCP tools + extensions</li>
            <li>ElevenLabs SDK for phone calls, post-call analysis, uniform analytics, lead scoring</li>
          </ul>
        </section>

        {/* ── 13. TERMINAL — LIVE EXTENSION ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#D97757]">Switch to Terminal &mdash; &ldquo;this is not idle talk&rdquo;</h2>
          <ul className="list-disc list-inside space-y-1.5 text-lg leading-relaxed">
            <li>&ldquo;When I say you can extend this for your actual business, that is not idle talk&rdquo;</li>
            <li>Pretend we&rsquo;re in a room with 30 founders working on different things</li>
            <li>Solicit feedback: &ldquo;What would you need to deploy this in your business today?&rdquo;</li>
            <li><strong>Extension 1:</strong> Resend integration &mdash; emails automatically sent as they&rsquo;re drafted</li>
            <li><strong>Extension 2:</strong> Slack <code className="bg-[#222] px-1.5 py-0.5 rounded text-[#D97757]">/prospect</code> slash command &mdash; name, URL, or company triggers the growth engine</li>
            <li>&ldquo;This is actually software you could use today, not a toy demo app&rdquo;</li>
            <li>Use Whisperflow to voice-dictate the request into Claude Code</li>
            <li>Put Claude in plan mode, fire off &mdash; &ldquo;now we&rsquo;re off to the races&rdquo;</li>
            <li>Claude builds comprehensive plan for both features</li>
            <li>7-15 min to have a new version with both features working</li>
          </ul>
        </section>

        {/* ── 14. FINAL OUTRO — THE VIDEO ── */}
        <section className="space-y-3 border-t border-[#333] pt-8">
          <h2 className="text-xl font-semibold text-[#D97757] text-2xl">DO NOT FORGET &mdash; mention the backup video</h2>
          <p className="text-lg text-white leading-relaxed italic">&ldquo;One last thing before we open it up &mdash;&rdquo;</p>
          <ul className="list-disc list-inside space-y-1.5 text-lg leading-relaxed">
            <li>&ldquo;I also wanted to share that I came today with a fully recorded 20-minute version of this entire demo &mdash; the same flow, the same features, everything you just saw.&rdquo;</li>
            <li>&ldquo;I like to come prepared. If there&rsquo;s ever API instability or something doesn&rsquo;t cooperate live, I want to make sure I can still show you exactly how everything works.&rdquo;</li>
            <li>&ldquo;Fortunately we didn&rsquo;t need it today &mdash; but I wanted you to know it&rsquo;s there.&rdquo;</li>
            <li><em>If something DID fail:</em> &ldquo;And actually, since we hit a hiccup with [X], let me pull up the recorded version so you can see exactly how that part works when everything&rsquo;s running clean.&rdquo;</li>
          </ul>
        </section>

        {/* ── 15. TRANSITION TO Q&A ── */}
        <section className="space-y-3 border-t border-[#333] pt-8">
          <h2 className="text-xl font-semibold text-[#D97757]">Open it up to Q&amp;A</h2>
          <ul className="list-disc list-inside space-y-1.5 text-lg leading-relaxed">
            <li>&ldquo;That&rsquo;s all you need to get Claude Growth Engine powered by the Anthropic Agent SDK working for your business&rdquo;</li>
          </ul>
        </section>

        <div className="h-24" />
      </div>
    </div>
  );
}
