import { XMarkIcon } from "@heroicons/react/24/outline";
import { Inter } from "next/font/google";
import { TERMS_TITLE, TERMS_SUBTITLE, TERMS_INTRO, TERMS_SECTIONS } from "@/lib/termsContent";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const TermsModal = ({ setIsTermsOpen }) => {
  return (
    <>
      <section
        className={`fixed flex flex-col justify-center items-center z-100 bg-white  rounded-2xl m-4 min-w-[90%] md:min-w-[50%] ${inter.className} max-h-[90%]`}
      >
        <div className="p-6 border-b border-gray-200 w-full">
          <div className="sticky flex flex-row items-start justify-between ">
            <div className="">
              <h4 className="font-semibold text-[16px]">{TERMS_TITLE}</h4>
              <p className="text-gray-600 text-[14px]">{TERMS_SUBTITLE}</p>
            </div>
            <div
              className="hover:cursor-pointer"
              onClick={() => {
                setIsTermsOpen(false);
              }}
            >
              <XMarkIcon className="w-8 stroke-gray-500" />
            </div>
          </div>
        </div>

        <div className="text-gray-600 text-[14px] max-h-[60%] overflow-y-auto scrollbar">
          <div className="p-5 flex flex-col gap-5 ">
            <p className="">{TERMS_INTRO}</p>

            {TERMS_SECTIONS.map((section) => (
              <div className="flex flex-col gap-5" key={section.heading}>
                <hr className="text-gray-200" />
                <div className="flex flex-col gap-2">
                  <h4 className="text-[14px] font-medium">
                    {section.heading}
                  </h4>
                  {section.blocks.map((block, i) =>
                    block.type === "ul" ? (
                      <ul
                        className="list-disc list-inside flex flex-col gap-2"
                        key={i}
                      >
                        {block.items.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="" key={i}>
                        {block.text}
                      </p>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
