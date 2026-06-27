import { AddModal } from "@/features/add-modal/add-modal";
import { ExpensesView } from "@/features/expenses/expenses-view";
import {
  getExpenseSaleOptions,
  getExpenses,
} from "@/features/expenses/queries";

type ExpensesPageProps = {
  searchParams: Promise<{
    add?: string;
  }>;
};

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const { add } = await searchParams;
  const [expenses, sales] = await Promise.all([
    getExpenses(),
    getExpenseSaleOptions(),
  ]);

  return (
    <>
      <ExpensesView expenses={expenses} sales={sales} />
      <AddModal add={add} defaultKind="expense" />
    </>
  );
}
