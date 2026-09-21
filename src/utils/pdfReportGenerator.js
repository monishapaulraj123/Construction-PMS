// Official PDF Report Generator for Construction PMS Cost Estimation & Budget Planning

import { formatCurrencyINR, formatDate } from './format'
import { SCOPE_CATEGORIES } from './budgetCalculations'

export function generateBudgetPDFReport(projectInfo, budgetData) {
  const categories = budgetData?.categories || []
  const selectedCategories = categories.filter((c) => c.selected)

  const printWindow = window.open('', '_blank', 'width=950,height=1000')
  if (!printWindow) {
    alert('Please allow popups for this site to generate the PDF report.')
    return
  }

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const refNo = `EST-${projectInfo.project_code || 'PRJ-2026'}-${Math.floor(1000 + Math.random() * 9000)}`

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Project Cost Estimation Report - ${projectInfo.project_name || 'Project'}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fraunces:ital,wght@0,600;0,700;1,600&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      background: #ffffff;
      padding: 30px;
      font-size: 13px;
      line-height: 1.5;
    }
    @page {
      size: A4;
      margin: 15mm;
    }
    
    /* Header styling */
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #2f5d50;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .brand-logo {
      font-family: 'Fraunces', serif;
      font-size: 22px;
      font-weight: 700;
      color: #2f5d50;
      letter-spacing: -0.5px;
    }
    .brand-tagline {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }
    .report-title-badge {
      text-align: right;
    }
    .report-title-badge h2 {
      font-size: 16px;
      color: #d4b06a;
      background: #2f5d50;
      padding: 6px 14px;
      border-radius: 6px;
      display: inline-block;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .report-meta {
      font-size: 11px;
      color: #64748b;
    }

    /* Metadata Grid */
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-label {
      font-size: 10px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .meta-value {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }

    /* Key Metrics Highlights */
    .metrics-banner {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .metric-card {
      padding: 12px 14px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
    }
    .metric-card.highlight {
      background: #2f5d50;
      color: #ffffff;
      border-color: #2f5d50;
    }
    .metric-card.highlight .metric-val {
      color: #d4b06a;
    }
    .metric-card.highlight .metric-lbl {
      color: rgba(255, 255, 255, 0.8);
    }
    .metric-lbl {
      font-size: 10px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 600;
    }
    .metric-val {
      font-size: 18px;
      font-weight: 800;
      margin-top: 2px;
      color: #2f5d50;
    }

    /* Section Headings */
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #2f5d50;
      margin-bottom: 12px;
      padding-bottom: 4px;
      border-bottom: 1.5px solid #d4b06a;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 12px;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      text-align: left;
      padding: 8px 10px;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      border-bottom: 2px solid #cbd5e1;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    tr:nth-child(even) { background: #f8fafc; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 700; }
    .tag-addon {
      font-size: 9px;
      padding: 2px 6px;
      background: #fef3c7;
      color: #92400e;
      border-radius: 4px;
      font-weight: 700;
    }
    .tag-base {
      font-size: 9px;
      padding: 2px 6px;
      background: #e2e8f0;
      color: #334155;
      border-radius: 4px;
      font-weight: 600;
    }

    /* Footer & Signature */
    .report-footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #cbd5e1;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 40px;
    }
    .sig-box {
      text-align: center;
      padding-top: 40px;
      border-top: 1px dashed #94a3b8;
      font-weight: 600;
      color: #475569;
      font-size: 11px;
    }
    
    .disclaimer {
      margin-top: 30px;
      font-size: 10px;
      color: #94a3b8;
      text-align: center;
      line-height: 1.4;
    }

    /* Print action bar */
    .print-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #0f172a;
      color: #fff;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 9999;
    }
    .btn-print {
      background: #d4b06a;
      color: #1e293b;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
    }
    .btn-print:hover { background: #e2c282; }

    @media print {
      .print-bar { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <div>
      <strong>Construction PMS - PDF Budget Estimation Report</strong>
      <span style="opacity: 0.7; font-size: 11px; margin-left: 10px;">Click "Save as PDF" in print dialog</span>
    </div>
    <button class="btn-print" onclick="window.print()">📥 Print / Save as PDF</button>
  </div>

  <div style="margin-top: 40px;"></div>

  <div class="report-header">
    <div>
      <div class="brand-logo">CONSTRUCTION PMS</div>
      <div class="brand-tagline">Project Management & Budget Estimation Suite</div>
    </div>
    <div class="report-title-badge">
      <h2>COST ESTIMATION REPORT</h2>
      <div class="report-meta">Ref: <strong>${refNo}</strong> | Date: <strong>${currentDate}</strong></div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <span class="meta-label">Project Name</span>
      <span class="meta-value">${projectInfo.project_name || 'Unassigned Project'}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Client Name</span>
      <span class="meta-value">${projectInfo.client_name || 'Client'}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Construction Type</span>
      <span class="meta-value">${projectInfo.construction_type_name || 'Residential'} (${projectInfo.project_type_name || 'Standard'})</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Built-up Area & Floors</span>
      <span class="meta-value">${projectInfo.builtup_area || '1500'} sq.ft | ${projectInfo.no_of_floors || 1} Floors</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Site Location</span>
      <span class="meta-value">${projectInfo.site_address || 'Site Address'}, ${projectInfo.city || 'Chennai'}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Project Schedule</span>
      <span class="meta-value">${formatDate(projectInfo.start_date)} to ${formatDate(projectInfo.expected_end_date)}</span>
    </div>
  </div>

  <div class="metrics-banner">
    <div class="metric-card">
      <div class="metric-lbl">Base Construction Total</div>
      <div class="metric-val">${formatCurrencyINR(budgetData.baseScopeTotal || 0)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-lbl">Optional Add-ons Total</div>
      <div class="metric-val">${formatCurrencyINR(budgetData.optionalAddonsTotal || 0)}</div>
    </div>
    <div class="metric-card highlight">
      <div class="metric-lbl">TOTAL ESTIMATED BUDGET</div>
      <div class="metric-val">${formatCurrencyINR(budgetData.totalEstimatedBudget || 0)}</div>
    </div>
  </div>

  <div class="section-title">
    <span>1. Construction Scope & Category Breakdown</span>
    <span>${selectedCategories.length} Selected Scope Categories</span>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 25%">Category Name</th>
        <th style="width: 15%">Scope Type</th>
        <th style="width: 15%" class="text-right">Material</th>
        <th style="width: 15%" class="text-right">Labour</th>
        <th style="width: 15%" class="text-right">Service / Misc</th>
        <th style="width: 15%" class="text-right">Category Total</th>
      </tr>
    </thead>
    <tbody>
      ${selectedCategories
        .map(
          (c) => `
        <tr>
          <td class="font-bold">${c.name}</td>
          <td><span class="${c.is_optional_addon ? 'tag-addon' : 'tag-base'}">${c.is_optional_addon ? 'Optional Add-on' : 'Base Construction'}</span></td>
          <td class="text-right">${formatCurrencyINR(c.material_cost)}</td>
          <td class="text-right">${formatCurrencyINR(c.labour_cost)}</td>
          <td class="text-right">${formatCurrencyINR((c.service_cost || 0) + (c.other_cost || 0))}</td>
          <td class="text-right font-bold">${formatCurrencyINR(c.category_total)}</td>
        </tr>
      `
        )
        .join('')}
      <tr style="background: #f1f5f9; font-weight: 700;">
        <td colspan="2">SUBTOTAL (SELECTED SCOPE)</td>
        <td class="text-right">${formatCurrencyINR(budgetData.totalMaterial || 0)}</td>
        <td class="text-right">${formatCurrencyINR(budgetData.totalLabour || 0)}</td>
        <td class="text-right">${formatCurrencyINR((budgetData.totalService || 0) + (budgetData.totalOther || 0))}</td>
        <td class="text-right" style="font-size: 13px;">${formatCurrencyINR(budgetData.subtotal || 0)}</td>
      </tr>
      <tr>
        <td colspan="5" class="font-bold">Contingency Reserve (${budgetData.contingencyType === 'percentage' ? `${budgetData.contingencyValue}%` : 'Fixed Amount'})</td>
        <td class="text-right font-bold" style="color: #b45309;">${formatCurrencyINR(budgetData.contingencyAmount || 0)}</td>
      </tr>
      <tr style="background: #2f5d50; color: #ffffff; font-weight: 800; font-size: 14px;">
        <td colspan="5" style="color: #ffffff;">TOTAL ESTIMATED BUDGET</td>
        <td class="text-right" style="color: #d4b06a;">${formatCurrencyINR(budgetData.totalEstimatedBudget || 0)}</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">
    <span>2. Material & Labour Annexure Details</span>
  </div>

  <table>
    <thead>
      <tr>
        <th>Category</th>
        <th>Item Description / Specification</th>
        <th>Quantity / Workers</th>
        <th>Rate / Daily Rate</th>
        <th class="text-right">Total Estimated Amount</th>
      </tr>
    </thead>
    <tbody>
      ${selectedCategories
        .flatMap((c) => [
          ...(c.materials || []).map((m) => ({
            catName: c.name,
            desc: `Material: ${m.name}`,
            qtyRate: `${m.quantity} ${m.unit}`,
            unitRate: `${formatCurrencyINR(m.rate)} / ${m.unit}`,
            total: (Number(m.quantity) || 0) * (Number(m.rate) || 0),
          })),
          ...(c.labour || []).map((l) => ({
            catName: c.name,
            desc: `Labour: ${l.worker_type}`,
            qtyRate: `${l.no_of_workers} Workers × ${l.days} Days`,
            unitRate: `${formatCurrencyINR(l.daily_rate)} / Day`,
            total: (Number(l.no_of_workers) || 0) * (Number(l.days) || 0) * (Number(l.daily_rate) || 0),
          })),
        ])
        .map(
          (item) => `
        <tr>
          <td>${item.catName}</td>
          <td class="font-bold">${item.desc}</td>
          <td>${item.qtyRate}</td>
          <td>${item.unitRate}</td>
          <td class="text-right font-bold">${formatCurrencyINR(item.total)}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="report-footer">
    <div class="sig-box">
      Prepared By (Project Estimator & Civil Engineer)
    </div>
    <div class="sig-box">
      Approved By (Client / Managing Director)
    </div>
  </div>

  <div class="disclaimer">
    This cost estimation report is generated by Construction PMS Pro. All material and labour rates are market approximations based on selected construction scope. Valid for 30 days from generation date.
  </div>

  <script>
    window.onload = function() {
      // Auto trigger print window after load
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `

  printWindow.document.open()
  printWindow.document.write(htmlContent)
  printWindow.document.close()
}
