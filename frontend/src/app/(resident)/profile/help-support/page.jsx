"use client";

import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { ResidentHeader } from "@/components/navigation/ResidentHeader";
import { ChevronUpIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react";
import { Card } from "@/components/ui/Card";
import { useState } from "react";

export default function HelpAndSupportPage() {
  const [openKey, setOpenKey] = useState(null);

  const faqs = [
    {
      key: "q1",
      question: "How do post recyclables?",
      answer: `To post recyclables, go to the Home screen and tap the "Big Camera" button. Take a clear photo of the items, fill out basic information like selecting a material type, and submit the request. The barangay will review and approve your request.`,
    },
    {
      key: "q2",
      question: "When will the barangay pick up my recyclables?",
      answer: `Recyclables are pickup every Sunday based on the barangay's default schedule. If you need pickup on a different date, you can submit a pickup request in the app. The barangay will review your request and set a schedule. You can track the status of your request inside the app, and you will receive a notification once it is approved or scheduled.`,
    },
    {
      key: "q3",
      question: "How are rewards computed?",
      answer: `All collected recyclables will be sorted and checked by the barangay. Based on the type and amount of recyclables you submitted, you will earn rewards. The rewards may include goods or services such as canned goods or other available items. The available rewards depend on what you collected and the barangay’s reward list.`,
    },
    {
      key: "q4",
      question: "What happens during pickup?",
      answer: `Barangay staff will go to your address. They will check and weigh your recyclables. After that, they will confirm the request in the system and update the status as completed.`,
    },
    {
      key: "q5",
      question: "What if my request is delayed or not picked up?",
      answer: `If your pickup is delayed, please wait for updates in the app. If there are no updates after the scheduled date, you may contact your barangay directly through the contact information provided in the app.`,
    },
    {
      key: "q6",
      question: "Can I cancel my request?",
      answer: `Yes, you can cancel your request if it has not yet been picked up Just go to your request details and select the cancel option. Once the pickup is already completed, cancellation is no longer allowed.`,
    },
    {
      key: "q7",
      question: "Why is my registered barangay not editable?",
      answer: `Your registered barangay is fixed to make sure your requests go to the correct office. If you moved to a different barangay, please contact support to update your information.`,
    },
    {
      key: "q8",
      question: "Who should contact for other concerns?",
      answer: `For other concerns, you may contact your barangay office directly. You can also use the contact details listed in the app’s Help section.`,
    },
  ];

  const toggleFaq = (key) => {
    setOpenKey((prev) => (prev === key ? null : key));
  };

  return (
    <Page className="bg-new-bg!">
      <ResidentHeader
        title={"Help & Support"}
        className="bg-new-bg! shadow-none!"
      />

      <PageContent>
        <div className="">
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
                        <ChevronUpIcon className="h-6 w-6 stroke-cta-color" />
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
                          <p className="italic font-light p-2 ">{faq.answer}</p>
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
