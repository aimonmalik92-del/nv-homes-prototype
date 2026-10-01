export const formatRs = (n) => (n || n === 0 ? `Rs ${Math.round(n).toLocaleString("en-PK")}` : "—");
export const formatLacs = (n) => {
  const v = (n || 0) / 100000;
  return Math.abs(v) >= 100 ? `${(v / 100).toFixed(2)} Cr` : `${Math.round(v * 10) / 10} Lacs`;
};
