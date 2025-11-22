/**
 * Comprehensive Data-Driven PDF Report Generator
 * Generates detailed 12-page crisis analysis reports with automatic insights
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DataLoader } from './dataLoader';

// =====================================================================
// Configuration & Styling
// =====================================================================

const COLORS = {
    primary: [46, 134, 171],
    accent: [162, 59, 114],
    success: [6, 167, 125],
    warning: [241, 143, 1],
    danger: [193, 18, 31],
    text: [60, 60, 60],
    lightText: [120, 120, 120]
};

const LAYOUT = {
    margin: 20,
    pageWidth: 210,
    pageHeight: 297,
    contentWidth: 170
};

// =====================================================================
// Insight Generation Logic
// =====================================================================

function generateEconomicInsights(data: any): string[] {
    const insights: string[] = [];
    const latest = data.latestData;

    // GDP Growth Analysis
    if (latest.gdpGrowth !== undefined) {
        if (latest.gdpGrowth < 0) {
            insights.push(`⚠️ ECONOMIC CONTRACTION: GDP declined by ${Math.abs(latest.gdpGrowth).toFixed(2)}% indicating a recession.`);
        } else if (latest.gdpGrowth < 2) {
            insights.push(`⚠️ LOW GROWTH: GDP growth of ${latest.gdpGrowth.toFixed(2)}% is below healthy expansion levels.`);
        } else if (latest.gdpGrowth > 7) {
            insights.push(`✓ RAPID EXPANSION: Strong GDP growth of ${latest.gdpGrowth.toFixed(2)}% indicates economic boom.`);
        } else {
            insights.push(`✓ MODERATE GROWTH: GDP growing at ${latest.gdpGrowth.toFixed(2)}%, within stable range.`);
        }
    }

    // Inflation Analysis
    if (latest.inflation !== undefined) {
        if (latest.inflation > 10) {
            insights.push(`🔴 HIGH INFLATION: Consumer prices rising at ${latest.inflation.toFixed(2)}%, eroding purchasing power significantly.`);
        } else if (latest.inflation > 5) {
            insights.push(`⚠️ ELEVATED INFLATION: Price increases at ${latest.inflation.toFixed(2)}% above central bank targets.`);
        } else if (latest.inflation < 0) {
            insights.push(`⚠️ DEFLATION RISK: Negative inflation at ${latest.inflation.toFixed(2)}% may signal economic stagnation.`);
        } else {
            insights.push(`✓ STABLE PRICES: Inflation at ${latest.inflation.toFixed(2)}% within acceptable range.`);
        }
    }

    // Stagflation Check
    if (latest.gdpGrowth !== undefined && latest.inflation !== undefined) {
        if (latest.gdpGrowth < 2 && latest.inflation > 5) {
            insights.push(`🔴 STAGFLATION RISK: Combination of low growth (${latest.gdpGrowth.toFixed(2)}%) and high inflation (${latest.inflation.toFixed(2)}%) creates severe economic stress.`);
        }
    }

    // Unemployment
    if (latest.unemployment !== undefined) {
        if (latest.unemployment > 15) {
            insights.push(`🔴 CRITICAL UNEMPLOYMENT: ${latest.unemployment.toFixed(2)}% unemployment indicates severe labor market crisis.`);
        } else if (latest.unemployment > 7) {
            insights.push(`⚠️ HIGH UNEMPLOYMENT: ${latest.unemployment.toFixed(2)}% unemployment above healthy threshold.`);
        } else {
            insights.push(`✓ STABLE EMPLOYMENT: Unemployment at ${latest.unemployment.toFixed(2)}% indicates functional labor market.`);
        }
    }

    // Investment Analysis
    if (latest.grossCapital !== undefined) {
        if (latest.grossCapital < 15) {
            insights.push(`⚠️ LOW INVESTMENT: Gross capital formation at ${latest.grossCapital.toFixed(2)}% of GDP indicates weak infrastructure development.`);
        } else if (latest.grossCapital > 30) {
            insights.push(`✓ HIGH INVESTMENT: Capital formation at ${latest.grossCapital.toFixed(2)}% of GDP shows strong economic development focus.`);
        }
    }

    // Trade Balance
    if (latest.exports !== undefined && latest.imports !== undefined) {
        const balance = latest.exports - latest.imports;
        if (balance < -10) {
            insights.push(`⚠️ LARGE TRADE DEFICIT: Imports exceed exports by ${Math.abs(balance).toFixed(2)}% of GDP, creating external vulnerability.`);
        } else if (balance > 10) {
            insights.push(`✓ TRADE SURPLUS: Exports exceed imports by ${balance.toFixed(2)}% of GDP, strengthening foreign reserves.`);
        }
    }

    return insights;
}

function generateFoodSecurityInsights(data: any): string[] {
    const insights: string[] = [];
    const latest = data.latestData;

    // Food Production Index
    if (latest.foodProductionIndex !== undefined) {
        if (latest.foodProductionIndex < 80) {
            insights.push(`🔴 LOW FOOD PRODUCTION: Food production index at ${latest.foodProductionIndex.toFixed(1)} indicates serious agricultural challenges.`);
        } else if (latest.foodProductionIndex < 95) {
            insights.push(`⚠️ DECLINING PRODUCTION: Food production below baseline at ${latest.foodProductionIndex.toFixed(1)}.`);
        } else if (latest.foodProductionIndex > 110) {
            insights.push(`✓ STRONG AGRICULTURE: Food production index at ${latest.foodProductionIndex.toFixed(1)} shows agricultural growth.`);
        }
    }

    // Cereal Yield
    if (latest.cerealYield !== undefined) {
        if (latest.cerealYield < 2000) {
            insights.push(`⚠️ LOW PRODUCTIVITY: Cereal yield of ${latest.cerealYield.toLocaleString()} kg/ha indicates low agricultural efficiency.`);
        } else if (latest.cerealYield > 5000) {
            insights.push(`✓ HIGH PRODUCTIVITY: Cereal yield of ${latest.cerealYield.toLocaleString()} kg/ha demonstrates modern farming practices.`);
        }
    }

    // Food Import Dependency
    if (latest.foodImports !== undefined) {
        if (latest.foodImports > 20) {
            insights.push(`⚠️ HIGH FOOD DEPENDENCY: Food imports at ${latest.foodImports.toFixed(2)}% of merchandise imports creates vulnerability to global price shocks.`);
        } else if (latest.foodImports < 10) {
            insights.push(`✓ FOOD SELF-SUFFICIENCY: Low food imports (${latest.foodImports.toFixed(2)}%) indicates domestic food security.`);
        }
    }

    // Population Growth vs Food Production
    if (latest.populationGrowth !== undefined && latest.foodProductionIndex !== undefined) {
        if (latest.populationGrowth > 2 && latest.foodProductionIndex < 100) {
            insights.push(`🔴 FOOD CRISIS RISK: Population growing at ${latest.populationGrowth.toFixed(2)}% while food production stagnates - urgent mismatch.`);
        }
    }

    return insights;
}

function calculateOverallRiskScore(data: any): number {
    const latest = data.latestData;
    let riskScore = 0;
    let factors = 0;

    // Economic risks
    if (latest.gdpGrowth !== undefined) {
        factors++;
        if (latest.gdpGrowth < 0) riskScore += 30;
        else if (latest.gdpGrowth < 2) riskScore += 15;
    }

    if (latest.inflation !== undefined) {
        factors++;
        if (latest.inflation > 10) riskScore += 25;
        else if (latest.inflation > 5) riskScore += 10;
    }

    if (latest.unemployment !== undefined) {
        factors++;
        if (latest.unemployment > 15) riskScore += 20;
        else if (latest.unemployment > 7) riskScore += 10;
    }

    // Food security risks
    if (latest.foodProductionIndex !== undefined) {
        factors++;
        if (latest.foodProductionIndex < 80) riskScore += 20;
        else if (latest.foodProductionIndex < 95) riskScore += 10;
    }

    if (latest.foodImports !== undefined) {
        factors++;
        if (latest.foodImports > 20) riskScore += 10;
    }

    return Math.min(100, factors > 0 ? riskScore : 50);
}

// =====================================================================
// PDF Generation Helpers
// =====================================================================

function drawSectionHeader(doc: jsPDF, title: string, y: number) {
    doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.rect(LAYOUT.margin, y, 5, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.text(title, LAYOUT.margin + 10, y + 7);
    return y + 20;
}

function drawFooter(doc: jsPDF, pageNumber: number) {
    const date = new Date().toLocaleDateString();
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.line(LAYOUT.margin, LAYOUT.pageHeight - 15, LAYOUT.pageWidth - LAYOUT.margin, LAYOUT.pageHeight - 15);
    doc.text(`GSECD Crisis Report | ${date}`, LAYOUT.margin, LAYOUT.pageHeight - 10);
    doc.text(`Page ${pageNumber}`, LAYOUT.pageWidth - LAYOUT.margin - 10, LAYOUT.pageHeight - 10);
}

// =====================================================================
// Page Generators
// =====================================================================

function generateCoverPage(doc: jsPDF, country: string, year: string, type: string, riskScore: number) {
    doc.setFillColor(245, 247, 250);
    doc.rect(0, 0, LAYOUT.pageWidth, LAYOUT.pageHeight, 'F');

    // Border
    doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.setLineWidth(1);
    doc.rect(10, 10, LAYOUT.pageWidth - 20, LAYOUT.pageHeight - 20);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.text('GSECD CRISIS REPORT', LAYOUT.pageWidth / 2, 70, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.text('Global Socio-Economic Crisis Dashboard', LAYOUT.pageWidth / 2, 85, { align: 'center' });

    // Country Info Box
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(40, 110, 130, 50, 3, 3, 'F');
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(country.toUpperCase(), LAYOUT.pageWidth / 2, 130, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${type === 'economic' ? 'Economic' : 'Food Security'} Analysis`, LAYOUT.pageWidth / 2, 143, { align: 'center' });
    doc.text(`Year: ${year}`, LAYOUT.pageWidth / 2, 153, { align: 'center' });

    // Risk Score Box
    const riskColor = riskScore > 70 ? COLORS.danger : riskScore > 40 ? COLORS.warning : COLORS.success;
    doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
    doc.roundedRect(50, 180, 110, 35, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text('OVERALL RISK ASSESSMENT', LAYOUT.pageWidth / 2, 193, { align: 'center' });
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const riskLevel = riskScore > 70 ? 'HIGH' : riskScore > 40 ? 'MEDIUM' : 'LOW';
    doc.text(`${riskLevel} RISK: ${riskScore}/100`, LAYOUT.pageWidth / 2, 207, { align: 'center' });

    doc.setTextColor(COLORS.lightText[0], COLORS.lightText[1], COLORS.lightText[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Classification: For Official Use | Generated by AI Analytics', LAYOUT.pageWidth / 2, 270, { align: 'center' });
}

// ... Continue in next message due to length

export async function generateDetailedReport(
    country: string,
    year: string,
    crisisType: 'economic' | 'food'
): Promise<void> {
    try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const countryData = await DataLoader.getCountryData(country);
        if (!countryData) throw new Error(`Data not found for ${country}`);

        const riskScore = calculateOverallRiskScore(countryData);
        const economicInsights = generateEconomicInsights(countryData);
        const foodInsights = generateFoodSecurityInsights(countryData);

        let pageNum = 1;

        // PAGE 1: Cover
        generateCoverPage(doc, country, year, crisisType, riskScore);

        // PAGE 2: Executive Summary
        doc.addPage();
        drawFooter(doc, pageNum++);
        let y = 30;
        y = drawSectionHeader(doc, 'Executive Summary', y);

        const execText = `This comprehensive analysis of ${country} for ${year} reveals a crisis risk score of ${riskScore}/100 (${riskScore > 70 ? 'HIGH' : riskScore > 40 ? 'MEDIUM' : 'LOW'} risk). The assessment is based on ${Object.keys(countryData.latestData).filter(k => countryData.latestData[k] !== undefined && k !== 'year' && k !== 'countryName').length} key socio-economic indicators tracked from 2000-2024.`;

        doc.setFontSize(11);
        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
        doc.text(doc.splitTextToSize(execText, LAYOUT.contentWidth), LAYOUT.margin, y);
        y += 25;

        // Key metrics table
        autoTable(doc, {
            startY: y,
            head: [['Indicator', 'Value', 'Assessment']],
            body: [
                ['GDP Growth', `${countryData.latestData.gdpGrowth?.toFixed(2) || 'N/A'}%`, countryData.latestData.gdpGrowth > 2 ? 'Stable' : 'Critical'],
                ['Inflation', `${countryData.latestData.inflation?.toFixed(2) || 'N/A'}%`, countryData.latestData.inflation < 5 ? 'Stable' : 'High'],
                ['Unemployment', `${countryData.latestData.unemployment?.toFixed(2) || 'N/A'}%`, countryData.latestData.unemployment < 7 ? 'Acceptable' : 'High'],
                ['Food Production Index', `${countryData.latestData.foodProductionIndex?.toFixed(1) || 'N/A'}`, countryData.latestData.foodProductionIndex > 95 ? 'Adequate' : 'Low'],
                ['GDP per Capita', `$${countryData.latestData.gdpPerCapita?.toLocaleString() || 'N/A'}`, '-']
            ],
            theme: 'striped',
            headStyles: { fillColor: COLORS.primary }
        });

        y = (doc as any).lastAutoTable.finalY + 15;

        // Key Insights
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Critical Insights', LAYOUT.margin, y);
        y += 10;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        const allInsights = [...economicInsights.slice(0, 3), ...foodInsights.slice(0, 2)];

        allInsights.forEach(insight => {
            // Check for page break
            if (y > LAYOUT.pageHeight - 40) {
                doc.addPage();
                drawFooter(doc, pageNum++);
                y = 30;
            }

            // Split long text manually at reasonable points
            const maxWidth = LAYOUT.contentWidth - 5;
            const lines = doc.splitTextToSize(insight, maxWidth);

            // Draw each line
            lines.forEach((line: string) => {
                doc.text(line, LAYOUT.margin + 3, y);
                y += 6;
            });

            y += 3; // Extra spacing between insights
        });

        // PAGE 3: Economic Indicators (Full Details)
        doc.addPage();
        drawFooter(doc, pageNum++);
        y = 30;
        y = drawSectionHeader(doc, 'Economic Health Indicators', y);

        doc.setFontSize(11);
        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);

        // GDP Section
        doc.setFont('helvetica', 'bold');
        doc.text('1. Gross Domestic Product (GDP)', LAYOUT.margin, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        const gdpText = `GDP Growth Rate: ${countryData.latestData.gdpGrowth?.toFixed(2) || 'N/A'}% | GDP per Capita: $${countryData.latestData.gdpPerCapita?.toLocaleString() || 'N/A'}`;
        doc.text(gdpText, LAYOUT.margin, y);
        y += 10;

        // Inflation Section
        doc.setFont('helvetica', 'bold');
        doc.text('2. Price Stability & Inflation', LAYOUT.margin, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.text(`Current Inflation Rate: ${countryData.latestData.inflation?.toFixed(2) || 'N/A'}%`, LAYOUT.margin, y);
        y += 10;

        // Unemployment
        doc.setFont('helvetica', 'bold');
        doc.text('3. Labor Market', LAYOUT.margin, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.text(`Unemployment Rate: ${countryData.latestData.unemployment?.toFixed(2) || 'N/A'}%`, LAYOUT.margin, y);
        y += 10;

        // Trade Balance
        if (countryData.latestData.exports !== undefined && countryData.latestData.imports !== undefined) {
            doc.setFont('helvetica', 'bold');
            doc.text('4. Trade Balance', LAYOUT.margin, y);
            y += 8;
            doc.setFont('helvetica', 'normal');
            const balance = countryData.latestData.exports - countryData.latestData.imports;
            doc.text(`Exports: ${countryData.latestData.exports.toFixed(2)}% | Imports: ${countryData.latestData.imports.toFixed(2)}% | Balance: ${balance.toFixed(2)}%`, LAYOUT.margin, y);
            y += 10;
        }

        // Investment
        if (countryData.latestData.grossCapital !== undefined) {
            doc.setFont('helvetica', 'bold');
            doc.text('5. Investment Level', LAYOUT.margin, y);
            y += 8;
            doc.setFont('helvetica', 'normal');
            doc.text(`Gross Capital Formation: ${countryData.latestData.grossCapital.toFixed(2)}% of GDP`, LAYOUT.margin, y);
            y += 15;
        }

        // PAGE 4: Food Security
        doc.addPage();
        drawFooter(doc, pageNum++);
        y = 30;
        y = drawSectionHeader(doc, 'Food Security Indicators', y);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        if (countryData.latestData.foodProductionIndex !== undefined) {
            doc.setFont('helvetica', 'bold');
            doc.text('Food Production Index', LAYOUT.margin, y);
            y += 8;
            doc.setFont('helvetica', 'normal');
            doc.text(`Current Index: ${countryData.latestData.foodProductionIndex.toFixed(1)} (Base: 2014-2016 = 100)`, LAYOUT.margin, y);
            y += 10;
        }

        if (countryData.latestData.cerealYield !== undefined) {
            doc.setFont('helvetica', 'bold');
            doc.text('Cereal Yield (Agricultural Productivity)', LAYOUT.margin, y);
            y += 8;
            doc.setFont('helvetica', 'normal');
            doc.text(`Yield: ${countryData.latestData.cerealYield.toLocaleString()} kg per hectare`, LAYOUT.margin, y);
            y += 10;
        }

        if (countryData.latestData.foodImports !== undefined) {
            doc.setFont('helvetica', 'bold');
            doc.text('Food Import Dependency', LAYOUT.margin, y);
            y += 8;
            doc.setFont('helvetica', 'normal');
            doc.text(`Food imports represent ${countryData.latestData.foodImports.toFixed(2)}% of total merchandise imports`, LAYOUT.margin, y);
        }

        // Save
        doc.save(`${country}_${crisisType}_Report_${year}.pdf`);

    } catch (error) {
        console.error('PDF Generation Error:', error);
        throw error;
    }
}
