"use client";

import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { ResidentHeader } from "@/components/navigation/ResidentHeader";
import { ChevronUpIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react";
import { Card } from "@/components/ui/Card";
import { useState } from "react";
import { HowItWorksVideo } from "@/components/tutorial/HowItWorksVideo";

export default function HelpAndSupportPage() {
  const [openKey, setOpenKey] = useState(null);

  // Keep these in line with docs/business-rules.md and docs/request-lifecycle.md
  const faqs = [
    {
      key: "submit",
      question: "How do I submit my recyclables for pickup?",
      answer: `Tap the camera button at the bottom of the Home screen and take a clear photo of your recyclables. Tap "Analyze Photo" and the app will suggest the material and an estimated amount, or choose "Fill in manually" if you prefer. Check the details, pick "Single material" or "Mixed or assorted material", then tap "Submit Request".`,
    },
    {
      key: "materials",
      question: "What recyclables are accepted?",
      answer: `Plastics, papers, glass and metals, like PET bottles, cans, cardboard, newspaper and glass bottles. The full list is under "Accepted Materials" on the Home screen. If your items are mixed, submit them as "Mixed or assorted material". Please make sure they are clean and dry, since wet or dirty items may be declined.`,
    },
    {
      key: "estimate",
      question: "Does the estimated amount have to be exact?",
      answer: `No. The amount you enter, or the one suggested by the photo analysis, is only an estimate. The collector checks, sorts and weighs your recyclables during pickup, and the actual amount is what gets recorded.`,
    },
    {
      key: "statuses",
      question: "What do the request statuses mean?",
      answer: `Pending: waiting for the barangay to review.
Approved: accepted and waiting to be scheduled.
In Progress: scheduled for collection.
Collected: picked up and recorded as your contribution.
Rejected: declined, with the reason shown in your request.
Cancelled: you withdrew it.
Expired: no one acted on it within 2 days.

You get a notification whenever your request moves to a new status.`,
    },
    {
      key: "schedule",
      question: "When will my recyclables be picked up?",
      answer: `Your barangay reviews each request and sets the collection schedule, so the timing depends on your barangay. You will be notified once your request is approved and again when it is scheduled for collection.`,
    },
    {
      key: "expired",
      question: "Why did my request expire?",
      answer: `A request that stays pending for more than 2 days without being reviewed expires automatically. You can simply submit a new request, or contact your barangay if it keeps happening.`,
    },
    {
      key: "cancel",
      question: "Can I cancel my request?",
      answer: `Yes, but only while it is still Pending. Open the request from the Requests page and tap "Cancel Request". Once the barangay has approved it, it can no longer be cancelled.`,
    },
    {
      key: "dropoff",
      question: "I brought my recyclables to the barangay hall or a collection event. Does it count?",
      answer: `Yes. Give your name to the staff so they can record it under your account. It counts toward your contribution and your standing, just like a pickup.`,
    },
    {
      key: "contribution",
      question: "Do I earn points from pickup requests?",
      answer: `No. Pickups and drop-offs count as your contribution to the community, shown in kilograms on your Home screen and in the Standings. Points or cash come only from your barangay's redemption programs.`,
    },
    {
      key: "programs",
      question: "How do redemption programs work?",
      answer: `Redemption programs are run by your barangay, for example rice for recyclables or school supplies for students. You bring your recyclables to the program, the barangay staff records them, and you earn points or cash depending on the program. Each program sets its own rate per material, which you can see on the Programs page.`,
    },
    {
      key: "points",
      question: "How do I use my points?",
      answer: `Your points belong to the program where you earned them. Claim one of that program's available rewards from your barangay staff, and the points are deducted. Points from one program cannot be used for another program's rewards.`,
    },
    {
      key: "locked",
      question: "Why can't I see programs, points or standings yet?",
      answer: `These unlock after your first contribution is recorded, whether from a collected pickup, a drop-off recorded by the barangay, or a redemption program. Until then, your account shows as not yet verified.`,
    },
    {
      key: "standings",
      question: "How are the standings ranked?",
      answer: `Residents are ranked by the total recyclables recorded under their account, by kilogram or by piece. Pickups, drop-offs and redemption program entries all count.`,
    },
    {
      key: "barangay",
      question: "Why can't I change my registered barangay?",
      answer: `Your barangay is fixed so your requests and contributions go to the right office. If you moved to a different barangay, please contact your barangay office to update your account.`,
    },
    {
      key: "contact",
      question: "How do I contact my barangay?",
      answer: `Open the Barangay tab at the bottom of the screen to find your barangay's contact number.`,
    },
  ];

  const toggleFaq = (key) => {
    setOpenKey((prev) => (prev === key ? null : key));
  };

  return (
    <Page className="bg-bg! overflow-hidden">
      <ResidentHeader
        title={"Help & Support"}
        className="bg-bg! shadow-none!"
      />

      <PageContent className="md:p-4! md:mt-16!">
        <div className="">
          <div className="font-medium pt-3 text-sm flex flex-col gap-2">
            <h2 className="">How EcoAid works</h2>
            <HowItWorksVideo />
          </div>

          <div className="font-medium py-3 text-sm flex flex-col gap-2 ">
            <h2 className="">Frequently Asked Questions (FAQs)</h2>
            <div className="flex flex-col gap-2">
              {faqs.map((faq) => {
                const isOpen = openKey === faq.key;

                return (
                  <Card
                    className="rounded-xl! shadow-none new-border flex-col gap-5"
                    key={faq.key}
                  >
                    <button
                      type="button"
                      className="flex flex-row min-w-full items-center justify-between gap-5 text-left"
                      onClick={() => toggleFaq(faq.key)}
                    >
                      <p className="">{faq.question}</p>

                      <div
                        className={`transform transition-transform duration-400 ease-in-out ${isOpen ? "" : "rotate-180"}`}
                      >
                        <ChevronUpIcon className="h-6 w-6 stroke-accent" />
                      </div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          {/* pre-line keeps the line breaks in multi-line answers */}
                          <p className="italic font-light p-2" style={{ whiteSpace: "pre-line" }}>
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </PageContent>
    </Page>
  );
}
