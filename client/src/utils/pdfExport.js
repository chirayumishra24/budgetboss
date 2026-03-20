// PDF Export Utility — generates a portfolio report downloadable as PDF
// Uses browser-native approach: renders HTML to a new window and triggers print

export const generatePortfolioPDF = (data) => {
  const { walletBalance, holdings, closedTrades, totalTrades, wins, playerName } = data;

  const totalValue = holdings.reduce((a, h) => a + (h.currentPrice * h.qty), 0);
  const totalPnl = holdings.reduce((a, h) => a + h.pnl, 0);
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0';

  const fmt = (n) => `Rs.${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const holdingsRows = holdings.map(h => `
    <tr>
      <td style="font-weight:700">${h.symbol}</td>
      <td>${h.qty}</td>
      <td>Rs.${h.avgPrice.toFixed(2)}</td>
      <td>Rs.${h.currentPrice.toFixed(2)}</td>
      <td style="color:${h.pnl >= 0 ? '#22c55e' : '#ef4444'}; font-weight:700">
        ${h.pnl >= 0 ? '+' : '-'}Rs.${Math.abs(h.pnl).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const tradesRows = closedTrades.map(t => `
    <tr>
      <td>${t.symbol}</td>
      <td style="color:${t.type === 'LONG' ? '#22c55e' : '#ef4444'}">${t.type}</td>
      <td>Rs.${t.entry.toFixed(2)}</td>
      <td>Rs.${t.exit.toFixed(2)}</td>
      <td style="color:${t.pnl >= 0 ? '#22c55e' : '#ef4444'}; font-weight:700">
        ${t.pnl >= 0 ? '+' : '-'}Rs.${Math.abs(t.pnl).toFixed(2)}
      </td>
      <td>${t.time}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Budget Boss — Portfolio Report</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; }
        h1 { font-size: 28px; margin-bottom: 4px; }
        h2 { font-size: 18px; margin: 24px 0 12px; color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
        .subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .summary { display: flex; gap: 20px; margin-bottom: 24px; }
        .summary-card {
          flex: 1; padding: 16px; border-radius: 12px;
          border: 1px solid #e2e8f0; text-align: center;
        }
        .summary-card p { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
        .summary-card h3 { font-size: 22px; }
        .green { color: #22c55e; }
        .red { color: #ef4444; }
        .blue { color: #3b82f6; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { text-align: left; padding: 10px 12px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 12px; text-transform: uppercase; color: #64748b; }
        td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>Budget Boss</h1>
      <p class="subtitle">${playerName ? `Trader: <strong>${playerName}</strong> | ` : ''}Portfolio Report | Generated ${new Date().toLocaleString('en-IN')}</p>

      <div class="summary">
        <div class="summary-card">
          <p>Portfolio Value</p>
          <h3 class="blue">${fmt(totalValue)}</h3>
        </div>
        <div class="summary-card">
          <p>Total P&L</p>
          <h3 class="${totalPnl >= 0 ? 'green' : 'red'}">${totalPnl >= 0 ? '+' : '-'}${fmt(totalPnl)}</h3>
        </div>
        <div class="summary-card">
          <p>Cash Balance</p>
          <h3>${fmt(walletBalance)}</h3>
        </div>
        <div class="summary-card">
          <p>Win Rate</p>
          <h3>${winRate}%</h3>
        </div>
      </div>

      <h2>Current Holdings</h2>
      ${holdings.length > 0 ? `
        <table>
          <thead><tr><th>Stock</th><th>Qty</th><th>Avg Price</th><th>Current Price</th><th>P&L</th></tr></thead>
          <tbody>${holdingsRows}</tbody>
        </table>
      ` : '<p style="color:#64748b;padding:16px 0">No holdings.</p>'}

      ${closedTrades.length > 0 ? `
        <h2>Trade History</h2>
        <table>
          <thead><tr><th>Stock</th><th>Type</th><th>Entry</th><th>Exit</th><th>P&L</th><th>Time</th></tr></thead>
          <tbody>${tradesRows}</tbody>
        </table>
      ` : ''}

      <div class="footer">
        <p>Budget Boss — Financial Simulation Game | This is a simulated portfolio report for educational purposes only.</p>
      </div>

      <script>window.onload = () => window.print();</script>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    alert('Please allow popups to download the PDF report.');
  }
};
