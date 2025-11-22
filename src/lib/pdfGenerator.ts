/**
 * PDF Report Generator for Crisis Analyzer
 * Generates professional PDF reports with crisis analysis results
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CrisisResult } from './crisisAnalysis';

// =====================================================================
// PDF Configuration
// =====================================================================

const PDF_CONFIG = {
    format: 'a4' as const,
    orientation: 'portrait' as const,
    unit: 'mm' as const,
    margin: 20,
    lineHeight: 7,
    pageWidth: 210,
    pageHeight: 297,
};

// =====================================================================
// Helper Functions
// =====================================================================

function addHeader(doc: jsPDF, title: string, pageNumber: number) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(title, PDF_CONFIG.margin, 10);
    doc.text(`Page ${pageNumber}`, PDF_CONFIG.pageWidth - PDF_CONFIG.margin - 15, 10);
}

function addFooter(doc: jsPDF) {
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
        `Generated on ${date} | Crisis Analyzer Report`,
        PDF_CONFIG.pageWidth / 2,
        PDF_CONFIG.pageHeight - 10,
        { align: 'center' }
    );
}

// =====================================================================
// Main PDF Generation Function
// =====================================================================

export async function generateCrisisReport(
    results: CrisisResult[],
    crisisType: 'economic' | 'food',
    year: string
): Promise<void> {
    try {
        const doc = new jsPDF({
            orientation: PDF_CONFIG.orientation,
            unit: PDF_CONFIG.unit,
            format: PDF_CONFIG.format,
        });

        let yPosition = PDF_CONFIG.margin;
        let pageNumber = 1;

        // ===================================================================
        // TITLE PAGE
        // ===================================================================

        // Title
        doc.setFontSize(28);
        doc.setTextColor(0, 0, 0);
        doc.text('Crisis Analysis Report', PDF_CONFIG.pageWidth / 2, 60, { align: 'center' });

        // Crisis Type
        doc.setFontSize(18);
        doc.setTextColor(60, 60, 60);
        const crisisTypeText = crisisType === 'economic' ? 'Economic Crisis' : 'Food Crisis';
        doc.text(crisisTypeText, PDF_CONFIG.pageWidth / 2, 75, { align: 'center' });

        // Year
        doc.setFontSize(14);
        doc.text(`Analysis Year: ${year}`, PDF_CONFIG.pageWidth / 2, 85, { align: 'center' });

        // Summary Box
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(30, 110, 150, 60, 3, 3, 'FD');

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Executive Summary', PDF_CONFIG.pageWidth / 2, 120, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(`Total Countries Analyzed: ${results.length}`, PDF_CONFIG.pageWidth / 2, 132, { align: 'center' });

        const avgRisk = (results.reduce((sum, r) => sum + r.probability, 0) / results.length).toFixed(1);
        doc.text(`Average Risk Level: ${avgRisk}%`, PDF_CONFIG.pageWidth / 2, 142, { align: 'center' });

        const criticalCount = results.filter(r => r.probability > 80).length;
        doc.text(`Critical Risk Countries: ${criticalCount}`, PDF_CONFIG.pageWidth / 2, 152, { align: 'center' });

        // Date
        const reportDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Report Generated: ${reportDate}`, PDF_CONFIG.pageWidth / 2, 190, { align: 'center' });

        // ===================================================================
        // DETAILED RESULTS
        // ===================================================================

        doc.addPage();
        pageNumber++;
        yPosition = PDF_CONFIG.margin + 10;

        addHeader(doc, `${crisisTypeText} Analysis Report`, pageNumber);

        // Section Title
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Detailed Country Analysis', PDF_CONFIG.margin, yPosition);
        yPosition += 10;

        // Sort results by probability (highest first)
        const sortedResults = [...results].sort((a, b) => b.probability - a.probability);

        for (let i = 0; i < sortedResults.length; i++) {
            const result = sortedResults[i];

            // Check if we need a new page
            if (yPosition > PDF_CONFIG.pageHeight - 60) {
                addFooter(doc);
                doc.addPage();
                pageNumber++;
                yPosition = PDF_CONFIG.margin + 10;
                addHeader(doc, `${crisisTypeText} Analysis Report`, pageNumber);
            }

            // Country Header
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text(`${i + 1}. ${result.country}`, PDF_CONFIG.margin, yPosition);
            yPosition += 8;

            // Risk Level Box
            const riskColor = result.probability > 80 ? [220, 38, 38] :
                result.probability > 65 ? [249, 115, 22] : [234, 179, 8];
            doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
            doc.setDrawColor(riskColor[0], riskColor[1], riskColor[2]);
            doc.roundedRect(PDF_CONFIG.margin, yPosition, 40, 10, 2, 2, 'FD');

            doc.setFontSize(12);
            doc.setTextColor(255, 255, 255);
            doc.text(`${result.probability.toFixed(1)}%`, PDF_CONFIG.margin + 20, yPosition + 7, { align: 'center' });

            // Classification
            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
            doc.text(result.classification, PDF_CONFIG.margin + 45, yPosition + 7);
            yPosition += 15;

            // Top Indicators
            if (result.topIndicators && result.topIndicators.length > 0) {
                doc.setFontSize(11);
                doc.setTextColor(0, 0, 0);
                doc.text('Key Contributing Indicators:', PDF_CONFIG.margin + 5, yPosition);
                yPosition += 6;

                doc.setFontSize(9);
                doc.setTextColor(60, 60, 60);

                const indicatorsToShow = result.topIndicators.slice(0, 5);
                for (const indicator of indicatorsToShow) {
                    if (yPosition > PDF_CONFIG.pageHeight - 40) {
                        addFooter(doc);
                        doc.addPage();
                        pageNumber++;
                        yPosition = PDF_CONFIG.margin + 10;
                        addHeader(doc, `${crisisTypeText} Analysis Report`, pageNumber);
                    }

                    doc.text(
                        `• ${indicator.name}: ${indicator.value.toFixed(2)} (Impact: ${indicator.impact.toFixed(3)})`,
                        PDF_CONFIG.margin + 10,
                        yPosition
                    );
                    yPosition += 5;
                }
            }

            yPosition += 8;

            // Separator line
            doc.setDrawColor(220, 220, 220);
            doc.line(PDF_CONFIG.margin, yPosition, PDF_CONFIG.pageWidth - PDF_CONFIG.margin, yPosition);
            yPosition += 10;
        }

        // ===================================================================
        // SUMMARY STATISTICS PAGE
        // ===================================================================

        addFooter(doc);
        doc.addPage();
        pageNumber++;
        yPosition = PDF_CONFIG.margin + 10;

        addHeader(doc, `${crisisTypeText} Analysis Report`, pageNumber);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Summary Statistics', PDF_CONFIG.margin, yPosition);
        yPosition += 15;

        // Statistics boxes
        const stats = [
            { label: 'Total Countries at Risk', value: results.length.toString() },
            { label: 'Average Risk Probability', value: `${avgRisk}%` },
            { label: 'Critical Risk (>80%)', value: criticalCount.toString() },
            { label: 'High Risk (65-80%)', value: results.filter(r => r.probability > 65 && r.probability <= 80).length.toString() },
            { label: 'Moderate Risk (50-65%)', value: results.filter(r => r.probability >= 50 && r.probability <= 65).length.toString() },
        ];

        stats.forEach((stat, index) => {
            doc.setFillColor(245, 245, 245);
            doc.setDrawColor(200, 200, 200);
            doc.roundedRect(PDF_CONFIG.margin, yPosition, 170, 15, 2, 2, 'FD');

            doc.setFontSize(11);
            doc.setTextColor(60, 60, 60);
            doc.text(stat.label, PDF_CONFIG.margin + 5, yPosition + 6);

            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text(stat.value, PDF_CONFIG.pageWidth - PDF_CONFIG.margin - 5, yPosition + 10, { align: 'right' });

            yPosition += 20;
        });

        // ===================================================================
        // CHARTS
        // ===================================================================

        yPosition += 10;

        // Chart 1: Risk Distribution
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Risk Distribution', PDF_CONFIG.margin, yPosition);
        yPosition += 10;

        const riskCounts = [
            { label: 'Critical (>80%)', count: criticalCount, color: [220, 38, 38] },
            { label: 'High (65-80%)', count: results.filter(r => r.probability > 65 && r.probability <= 80).length, color: [249, 115, 22] },
            { label: 'Moderate (50-65%)', count: results.filter(r => r.probability >= 50 && r.probability <= 65).length, color: [234, 179, 8] },
            { label: 'Low (<50%)', count: results.filter(r => r.probability < 50).length, color: [34, 197, 94] }
        ];

        const maxCount = Math.max(...riskCounts.map(r => r.count));
        const chartWidth = 120;
        const barHeight = 10;

        riskCounts.forEach((risk) => {
            // Label
            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
            doc.text(risk.label, PDF_CONFIG.margin, yPosition + 6);

            // Bar
            const barWidth = maxCount > 0 ? (risk.count / maxCount) * chartWidth : 0;
            doc.setFillColor(risk.color[0], risk.color[1], risk.color[2]);
            doc.rect(PDF_CONFIG.margin + 40, yPosition, barWidth, barHeight, 'F');

            // Value
            doc.text(risk.count.toString(), PDF_CONFIG.margin + 40 + barWidth + 5, yPosition + 6);

            yPosition += 15;
        });

        // Chart 2: Top 5 Highest Risk Countries
        yPosition += 10;
        if (yPosition > PDF_CONFIG.pageHeight - 80) {
            addFooter(doc);
            doc.addPage();
            pageNumber++;
            yPosition = PDF_CONFIG.margin + 10;
            addHeader(doc, `${crisisTypeText} Analysis Report`, pageNumber);
        }

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Top 5 Highest Risk Countries', PDF_CONFIG.margin, yPosition);
        yPosition += 10;

        const top5 = sortedResults.slice(0, 5);
        top5.forEach((country) => {
            // Label
            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
            doc.text(country.country, PDF_CONFIG.margin, yPosition + 6);

            // Bar
            const barWidth = (country.probability / 100) * chartWidth;
            const riskColor = country.probability > 80 ? [220, 38, 38] :
                country.probability > 65 ? [249, 115, 22] : [234, 179, 8];

            doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
            doc.rect(PDF_CONFIG.margin + 40, yPosition, barWidth, barHeight, 'F');

            // Value
            doc.text(`${country.probability.toFixed(1)}%`, PDF_CONFIG.margin + 40 + barWidth + 5, yPosition + 6);

            yPosition += 15;
        });

        // Methodology note
        yPosition += 10;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Methodology:', PDF_CONFIG.margin, yPosition);
        yPosition += 6;

        doc.setFontSize(9);
        const methodologyText = `This analysis uses machine learning models trained on historical crisis data to predict ${crisisType} crisis probability. The model analyzes multiple economic and social indicators to generate risk assessments for each country.`;
        const splitText = doc.splitTextToSize(methodologyText, PDF_CONFIG.pageWidth - 2 * PDF_CONFIG.margin);
        doc.text(splitText, PDF_CONFIG.margin, yPosition);

        addFooter(doc);

        // ===================================================================
        // SAVE PDF
        // ===================================================================

        const filename = `crisis-report-${crisisType}-${year}-${Date.now()}.pdf`;
        doc.save(filename);

        console.log(`✅ PDF report generated: ${filename}`);

    } catch (error) {
        console.error('❌ Error generating PDF report:', error);
        throw new Error('Failed to generate PDF report');
    }
}

/**
 * Capture a chart/graph element as an image and add to PDF
 * @param elementId - ID of the HTML element to capture
 * @param doc - jsPDF document instance
 * @param yPosition - Y position to place the image
 * @returns New Y position after adding the image
 */
export async function addChartToPDF(
    elementId: string,
    doc: jsPDF,
    yPosition: number
): Promise<number> {
    try {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Element ${elementId} not found`);
            return yPosition;
        }

        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = PDF_CONFIG.pageWidth - 2 * PDF_CONFIG.margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if image fits on current page
        if (yPosition + imgHeight > PDF_CONFIG.pageHeight - PDF_CONFIG.margin) {
            doc.addPage();
            yPosition = PDF_CONFIG.margin;
        }

        doc.addImage(imgData, 'PNG', PDF_CONFIG.margin, yPosition, imgWidth, imgHeight);

        return yPosition + imgHeight + 10;

    } catch (error) {
        console.error(`Error capturing chart ${elementId}:`, error);
        return yPosition;
    }
}
