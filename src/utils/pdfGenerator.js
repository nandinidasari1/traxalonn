import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function generateGlobalPDF(links) {
    const doc = new jsPDF("p", "pt", "a4");
    const margin = 40;
    let y = margin;
    const pw = doc.internal.pageSize.getWidth();

    // Helper formatting
    const addHeader = (title) => {
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin, y);
        y += 20;
    };

    const addText = (text, size = 10, isBold = false) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        doc.text(text, margin, y);
        y += 15;
    };

    // Pre-calculate stats
    const activeLinks = links.filter((l) => l.active).length;
    const totalClicks = links.reduce((acc, l) => acc + (l.clicks || 0), 0);
    const allCaptures = links.flatMap(l => l.captures || []).sort((a, b) => new Date(b.capturedAt) - new Date(a.capturedAt));

    // Calculate Avg Clicks/Hour
    let avgClicks = "0.00";
    if (links.length && totalClicks > 0) {
        const oldestLink = [...links].sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))[0];
        if (oldestLink && oldestLink.createdAt) {
            const hours = Math.max(1, (new Date() - new Date(oldestLink.createdAt.seconds * 1000)) / 3600000);
            avgClicks = (totalClicks / hours).toFixed(2);
        }
    }

    // Device distribution
    const deviceCounts = {};
    allCaptures.forEach(c => {
        let device = String(c.device || c.DEVICE || "Unknown").toLowerCase();
        if (device.includes("iphone") || device.includes("mobile")) device = "mobile";
        if (!device) device = "Unknown";
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });

    const totalDevices = allCaptures.length;
    const deviceTableBody = Object.entries(deviceCounts).map(([type, count]) => [
        type,
        String(count),
        totalDevices > 0 ? ((count / totalDevices) * 100).toFixed(1) + "%" : "0%"
    ]);

    // Visitor Activity build
    const visitorLogBody = allCaptures.map(c => [
        new Date(c.capturedAt || c.SYSTEMDATE || Date.now()).toLocaleString(),
        c.ip || c["SERVERHEADERS.X-REAL-IP"] || c["SERVERHEADERS.X-FORWARDED-FOR"] || "Unknown",
        (c.city || c["SERVERGEO.CITY"] || "Unknown") + ", " + (c.country || c["SERVERGEO.COUNTRY"] || "Unknown"),
        c.browser || c.BROWSER || "Unknown",
        c.os || c.OS || "Unknown"
    ]);

    // Document Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 150, 255);
    doc.text("Traxelon Analytics", margin, y);
    doc.setTextColor(0, 0, 0);
    y += 25;

    addHeader("Global Analytics Report");
    addText(`Generated: ${new Date().toLocaleString()}`);
    addText(`Data Retention: Last 24 Hours Only`);
    y += 10;

    // Render Metric Value Table
    autoTable(doc, {
        startY: y,
        head: [['Metric', 'Value']],
        body: [
            ['Total Clicks', String(totalClicks)],
            ['Unique Links (Active)', String(activeLinks)],
            ['Avg. Clicks/Hour', String(avgClicks)]
        ],
        theme: 'grid',
        headStyles: { fillColor: [10, 22, 40] },
        margin: { left: margin },
    });
    y = doc.lastAutoTable.finalY + 30;

    // Render Device Distribution Table
    addHeader("Device Distribution");
    autoTable(doc, {
        startY: y,
        head: [['Device Type', 'Count', 'Percentage']],
        body: deviceTableBody.length ? deviceTableBody : [["No data", "-", "-"]],
        theme: 'grid',
        headStyles: { fillColor: [10, 22, 40] },
        margin: { left: margin },
    });
    y = doc.lastAutoTable.finalY + 30;

    // Render Visitor Activity Log
    addHeader("Visitor Activity Log (Last 24h)");
    autoTable(doc, {
        startY: y,
        head: [['Time', 'IP Address', 'Location', 'Browser', 'OS']],
        body: visitorLogBody.length ? visitorLogBody : [["No data", "-", "-", "-", "-"]],
        theme: 'grid',
        headStyles: { fillColor: [10, 22, 40] },
        margin: { left: margin },
    });
    y = doc.lastAutoTable.finalY + 30;

    // --- Deep-Dive Visitor Parameters ---
    doc.addPage();
    y = margin;
    addHeader("Deep-Dive Visitor Parameters");
    addText("Comprehensive metadata for every captured interaction");
    y += 10;

    allCaptures.forEach((capture, idx) => {
        // Check page break
        if (y > doc.internal.pageSize.getHeight() - 60) {
            doc.addPage();
            y = margin;
        }

        const captureCity = capture.city || capture["SERVERGEO.CITY"] || "Unknown location";
        const captureTime = new Date(capture.capturedAt || capture.SYSTEMDATE || Date.now()).toLocaleTimeString();

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`${idx + 1}. Visitor from ${captureCity} (${captureTime})`, margin, y);
        y += 15;

        const paramBody = [];
        Object.keys(capture).sort().forEach(key => {
            // exclude internal firestore identifiers if any
            if (key === "id" || key === "capturedAt") return;

            let val = capture[key];
            if (val === null || val === undefined || val === "null" || val === "") val = "null";
            else if (typeof val === "object") val = "[object Object]";
            else val = String(val);

            paramBody.push([key, val]);
        });

        autoTable(doc, {
            startY: y,
            head: [['Parameter', 'Captured Data']],
            body: paramBody,
            theme: 'grid',
            headStyles: { fillColor: [10, 22, 40] },
            margin: { left: margin },
            rowPageBreak: 'avoid',
            columnStyles: {
                0: { cellWidth: 150 },
                1: { cellWidth: 350 }
            }
        });

        y = doc.lastAutoTable.finalY + 30;
    });

    doc.save("traxelon-comprehensive-global-report.pdf");
}

export async function generatePDF(capture, analysisData) {
    // Mock individual export by generating the global report of just this one capture inside a synthetic "link"
    const mockLink = {
        active: true,
        clicks: 1,
        captures: [capture]
    };
    return generateGlobalPDF([mockLink]);
}
