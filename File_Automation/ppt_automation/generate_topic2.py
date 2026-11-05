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
p2.text = "Topic 2: Fundamental Theorem of Algebra"
p2.font.size = Pt(20)
p2.font.color.rgb = TEAL_ACCENT
p2.space_before = Pt(15)

# -------------------------------------------------------------
# SLIDE 2: Topic 2 - Fundamental Theorem of Algebra
# -------------------------------------------------------------
slide2 = prs.slides.add_slide(slide_layout)

# Slide Header
header_box = slide2.shapes.add_textbox(Inches(0.8), Inches(0.6), Inches(11.733), Inches(1.0))
tf2_header = header_box.text_frame
tf2_header.word_wrap = True

p_head = tf2_header.paragraphs[0]
p_head.text = "2. Fundamental Theorem of Algebra"
p_head.font.size = Pt(32)
p_head.font.bold = True
p_head.font.color.rgb = DARK_NAVY

# Left Column: Definition & Implications
left_box = slide2.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0))
tf_left = left_box.text_frame
tf_left.word_wrap = True

p_def_title = tf_left.paragraphs[0]
p_def_title.text = "Statement & Implications"
p_def_title.font.size = Pt(20)
p_def_title.font.bold = True
p_def_title.font.color.rgb = TEAL_ACCENT

p_def_body = tf_left.add_paragraph()
p_def_body.text = (
    "Statement:\n"
    "Every non-zero, single-variable polynomial of degree n with complex coefficients "
    "has exactly n complex roots (counted with multiplicities).\n\n"
    "Key Implications:\n"
    "• A degree n equation has neither more nor fewer than n roots.\n"
    "• Roots can be complex numbers (real numbers form a subset).\n"
    "• For real coefficients, non-real complex roots always occur in conjugate pairs (a ± bi)."
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
p_ex1.text = "Example 1: Quadratic Equation (Degree 2)"
p_ex1.font.size = Pt(16)
p_ex1.font.bold = True
p_ex1.font.color.rgb = DARK_NAVY
p_ex1.space_before = Pt(10)

p_ex1_body = tf_right.add_paragraph()
p_ex1_body.text = (
    "Equation: x² + 1 = 0 (Degree n = 2)\n"
    "Roots: x = i and x = -i\n"
    "Conclusion: Exactly 2 complex roots confirmed."
)
p_ex1_body.font.size = Pt(14)
p_ex1_body.font.color.rgb = TEXT_DARK

p_ex2 = tf_right.add_paragraph()
p_ex2.text = "Example 2: Cubic Equation (Degree 3)"
p_ex2.font.size = Pt(16)
p_ex2.font.bold = True
p_ex2.font.color.rgb = DARK_NAVY
p_ex2.space_before = Pt(12)

p_ex2_body = tf_right.add_paragraph()
p_ex2_body.text = (
    "Equation: x³ - 8 = 0 (Degree n = 3)\n"
    "Factored: (x - 2)(x² + 2x + 4) = 0\n"
    "Roots:\n"
    "  • Real root: x = 2\n"
    "  • Complex conjugates: x = -1 ± i√3\n"
    "Conclusion: Total of 3 complex roots."
)
p_ex2_body.font.size = Pt(14)
p_ex2_body.font.color.rgb = TEXT_DARK

# Save presentation using absolute path
output_path = os.path.join(os.getcwd(), "Algebra_Assignment_Topic2.pptx")
prs.save(output_path)
print(f"Presentation generated successfully at: {output_path}")