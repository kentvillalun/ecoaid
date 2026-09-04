"use client";

import { useContext, useState } from "react";
import { Inter } from "next/font/google";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import { BarangayTopBar } from "@/components/navigation/BarangayTopBar";
import { BarangayHeaderCard } from "@/components/ui/BarangayHeaderCard";
import { Card } from "@/components/ui/Card";
import { IconContainer } from "@/components/ui/IconContainer";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { StatusChip } from "@/components/ui/StatusChip";
import { AddExpenseModal } from "@/components/program-funds/AddExpenseModal";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  BanknotesIcon,
  ArrowUpRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
  ChartPieIcon,
  Bars3BottomLeftIcon,
} from "@heroicons/react/24/outline";
import { useFetch } from "@/hooks/useFetch";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { formatDate } from "@/lib/formatDate";
import { Spinner } from "@/components/ui/Spinner";
import { Error } from "@/components/ui/Error";
import { Empty } from "@/components/ui/Empty";
import { DrawerContext } from "../layout";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const FILTER_TABS = [
  { key: ["ALL"], label: "All" },
  { key: ["income"], label: "Income" },
  { key: ["expense"], label: "Expenses" },
];

const PROGRAM_TABLE_HEADERS = [
  "Program",
  "Allocated Budget",
  "Total Spent",
  "Remaining",
  "Status",
];

