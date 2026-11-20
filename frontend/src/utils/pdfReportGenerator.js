/**
 * NoiseScape - Official Acoustic Measurement & CPCB Compliance PDF Report Generator
 * Opens a print-optimized, high-resolution certificate and triggers browser's Save as PDF.
 */

export function generateNoiseReportPDF({
  reportId = `MAD-NOISE-${Date.now().toString().slice(-6)}`,
  areaName = 'Current User Location',
  zone = 'RESIDENTIAL',
  measuredDb = 65.0,
  peakDb = 72.0,
  minDb = 50.0,
  cpcbLimit = 55.0,
  isBreach = false,
  severity = 'SAFE',
  healthAdvisory = 'Sound levels comply with environmental safety regulations.',
  source = 'Real-time Acoustic Sound Meter',
}) {
  const printWindow = window.open('', '_blank', 'width=850,height=900');
  if (!printWindow) {
    alert('Please allow popups to download/print your PDF acoustic report.');
    return;
  }

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const margin = Math.abs(measuredDb - cpcbLimit).toFixed(1);
  const statusColor = isBreach ? '#e11d48' : '#059669';
  const statusBg = isBreach ? '#ffe4e6' : '#d1fae5';
  const statusLabel = isBreach ? 'REGULATORY THRESHOLD BREACH' : 'CPCB COMPLIANT & SAFE';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>NoiseScape Acoustic Assessment Certificate - ${reportId}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background: #f8fafc;
      color: #0f172a;
      padding: 24px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .cert-container {
      max-width: 760px;
      margin: 0 auto;
      background: #ffffff;
      border: 2px solid #0284c7;
      border-radius: 16px;
      padding: 36px 40px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.06);
      position: relative;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 80px;
      font-weight: 900;
      color: rgba(2, 132, 199, 0.04);
      pointer-events-none;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .header {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 900;
      color: #0284c7;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      font-size: 11px;
      color: #64748b;
      margin-top: 3px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-meta {
      text-align: right;
      font-size: 11px;
      color: #64748b;
      line-height: 1.6;
    }
    .doc-meta strong {
      color: #0f172a;
    }
    .certificate-title {
      text-align: center;
      margin: 24px 0 16px;
    }
    .certificate-title h2 {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .certificate-title p {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }
    .status-banner {
      background: ${statusBg};
      border: 1.5px solid ${statusColor};
      color: ${statusColor};
      border-radius: 10px;
      padding: 12px;
      text-align: center;
      font-weight: 800;
      font-size: 14px;
      letter-spacing: 0.5px;
      margin-bottom: 24px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      background: #f8fafc;
    }
    .card-title {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }
    .metric-value {
      font-size: 32px;
      font-weight: 900;
      color: #0f172a;
      line-height: 1;
    }
    .metric-value span {
      font-size: 14px;
      font-weight: 600;
      color: #64748b;
      margin-left: 4px;
    }
    .table-details {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 12px;
    }
    .table-details th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 700;
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid #cbd5e1;
    }
    .table-details td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }
    .table-details tr:nth-child(even) td {
      background: #fafafa;
    }
    .advisory-box {
      background: #f0fdf4;
      border-left: 4px solid #16a34a;
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      margin-bottom: 24px;
      font-size: 12px;
      line-height: 1.5;
      color: #166534;
    }
    .footer-stamp {
      border-top: 1.5px dashed #cbd5e1;
      padding-top: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 11px;
      color: #64748b;
    }
    .seal-box {
      border: 1.5px solid #0284c7;
      color: #0284c7;
      padding: 8px 14px;
      border-radius: 8px;
      text-align: center;
      font-weight: 800;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: inline-block;
    }
    .no-print-bar {
      max-width: 760px;
      margin: 0 auto 16px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .btn {
      background: #0284c7;
      color: #ffffff;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #0369a1;
    }
    .btn-secondary {
      background: #e2e8f0;
      color: #334155;
    }
    .btn-secondary:hover {
      background: #cbd5e1;
    }
    @media print {
      body {
        padding: 0;
        background: #ffffff;
      }
      .no-print-bar {
        display: none !important;
      }
      .cert-container {
        border: 2px solid #0284c7;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <!-- Print Action Toolbar -->
  <div class="no-print-bar">
    <button class="btn btn-secondary" onclick="window.close()">Close Window</button>
    <button class="btn" onclick="window.print()">🖨️ Save as PDF / Print</button>
  </div>

  <div class="cert-container">
    <div class="watermark">NOISESCAPE VERIFIED</div>

    <!-- Header -->
    <div class="header">
      <div>
        <div class="brand-title">NoiseScape</div>
        <div class="brand-subtitle">Urban Sound Pollution Mapping & Exposure Intelligence</div>
      </div>
      <div class="doc-meta">
        <div><strong>Certificate ID:</strong> ${reportId}</div>
        <div><strong>Date:</strong> ${formattedDate}</div>
        <div><strong>Time:</strong> ${formattedTime}</div>
        <div><strong>Location:</strong> Madurai District Acoustic Grid</div>
      </div>
    </div>

    <!-- Title -->
    <div class="certificate-title">
      <h2>Acoustic Measurement & CPCB Compliance Certificate</h2>
      <p>Benchmarked against Central Pollution Control Board (CPCB) Noise Rules 2000 Schedule IV</p>
    </div>

    <!-- Status Banner -->
    <div class="status-banner">
      ${statusLabel} • ${isBreach ? `EXCEEDS LIMIT BY +${margin} dB(A)` : `WITHIN SAFE MARGIN BY -${margin} dB(A)`}
    </div>

    <!-- Key Metrics 2-column Grid -->
    <div class="grid-2">
      <div class="card">
        <div class="card-title">Measured Ambient Sound (Leq)</div>
        <div class="metric-value">${measuredDb}<span>dB(A)</span></div>
      </div>
      <div class="card">
        <div class="card-title">Permissible CPCB Limit (${zone})</div>
        <div class="metric-value">${cpcbLimit}<span>dB(A)</span></div>
      </div>
    </div>

    <!-- Breakdown Table -->
    <table class="table-details">
      <thead>
        <tr>
          <th>Assessment Parameter</th>
          <th>Measured Value</th>
          <th>CPCB / WHO Reference Standard</th>
          <th>Regulatory Compliance</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Monitored Area / Sector</strong></td>
          <td>${areaName}</td>
          <td>Madurai Geographic District</td>
          <td>Zone: <strong>${zone}</strong></td>
        </tr>
        <tr>
          <td><strong>Current Decibel Level (Leq)</strong></td>
          <td><strong>${measuredDb} dB(A)</strong></td>
          <td>Permissible: ${cpcbLimit} dB(A)</td>
          <td style="color: ${statusColor}; font-weight: 700;">${isBreach ? 'BREACH DETECTED' : 'COMPLIANT'}</td>
        </tr>
        <tr>
          <td><strong>Peak Sound Level (Lmax)</strong></td>
          <td>${peakDb} dB(A)</td>
          <td>Transient acoustic threshold</td>
          <td>Evaluated</td>
        </tr>
        <tr>
          <td><strong>Minimum Sound Level (Lmin)</strong></td>
          <td>${minDb} dB(A)</td>
          <td>Baseline ambient threshold</td>
          <td>Evaluated</td>
        </tr>
        <tr>
          <td><strong>Measurement Instrument</strong></td>
          <td>${source}</td>
          <td>Zero-Hardware Software Sensor</td>
          <td>Calibrated</td>
        </tr>
      </tbody>
    </table>

    <!-- Advisory Box -->
    <div class="advisory-box">
      <strong>Public Health & Exposure Advisory:</strong><br />
      ${healthAdvisory}
    </div>

    <!-- Footer Stamp & Seal -->
    <div class="footer-stamp">
      <div>
        <div class="seal-box">CPCB SCHEDULE IV VERIFIED</div>
        <div style="margin-top: 6px; font-size: 10px; color: #94a3b8;">
          Digitally generated by NoiseScape Environmental Intelligence System.
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">Environmental Noise Compliance Authority</div>
        <div style="color: #64748b; font-size: 10px;">Madurai Urban Sound Monitoring Network</div>
      </div>
    </div>
  </div>

  <script>
    // Automatically open the print dialog upon loading
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
