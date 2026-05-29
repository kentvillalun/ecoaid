import { ResidentHeader } from "@/components/navigation/ResidentHeader";
import { Inter } from "next/font/google";
import { BellSlashIcon } from "@heroicons/react/24/outline"
import { Page } from "@/components/layout/Page";
import { Empty } from "@/components/ui/Empty";



export default function AnnouncementsPage() {


    return (
        <Page className="bg-new-bg!">
            <ResidentHeader title={"Announcements"} className="shadow-none! bg-new-bg!" />
            <section className="absolute left-0 right-0 top-18 h-[calc(100dvh-72px)] p-3 flex flex-col gap-6 overflow-y-auto pb-[calc(120px+env(safe-area-inset-bottom))] items-center justify-center">
                <Empty subtext={"There are no annoucements available as of the moments"}/>
            </section>
        </Page>
    )
}