const TRANSACTION_TABLE_HEADERS = [
  "Type",
  "Name",
  "Description",
  "Program",
  "Amount",
  "Recorded By",
  "Date",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProgramFundsPage() {
  const [currentTab, setCurrentTab] = useState(FILTER_TABS[0].key);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [summaryRefetchCount, setSummaryRefetchCount] = useState(0);
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useFetch({
    url: "/api/program-funds/summary",
    refetchCount: summaryRefetchCount,
  });
  const [transactionRefetchCount, setTransactionRefetchCount] = useState(0);
  const {
    data: transactionData,
    isLoading: isTransactionLoading,
    isError: isTransactionError,
  } = useFetch({
    url: "/api/program-funds/transactions",
    refetchCount: transactionRefetchCount,
  });
  const { modules } = useContext(DrawerContext);

  const handleSummaryRefetchCount = () =>
    setSummaryRefetchCount((prev) => prev + 1);

  const handleTransactionRefetchCount = () =>
    setTransactionRefetchCount((prev) => prev + 1);

  const netBalance =
    (summaryData?.totalIncome ?? 0) - (summaryData?.totalExpenses ?? 0);

  const activeTabConfig = FILTER_TABS.find((tab) => tab.key === currentTab);

  const filteredTransactions = activeTabConfig?.key?.includes("ALL")
    ? transactionData?.transactions
    : transactionData?.transactions?.filter((t) =>
        activeTabConfig?.key?.includes(t.type),
      );

  const emptyTransactionsSubtext = activeTabConfig?.key?.includes("ALL")
    ? "No income or expense records yet."
    : activeTabConfig?.key?.includes("income")
      ? "No income records yet."
      : "No expense records yet.";

  console.log(modules);
  return (
    <Page className="bg-bg!">
      <BarangayTopBar title="Program Funds" />
      <PageContent className="md:pl-70! md:p-6 md:gap-7">
        {/* Header */}
        <BarangayHeaderCard
          title="Program Funds"
          subtitle="Track income, expenses, and program budgets"
        />

        {/* Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-text-secondary">
                Total Income
              </p>
              <IconContainer
                icon={
                  <ArrowUpRightIcon className="w-3 stroke-text-secondary" />
                }
                className="rounded-full! p-2!"
                containerColor="var(--color-icon-bg)"
              />
            </div>
            <p className="md:text-2xl font-bold text-green-600 text-lg flex flex-row items-center gap-1.5">
              {isSummaryLoading ? (
                <Skeleton width={180} />
              ) : (
                formatCurrency(summaryData?.totalIncome ?? 0)
              )}

              <ArrowTrendingUpIcon className="w-5 stroke-green-600" />
            </p>
            <div className="flex flex-row items-center w-auto bg-green-50 px-3 py-1 rounded-xl text-xs gap-2">
              <BanknotesIcon className="w-3 stroke-green-700" />
              <p className="text-green-700 font-medium">From junkshop sales</p>
            </div>
          </Card>

          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-text-secondary">
                Total Expenses
              </p>
              <IconContainer
                icon={
                  <ArrowUpRightIcon className="w-3 stroke-text-secondary" />
                }
                className="rounded-full! p-2!"
                containerColor="var(--color-icon-bg)"
              />
            </div>
            <p className="md:text-2xl font-bold text-red-600 text-lg flex flex-row items-center gap-1.5">
              {isSummaryLoading ? (
                <Skeleton width={180} />
              ) : (
                formatCurrency(summaryData?.totalExpenses ?? 0)
              )}
              <ArrowTrendingDownIcon className="w-5 stroke-red-600" />
            </p>
            <div className="flex flex-row items-center w-auto bg-red-50 px-3 py-1 rounded-xl text-xs gap-2">
              <BanknotesIcon className="w-3 stroke-red-700" />
              <p className="text-red-700 font-medium">Program expenses</p>
            </div>
          </Card>

          <Card className="shadow-none! new-border flex flex-col items-start">
            <div className="flex flex-row items-start justify-between w-full">
              <p className="text-xs font-medium text-text-secondary">
                Net Balance
              </p>
              <IconContainer
                icon={
                  <ArrowUpRightIcon className="w-3 stroke-text-secondary" />
                }
                className="rounded-full! p-2!"
                containerColor="var(--color-icon-bg)"
              />
            </div>
            <p
              className={`md:text-2xl font-bold text-lg flex flex-row items-center gap-1.5 ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {isSummaryLoading ? (
                <Skeleton width={180} />
              ) : (
                formatCurrency(netBalance)
              )}
              <ScaleIcon
                className={`w-5 ${netBalance >= 0 ? "stroke-green-600" : "stroke-red-600"}`}
              />
            </p>
            <div
              className={`flex flex-row items-center w-auto px-3 py-1 rounded-xl text-xs gap-2 ${netBalance >= 0 ? "bg-green-50" : "bg-red-50"}`}
            >
              <ScaleIcon
                className={`w-3 ${netBalance >= 0 ? "stroke-green-700" : "stroke-red-700"}`}
              />
              <p
                className={`font-medium ${netBalance >= 0 ? "text-green-700" : "text-red-700"}`}
              >
                Current balance
              </p>
            </div>
          </Card>
        </section>

        {/* Program Budget Breakdown */}
        {(modules?.hasRedemptionManagement && modules?.hasRewardInventory) && (
          <section className="flex flex-col gap-3">
            <SectionHeader
              title="Program Budgets"
              subtitle="Allocated budget vs actual spending per program"
              icon={<ChartPieIcon className="w-6 stroke-accent" />}
              noButton
            />

            {/* Desktop table */}
            <Card
              className={`${inter.className} hidden md:flex md:flex-col px-8 md:gap-3 md:items-start shadow-none! new-border`}
            >
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm border-collapse text-gray-600">
                  <thead className="border-b border-border">
                    <tr>
                      {PROGRAM_TABLE_HEADERS.map((h) => (
                        <th
                          key={h}
                          className="font-medium text-start p-4 text-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isSummaryLoading ? (
                      <tr className="max-w-md">
                        <td
                          className="text-center"
                          colSpan={PROGRAM_TABLE_HEADERS.length}
                        >
                          <Spinner className="min-h-auto! p-12!" />
                        </td>
                      </tr>
                    ) : isSummaryError ? (
                      <tr className="max-w-md">
                        <td
                          className="text-center"
                          colSpan={PROGRAM_TABLE_HEADERS.length}
                        >
                          <Error
                            handleRefetchCount={handleSummaryRefetchCount}
                            text={"Unable to get program budgets"}
                            subtext={
                              "Unable to get program budget breakdown. Please try again."
                            }
                          />
                        </td>
                      </tr>
                    ) : summaryData?.programBreakdown?.length === 0 ? (
                      <tr className="max-w-md">
                        <td
                          className="text-center"
                          colSpan={PROGRAM_TABLE_HEADERS.length}
                        >
                          <Empty
                            text={"No programs yet"}
                            subtext={
                              "No redemption programs have been created yet."
                            }
                          />
                        </td>
                      </tr>
                    ) : (
                      summaryData?.programBreakdown?.map((p) => {
                        const isOverBudget = p.remaining < 0;
                        return (
                          <tr
                            key={p.id}
                            className="hover:bg-bg transition-all duration-150"
                          >
                            <td className="p-4 font-semibold text-text-primary text-nowrap">
                              {p.name}
                            </td>
                            <td className="p-4 text-nowrap tabular-nums">
                              {formatCurrency(p.allotedBudget ?? 0)}
                            </td>
                            <td className="p-4 text-nowrap tabular-nums">
                              {formatCurrency(p.totalSpent ?? 0)}
                            </td>
                            <td
                              className={`p-4 text-nowrap font-semibold tabular-nums ${isOverBudget ? "text-red-600" : "text-green-600"}`}
                            >
                              {formatCurrency(p.remaining ?? 0)}
                            </td>
                            <td className="p-4">
                              <Badge
                                label={
                                  isOverBudget ? "Over Budget" : "Under Budget"
                                }
                                color={
                                  isOverBudget
                                    ? "bg-red-50 text-red-700"
                                    : "bg-green-50 text-green-700"
                                }
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Mobile cards */}
            <div className="flex md:hidden flex-col gap-2">
              {isSummaryLoading ? (
                Array.from({ length: 1 }).map((_, index) => (
                  <Card
                    key={index}
                    className="flex flex-col items-start gap-3 shadow-none! new-border"
                  >
                    <div className="flex flex-row items-center justify-between w-full">
                      <Skeleton width={160} />
                      <Skeleton width={90} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 w-full">
                      <div className="flex flex-col gap-1">
                        <Skeleton width={55} />
                        <Skeleton width={75} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Skeleton width={45} />
                        <Skeleton width={75} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Skeleton width={65} />
                        <Skeleton width={75} />
                      </div>
                    </div>
                  </Card>
                ))
              ) : isSummaryError ? (
                <Error
                  handleRefetchCount={handleSummaryRefetchCount}
                  text={"Unable to get program budgets"}
                  subtext={
                    "Unable to get program budget breakdown. Please try again."
                  }
                />
              ) : summaryData?.programBreakdown?.length === 0 ? (
                <Empty
                  text={"No programs yet"}
                  subtext={"No redemption programs have been created yet."}
                />
              ) : (
                summaryData?.programBreakdown?.map((p) => {
                  const isOverBudget = p?.remaining < 0;
                  return (
                    <Card
                      key={p.id}
                      className="flex flex-col items-start gap-3 shadow-none! new-border"
                    >
                      <div className="flex flex-row items-center justify-between w-full">
                        <p className="text-sm font-bold text-text-primary">
                          {p.name}
                        </p>
                        <Badge
                          label={isOverBudget ? "Over Budget" : "Under Budget"}
                          color={
                            isOverBudget
                              ? "bg-red-50 text-red-700"
                              : "bg-green-50 text-green-700"
                          }
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2 w-full">
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs text-gray-400">Allocated</p>
                          <p className="text-sm font-semibold text-text-primary tabular-nums">
                            {formatCurrency(p.allotedBudget ?? 0)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs text-gray-400">Spent</p>
                          <p className="text-sm font-semibold text-text-primary tabular-nums">
                            {formatCurrency(p.totalSpent ?? 0)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs text-gray-400">Remaining</p>
                          <p
                            className={`text-sm font-semibold tabular-nums ${isOverBudget ? "text-red-600" : "text-green-600"}`}
                          >
                            {formatCurrency(p.remaining ?? 0)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* Transaction Log */}
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Transaction Log"
            subtitle="All income and expense records"
            icon={<Bars3BottomLeftIcon className="w-6 stroke-accent" />}
            buttonLabel="Add Expense"
            onAction={() => setIsModalOpen(true)}
            noButton={!(modules?.hasRedemptionManagement && modules?.hasRewardInventory)}
          />

          {/* Filter tabs */}
          <div className="sticky -top-5 md:-top-6 z-10 bg-bg pt-2">
            <StatusChip
              STATUS_TABS={FILTER_TABS}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              data={transactionData?.transactions}
              getItemValue={(item) => item.type}
            />
          </div>

          {/* Desktop table */}
          <Card
            className={`${inter.className} hidden md:flex md:flex-col px-8 md:gap-3 md:items-start shadow-none! new-border`}
          >
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm border-collapse text-gray-600">
                <thead className="border-b border-border">
                  <tr>
                    {TRANSACTION_TABLE_HEADERS.map((h) => (
                      <th
                        key={h}
                        className="font-medium text-start p-4 text-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isTransactionLoading ? (
                    <tr className="max-w-md">
                      <td
                        className="text-center"
                        colSpan={TRANSACTION_TABLE_HEADERS.length}
                      >
                        <Spinner className="min-h-auto! p-12!" />
                      </td>
                    </tr>
                  ) : isTransactionError ? (
                    <tr className="max-w-md">
                      <td
                        className="text-center"
                        colSpan={TRANSACTION_TABLE_HEADERS.length}
                      >
                        <Error
                          handleRefetchCount={handleTransactionRefetchCount}
                          text={"Unable to get transaction logs"}
                          subtext={
                            "Unable to get transaction logs. Please try again."
                          }
                        />
                      </td>
                    </tr>
                  ) : filteredTransactions?.length === 0 ? (
                    <tr className="max-w-md">
                      <td
                        className="text-center"
                        colSpan={TRANSACTION_TABLE_HEADERS.length}
                      >
                        <Empty
                          text={"No transactions yet"}
                          subtext={emptyTransactionsSubtext}
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions?.map((t) => (
                      <tr
                        key={t?.id}
                        className="hover:bg-bg transition-all duration-150"
                      >
                        <td className="p-4">
                          <Badge
                            label={t.type === "income" ? "Income" : "Expense"}
                            color={
                              t.type === "income"
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }
                          />
                        </td>
                        <td className="p-4 text-text-primary font-medium text-nowrap">
                          {t.type === "income" ? t?.junkshop?.name : t?.name}
                        </td>
                        <td className="p-4 text-gray-500 text-nowrap">
                          {t?.description ?? `Sold to: ${t?.junkshop?.name}`}
                        </td>
                        <td className="p-4 text-gray-500 text-nowrap">
                          {t.type === "income" ? "—" : t?.program?.name}
                        </td>
                        <td
                          className={`p-4 font-bold text-nowrap tabular-nums ${t.type === "income" ? "text-green-600" : "text-red-600"}`}
                        >
                          {t.type === "income" ? "+" : "-"}
                          {formatCurrency(t?.totalAmount ?? t?.amount)}
                        </td>
                        <td className="p-4 text-nowrap">
                          <div className="flex flex-col">
                            <p className="text-text-primary font-medium">
                              {t?.performedBy}
                            </p>
                            {t?.performedByRole && (
                              <p className="text-xs text-gray-400 capitalize">
                                {(t?.performedByRole).toLowerCase()}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-nowrap text-gray-400 text-xs">
                          {formatDate(t.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="flex md:hidden flex-col gap-2">
            {isTransactionLoading ? (
              Array.from({ length: 1 }).map((_, index) => (
                <Card
                  key={index}
                  className="flex flex-col items-start gap-3 shadow-none! new-border"
                >
                  <div className="flex flex-row items-center justify-between w-full gap-2">
                    <Skeleton width={70} height={22} borderRadius={999} />
                    <Skeleton width={90} />
                  </div>
                  <Skeleton width={210} />
                  <Skeleton width={130} />
                  <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
                    <Skeleton width={110} />
                    <Skeleton width={80} />
                  </div>
                </Card>
              ))
            ) : isTransactionError ? (
              <Error
                handleRefetchCount={handleTransactionRefetchCount}
                text={"Unable to get transaction logs"}
                subtext={"Unable to get transaction logs. Please try again."}
              />
            ) : filteredTransactions?.length === 0 ? (
              <Empty
                text={"No transactions yet"}
                subtext={emptyTransactionsSubtext}
              />
            ) : (
              filteredTransactions?.map((t) => (
                <Card
                  key={t.id}
                  className="flex flex-col items-start gap-3 shadow-none! new-border"
                >
                  <div className="flex flex-row items-center justify-between w-full gap-2">
                    <Badge
                      label={t.type === "income" ? "Income" : "Expense"}
                      color={
                        t.type === "income"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }
                    />
                    <p
                      className={`text-sm font-bold tabular-nums ${t.type === "income" ? "text-green-600" : "text-red-600"}`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(t.totalAmount ?? t.amount)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-text-primary">
                    {t.type === "income" ? t?.junkshop?.name : t?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t?.description ?? `Sold to: ${t?.junkshop?.name}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t.type === "income" ? "—" : t?.program?.name}
                  </p>
                  <div className="flex flex-row items-center justify-between w-full pt-2 border-t border-gray-100">
                    <div className="flex flex-col">
                      <p className="text-xs font-medium text-text-primary">
                        {t.performedBy}
                      </p>
                      {t?.performedByRole && (
                        <p className="text-xs text-gray-400 capitalize">
                          {(t?.performedByRole).toLowerCase()}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatDate(t.createdAt)}
                    </p>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Add Expense modal */}
        <AddExpenseModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          handleSummaryRefetchCount={handleSummaryRefetchCount}
          handleTransactionRefetchCount={handleTransactionRefetchCount}
        />
      </PageContent>
    </Page>
  );
}
