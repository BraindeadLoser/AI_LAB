import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

# Initialize Presentation
prs = Presentation()

# Set standard 16:9 widescreen dimensions
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# Color Palette
DARK_NAVY = RGBColor(24, 43, 73)
TEAL_ACCENT = RGBColor(0, 150, 136)
TEXT_DARK = RGBColor(40, 40, 40)

# -------------------------------------------------------------
# SLIDE 1: Title Slide
# -------------------------------------------------------------
slide_layout = prs.slide_layouts[6]  # Blank layout
slide1 = prs.slides.add_slide(slide_layout)

title_box = slide1.shapes.add_textbox(Inches(1.0), Inches(2.5), Inches(11.333), Inches(2.5))
tf1 = title_box.text_frame
tf1.word_wrap = True

p1 = tf1.paragraphs[0]
p1.text = "Polynomial Equations & Roots"
p1.font.size = Pt(44)
p1.font.bold = True
p1.font.color.rgb = DARK_NAVY
p1.alignment = PP_ALIGN.LEFT

p2 = tf1.add_paragraph()
p2.text = "Multiple Roots • Fundamental Theorem of Algebra • Roots & Coefficients"
p2.font.size = Pt(20)
p2.font.color.rgb = TEAL_ACCENT
p2.space_before = Pt(15)

# -------------------------------------------------------------
# SLIDE 2: Topic 1 - Multiple Roots
# -------------------------------------------------------------
slide2 = prs.slides.add_slide(slide_layout)

# Slide Header
header_box = slide2.shapes.add_textbox(Inches(0.8), Inches(0.6), Inches(11.733), Inches(1.0))
tf2_header = header_box.text_frame
tf2_header.word_wrap = True

p_head = tf2_header.paragraphs[0]
p_head.text = "1. Multiple Roots"
p_head.font.size = Pt(32)
p_head.font.bold = True
p_head.font.color.rgb = DARK_NAVY

# Left Column: Definition & Properties
left_box = slide2.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0))
tf_left = left_box.text_frame
tf_left.word_wrap = True

p_def_title = tf_left.paragraphs[0]
p_def_title.text = "Definition & Concept"
p_def_title.font.size = Pt(20)
p_def_title.font.bold = True
p_def_title.font.color.rgb = TEAL_ACCENT

p_def_body = tf_left.add_paragraph()
p_def_body.text = (
    "A root α of f(x) = 0 is a multiple root of multiplicity k (k > 1) "
    "if f(x) is divisible by (x - α)^k, but not by (x - α)^(k+1).\n\n"
    "• Multiplicity k = 2: Double Root\n"
    "• Multiplicity k = 3: Triple Root\n\n"
    "Derivative Rule:\n"
    "If α is a root of f(x) = 0 with multiplicity k, then α is also a root "
    "of the derivative f'(x) = 0 with multiplicity k - 1.\n\n"
    "Key Condition: α is a multiple root if f(α) = 0 AND f'(α) = 0."
)
p_def_body.font.size = Pt(14)
p_def_body.font.color.rgb = TEXT_DARK
p_def_body.space_before = Pt(10)

# Right Column: Worked Examples
right_box = slide2.shapes.add_textbox(Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0))
tf_right = right_box.text_frame
tf_right.word_wrap = True

p_ex_title = tf_right.paragraphs[0]
p_ex_title.text = "Worked Examples"
p_ex_title.font.size = Pt(20)
p_ex_title.font.bold = True
p_ex_title.font.color.rgb = TEAL_ACCENT

p_ex1 = tf_right.add_paragraph()
p_ex1.text = "Example 1: Factorization Method"
p_ex1.font.size = Pt(16)
p_ex1.font.bold = True
p_ex1.font.color.rgb = DARK_NAVY
p_ex1.space_before = Pt(10)

p_ex1_body = tf_right.add_paragraph()
p_ex1_body.text = (
    "Equation: f(x) = x³ - 5x² + 8x - 4 = 0\n"
    "Factored Form: (x - 1)(x - 2)² = 0\n"
    "Roots:\n"
    "  • x = 1 (Simple root, multiplicity 1)\n"
    "  • x = 2 (Double root, multiplicity 2)"
)
p_ex1_body.font.size = Pt(14)
p_ex1_body.font.color.rgb = TEXT_DARK

p_ex2 = tf_right.add_paragraph()
p_ex2.text = "Example 2: Derivative Verification"
p_ex2.font.size = Pt(16)
p_ex2.font.bold = True
p_ex2.font.color.rgb = DARK_NAVY
p_ex2.space_before = Pt(12)

p_ex2_body = tf_right.add_paragraph()
p_ex2_body.text = (
    "Equation: f(x) = x³ - 3x + 2 = 0\n"
    "Derivative: f'(x) = 3x² - 3 = 3(x - 1)(x + 1)\n"
    "Testing x = 1:\n"
    "  • f(1) = (1)³ - 3(1) + 2 = 0\n"
    "  • f'(1) = 3(1)² - 3 = 0\n"
    "Conclusion: x = 1 is a multiple (double) root."
)
p_ex2_body.font.size = Pt(14)
p_ex2_body.font.color.rgb = TEXT_DARK

# Save presentation using absolute path in current working directory
output_path = os.path.join(os.getcwd(), "Algebra_Assignment.pptx")
prs.save(output_path)
print(f"Presentation generated successfully at: {output_path}")