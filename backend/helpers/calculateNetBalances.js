export const calculateNetBalances = (names, transactions, nameToIndex) => {
  const balances = Array(names.length).fill(0);

  // Process each transaction
  transactions.forEach(({ payer, payee, amount }) => {
    const amt = parseFloat(amount);
    balances[nameToIndex.get(payer)] += amt; // Payer gives money (debtor)
    balances[nameToIndex.get(payee)] -= amt; // Payee receives money (creditor)
  });

  const creditors = [];
  const debtors = [];

  // Separate creditors and debtors based on the balance
  balances.forEach((balance, index) => {
    if (
      balance > 0 &&
      names[index] !== "source" &&
      names[index] !== "destination"
    ) {
      creditors.push({ name: names[index], amount: balance });
    } else if (
      balance < 0 &&
      names[index] !== "source" &&
      names[index] !== "destination"
    ) {
      debtors.push({ name: names[index], amount: Math.abs(balance) });
    }
  });

  return { creditors, debtors };
};
