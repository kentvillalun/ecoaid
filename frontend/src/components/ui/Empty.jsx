

export const Empty = ({text, subtext}) => {

    return (
        <div className="flex flex-col items-center justify-center min-h-full p-15 gap-1 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#74C857] text-center">
            EcoProfit
          </p>
          <h1 className="text-3xl font-semibold text-[#1F2937] text-center">
            {text}
          </h1>
          <p className="text-sm text-[#6B7280] text-center">
            {subtext}
          </p>
        </div>
    )

}