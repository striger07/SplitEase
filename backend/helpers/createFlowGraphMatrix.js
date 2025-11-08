export const createFlowGraphMatrix = (
  names,
  creditors,
  debtors,
  nameToIndex
) => {
  const num_nodes = names.length;
  const flowGraph = Array.from({ length: num_nodes }, () =>
    Array(num_nodes).fill(0)
  );

  // Source to givers
  debtors.forEach((debtor) => {
    const giverIndex = nameToIndex.get(debtor.name);
    flowGraph[0][giverIndex] = debtor.amount;
  });

  // Givers to receivers
  debtors.forEach((debtor) => {
    const giverIndex = nameToIndex.get(debtor.name);
    creditors.forEach((creditor) => {
      const receiverIndex = nameToIndex.get(creditor.name);
      flowGraph[giverIndex][receiverIndex] = Math.min(
        debtor.amount,
        creditor.amount
      );
    });
  });

  // Receivers to destination
  creditors.forEach((creditor) => {
    const receiverIndex = nameToIndex.get(creditor.name);
    flowGraph[receiverIndex][num_nodes - 1] = creditor.amount;
  });

  return flowGraph;
};
