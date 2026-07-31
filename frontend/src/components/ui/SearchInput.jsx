import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { Inter } from "next/font/google"

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
})

export const SearchInput = ({className = ''}) => {

    return (
        <div className={`${inter.className} ${className} flex flex-row items-center justify-start py-4 px-6 gap-4 bg-accent/5 rounded-full focus-within:border-accent border border-transparent transition-all md:hidden`}>
            <MagnifyingGlassIcon className="w-8 h-8 stroke-accent"/>
            <input type="text" className="w-full outline-none text-accent placeholder-accent" placeholder="Search for something"/>
        </div>
    )
}