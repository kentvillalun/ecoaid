"use client";

import { Page } from "@/components/layout/Page.jsx";
import { PageContent } from "@/components/layout/PageContent.jsx";
import { ResidentHeader } from "@/components/navigation/ResidentHeader.jsx";
import { useRouter } from "next/navigation";
import {
  TERMS_TITLE,
  TERMS_LAST_UPDATED,
  TERMS_INTRO,
  TERMS_SECTIONS,
} from "@/lib/termsContent";

export default function TermsAndPrivacyPage() {
  const router = useRouter();

  return (
    <Page className="bg-bg!">
      <ResidentHeader
        title={"Terms & Privacy"}
        handleClick={() => router.push("/profile/settings")}
        className="shadow-none bg-bg!"
      />

      <PageContent>
        <div className="flex flex-col gap-8 pb-6">
          <div className="flex flex-col items-center text-center gap-1 pt-2">
            <h1 className="font-semibold text-lg text-text-primary">
              {TERMS_TITLE}
            </h1>
            <p className="text-xs text-gray-400">
              Last updated: {TERMS_LAST_UPDATED}
            </p>
          </div>

          <div className="bg-white rounded-2xl new-border p-5 flex flex-col gap-8">
            <p className="text-sm text-gray-600 leading-relaxed">
              {TERMS_INTRO}
            </p>

            {TERMS_SECTIONS.map((section) => (
              <div className="flex flex-col gap-3" key={section.heading}>
                <h2 className="text-sm font-semibold text-text-primary">
                  {section.heading}
                </h2>
                {section.blocks.map((block, i) =>
                  block.type === "ul" ? (
                    <ul
                      className="list-disc marker:text-accent pl-5 flex flex-col gap-2 text-sm text-gray-600 leading-relaxed"
                      key={i}
                    >
                      {block.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p
                      className="text-sm text-gray-600 leading-relaxed"
                      key={i}
                    >
                      {block.text}
                    </p>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </PageContent>
    </Page>
  );
}
