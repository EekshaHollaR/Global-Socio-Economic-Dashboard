from fpdf import FPDF
import os
import datetime
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ResearchReportGenerator(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'Crisis Analysis - Research & Evaluation Report', 0, 1, 'C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def chapter_title(self, title):
        self.set_font('Arial', 'B', 12)
        self.set_fill_color(200, 220, 255)
        self.cell(0, 10, title, 0, 1, 'L', 1)
        self.ln(4)

    def chapter_body(self, body):
        self.set_font('Arial', '', 10)
        self.multi_cell(0, 5, body)
        self.ln()

    def add_image(self, image_path, w=150):
        if image_path and os.path.exists(image_path):
            self.image(image_path, w=w, x=(210-w)/2) # Center image
            self.ln(5)
        else:
            self.set_text_color(255, 0, 0)
            self.cell(0, 10, f"Image not found: {image_path}", 0, 1)
            self.set_text_color(0, 0, 0)

    def add_table(self, data_dict):
        self.set_font('Arial', 'B', 10)
        # Header
        self.cell(40, 7, 'Metric', 1)
        for model in data_dict.keys():
             self.cell(35, 7, model[:10], 1) # Truncate name if too long
        self.ln()
        
        # Rows
        self.set_font('Arial', '', 10)
        metrics = list(next(iter(data_dict.values())).keys()) if data_dict else []
        
        for metric in metrics:
            self.cell(40, 7, metric, 1)
            for model in data_dict.keys():
                val = data_dict[model].get(metric, 'N/A')
                self.cell(35, 7, str(val), 1)
            self.ln()
        self.ln()

def generate_report(results, dataset_stats, plots, output_dir='supabase/research/reports'):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"Research_Report_{timestamp}.pdf"
    filepath = os.path.join(output_dir, filename)
    
    pdf = ResearchReportGenerator()
    pdf.add_page()
    
    # 1. Introduction
    pdf.chapter_title("1. Introduction")
    pdf.chapter_body(f"This report contains the results of the automated research and evaluation pipeline executed on {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}.\n"
                     "The analysis includes model performance comparison, feature explainability (SHAP), dataset quality checks, and stress testing.")
    
    # 2. Dataset Analysis
    pdf.chapter_title("2. Dataset Analysis")
    pdf.chapter_body("Summary statistics of the dataset used for evaluation:")
    
    # Stats
    pdf.set_font('Arial', '', 10)
    for k, v in dataset_stats.items():
        pdf.cell(50, 7, f"{k}:", 0)
        pdf.cell(0, 7, str(v), 0, 1)
    pdf.ln()
    
    if 'missing_values' in plots:
        pdf.add_image(plots['missing_values'])
        
    if 'distributions' in plots:
        pdf.chapter_body("Feature Distributions (Top 5):")
        for dist_plot in plots['distributions']:
            pdf.add_image(dist_plot, w=120)

    # 3. Model Comparison
    pdf.chapter_title("3. Model Performance Comparison")
    pdf.chapter_body("Comparison of multiple machine learning models on the crisis dataset.")
    pdf.add_table(results)
    
    # 4. Explainability
    pdf.chapter_title("4. Feature Importance & Explainability")
    pdf.chapter_body("SHAP (SHapley Additive exPlanations) analysis for the best performing model.")
    
    if 'shap_summary' in plots:
        pdf.add_image(plots['shap_summary'])
        
    if 'shap_importance' in plots:
        pdf.add_image(plots['shap_importance'])
        
    if 'correlation' in plots:
        pdf.chapter_body("Feature Correlation Heatmap:")
        pdf.add_image(plots['correlation'])

    # 5. Stress Testing
    pdf.chapter_title("5. Stress Testing & Sensitivity Analysis")
    pdf.chapter_body("Simulation of 'What-If' scenarios using a shadow model.")
    
    if 'stress_tests' in plots:
        for test_plot in plots['stress_tests']:
            pdf.add_image(test_plot)
            
    if 'sensitivity' in plots:
        for sens_plot in plots['sensitivity']:
            pdf.add_image(sens_plot)

    pdf.output(filepath)
    logger.info(f"Report generated successfully: {filepath}")
    return filepath
